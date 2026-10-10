'use client';
import {useEffect,useReducer} from 'react';
import {changePublicationStatus,deletePublications,loadPublications,savePublication} from '../api/publication-client';
import {emptyPublicationForm,matchingPublications,publicationPayload,visiblePublications} from '../model/publication-editor';
import type {PublicationForm,PublicationRow} from '../model/publication-editor';
import {publicationEditorReducer} from '../model/publication-editor-state';
import type {PublicationEditorState} from '../model/publication-editor-state';
import {deletePublicationBatches} from '../model/delete-publication-batches';

export type PublicationEditorOptions = {
  initialId?:string;initialSlug?:string;initialMode?:'list'|'form';onDone?:()=>void;onCancel?:()=>void;
};
export function usePublicationEditor({initialId='',initialSlug='',initialMode,onDone,onCancel}:PublicationEditorOptions) {
  const [state,dispatch]=useReducer(publicationEditorReducer,{
    mode:initialMode||(initialId||initialSlug?'form':'list'),form:emptyPublicationForm(),rows:[],editId:initialId,
    selected:[],search:'',order:'year',message:'',failed:false,loading:true,busy:false,toggling:'',confirmId:'',removing:false,deleteError:'',
  });
  const patch=(value:Partial<PublicationEditorState>)=>dispatch({type:'patch',value});
  async function load() {
    patch({loading:true});
    try {
      const rows=await loadPublications(onDone?{id:initialId,slug:initialSlug}:{});
      patch({rows});return rows;
    } catch(error) {
      patch({failed:true,message:error instanceof Error?error.message:'조회 실패'});return [];
    } finally {patch({loading:false})}
  }
  useEffect(()=>{
    let active=true;
    load().then(rows=>{
      if(!active)return;
      const found=rows.find(row=>initialId?row.id===initialId:false);
      if(found)dispatch({type:'edit',row:found});
    });
    return()=>{active=false};
  },[]);
  async function save() {
    patch({busy:true,failed:false,message:'저장 중...'});
    try {
      const result=await savePublication(publicationPayload(state.form,state.editId));
      patch({editId:result.data.id});await load();
      if(onDone){onDone();return}
      patch({mode:'list',message:'저장되었습니다. 게시 상태이면 홈페이지에 반영됩니다.'});
    } catch(error) {patch({failed:true,message:error instanceof Error?error.message:'저장 실패'})}
    finally {patch({busy:false})}
  }
  async function remove(ids:string[]) {
    patch({removing:true,deleteError:''});
    try {
      const warning=await deletePublicationBatches(ids,deletePublications,deleted=>dispatch({type:'deleted',ids:deleted}));
      patch({confirmId:'',message:warning});
    } catch(error) {patch({deleteError:error instanceof Error?error.message:'삭제 실패'})}
    finally {patch({removing:false})}
  }
  async function toggle(row:PublicationRow) {
    patch({toggling:row.id,message:''});
    try {
      const result=await changePublicationStatus(row.id,row.status==='published'?'draft':'published');
      dispatch({type:'status',row:{...row,status:result.data.status}});
    } catch(error) {patch({failed:true,message:error instanceof Error?error.message:'상태 변경 실패'})}
    finally {patch({toggling:''})}
  }
  return {
    state,visible:visiblePublications(state.rows,state.search,state.order),matching:matchingPublications(state.rows,state.search),
    load,save,toggle,
    edit:(row:PublicationRow)=>dispatch({type:'edit',row}),
    reset:()=>dispatch({type:'new'}),
    field:<K extends keyof PublicationForm>(field:K,value:PublicationForm[K])=>dispatch({type:'field',field,value}),
    search:(search:string)=>patch({search}),order:(order:string)=>patch({order}),
    select:(selected:string[])=>patch({selected}),
    selectRow:(id:string,checked:boolean)=>dispatch({type:'select-row',id,checked}),
    confirm:(confirmId:string)=>patch({confirmId,deleteError:''}),
    closeConfirmation:()=>patch({confirmId:''}),
    removeConfirmed:()=>remove(state.confirmId==='bulk-publications'?state.selected:[state.confirmId]),
    cancel:()=>{if(onCancel){onCancel();return}patch({mode:'list',message:''})},
  };
}
