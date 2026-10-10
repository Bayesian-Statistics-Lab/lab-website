'use client';
import {useBoardWorkspace} from './BoardWorkspace';
import ConfirmDelete from './ConfirmDelete';
import Link from 'next/link';
import {useState} from 'react';
import {useRouter,usePathname} from 'next/navigation';
export default function PostActions({id,editOnly=false,deleteOnly=false,disabled=false,onDeleted,onBusyChange}:{id:string;editOnly?:boolean;deleteOnly?:boolean;disabled?:boolean;onDeleted?:()=>void;onBusyChange?:(busy:boolean)=>void}){
 const workspace=useBoardWorkspace(),router=useRouter(),path=usePathname();
 const [error,setError]=useState(''),[busy,setBusy]=useState(false),[confirming,setConfirming]=useState(false),[deleted,setDeleted]=useState(false);
 async function remove(){if(disabled||busy)return;setBusy(true);onBusyChange?.(true);setError('');try{
  const r=await fetch('/api/board',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({id})});const j=await r.json();if(!r.ok)throw Error(j.error||'삭제하지 못했습니다.');
  setConfirming(false);setDeleted(true);onDeleted?.();
  if(path.startsWith('/support/forms/'))router.replace('/support/forms');else if(path.startsWith('/notice/'))router.replace('/notice');else if(path.startsWith('/news/')&&!['/news/research','/news/academic','/news/events'].includes(path))router.replace('/news');
  router.refresh();
 }catch(e){setError(e instanceof Error?e.message:'삭제하지 못했습니다.')}finally{setBusy(false);onBusyChange?.(false)}}
 if(deleted)return null;
 return <div className="post-actions"><div className="action-buttons">{!deleteOnly&&(workspace?<button type="button" className="secondary-button" onClick={()=>workspace.open(id)}>게시글 편집</button>:<Link className="secondary-button" href={'/write?id='+id}>게시글 편집</Link>)}{!editOnly&&<button type="button" className="danger-button" disabled={disabled||busy} onClick={()=>{setError('');setConfirming(true)}}>삭제</button>}</div>{confirming&&<ConfirmDelete title="게시글을 삭제할까요?" description="게시글이 목록과 공개 페이지에서 삭제됩니다. 삭제한 글은 복원할 수 없습니다." busy={busy} error={error} onConfirm={remove} onCancel={()=>setConfirming(false)}/>}</div>;
}
