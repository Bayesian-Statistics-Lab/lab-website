'use client';
import {useEffect,useRef} from 'react';
export default function ConfirmDelete({title,description,busy,error,onConfirm,onCancel}:{title:string;description:string;busy:boolean;error?:string;onConfirm:()=>void;onCancel:()=>void}){
  const dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const el=dialog.current;el?.showModal();cancel.current?.focus();return()=>el?.close()},[]);
  return <dialog ref={dialog} className="delete-dialog" aria-labelledby="delete-title" aria-describedby="delete-description" onCancel={e=>{e.preventDefault();if(!busy)onCancel()}}>
    <h2 id="delete-title">{title}</h2><p id="delete-description">{description}</p>
    {error&&<p className="error" role="alert">{error}</p>}
    <div className="dialog-actions"><button ref={cancel} type="button" className="secondary-button" disabled={busy} onClick={onCancel}>취소</button><button type="button" className="danger-button" disabled={busy} onClick={onConfirm}>{busy?'삭제 중…':'삭제하기'}</button></div>
  </dialog>;
}
