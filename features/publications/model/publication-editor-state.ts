import {applyPublicationDeletion,emptyPublicationForm,publicationForm} from './publication-editor.ts';
import type {PublicationForm,PublicationRow} from './publication-editor.ts';

export type PublicationEditorState = {
  mode:'list'|'form'; form:PublicationForm; rows:PublicationRow[]; editId:string;
  selected:string[]; search:string; order:string; message:string; failed:boolean;
  loading:boolean; busy:boolean; toggling:string; confirmId:string; removing:boolean; deleteError:string;
};
export type PublicationEditorAction = {type:'patch';value:Partial<PublicationEditorState>} |
  {type:'field';field:keyof PublicationForm;value:string|undefined} |
  {type:'deleted';ids:string[]} |
  {type:'select-row';id:string;checked:boolean} |
  {type:'status';row:PublicationRow} |
  {type:'edit';row:PublicationRow} |
  {type:'new'};
export function publicationEditorReducer(state:PublicationEditorState,action:PublicationEditorAction):PublicationEditorState {
  switch(action.type) {
    case 'patch':return {...state,...action.value};
    case 'field':return {...state,form:{...state.form,[action.field]:action.value}};
    case 'edit':return {...state,mode:'form',failed:false,editId:action.row.id,form:publicationForm(action.row),message:''};
    case 'new':return {...state,mode:'form',failed:false,editId:'',form:emptyPublicationForm(),message:''};
    case 'status':return {...state,rows:state.rows.map(row=>row.id===action.row.id?{...row,status:action.row.status}:row)};
    case 'select-row':return {...state,selected:action.checked?[...state.selected,action.id]:state.selected.filter(id=>id!==action.id)};
    case 'deleted':return {...state,...applyPublicationDeletion(state.rows,state.selected,state.editId,action.ids)};
  }
}
