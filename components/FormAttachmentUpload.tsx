'use client';
import {useRef,useState} from 'react';
import {Paperclip} from 'lucide-react';
import {uploadFile} from '@/lib/upload';
export default function FormAttachmentUpload({disabled,onBusyChange,onUploaded}:{disabled:boolean;onBusyChange:(busy:boolean)=>void;onUploaded:(url:string,name:string)=>void}){
 const input=useRef<HTMLInputElement>(null);const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <><button type="button" aria-label="서식 PDF 첨부" title="서식 PDF 첨부 · 최대 10MB" disabled={disabled||busy} onClick={()=>input.current?.click()}><Paperclip size={18}/></button><input ref={input} type="file" hidden accept="application/pdf,.pdf" onChange={async e=>{
  const file=e.target.files?.[0];e.target.value='';if(!file)return;setBusy(true);onBusyChange(true);setMessage('파일 확인 중…');
  try{if(file.type!=='application/pdf'||!file.name.toLowerCase().endsWith('.pdf'))throw Error('PDF 파일을 선택해주세요.');const header=new Uint8Array(await file.slice(0,5).arrayBuffer());if(String.fromCharCode(...header)!=='%PDF-')throw Error('올바른 PDF 파일을 선택해주세요.');const result=await uploadFile(file,setMessage);onUploaded(result.url,file.name);setMessage('첨부 링크를 본문에 넣었습니다. 게시글을 저장하면 공개됩니다.')}catch(error){setMessage(error instanceof Error?error.message:'파일 업로드 실패')}finally{setBusy(false);onBusyChange(false)}
 }}/>{message&&<span className="search-help" role="status">{message}</span>}</>;
}
