"use client";
import {useEffect,useState,useRef,type ReactNode} from 'react';
import {uploadFile} from '@/lib/upload';
type Props={actions?:ReactNode;onPreview?:(url:string)=>void;allowGif?:boolean;onUploaded:(url:string,path:string)=>void|Promise<void>;endpoint?:string;maxBytes?:number;instant?:boolean;showPreview?:boolean;disabled?:boolean;onBusyChange?:(busy:boolean)=>void};
export default function ImageUpload({onUploaded,endpoint,maxBytes=10*1024*1024,instant=false,showPreview=true,disabled=false,onBusyChange,allowGif=false,onPreview,actions}:Props){
  const inputRef=useRef<HTMLInputElement>(null);
  const [msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[preview,setPreview]=useState(''),[failed,setFailed]=useState(false);
  useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
  return <div className="upload-field"><div className={instant?'instant-upload-actions':undefined}><label className={instant?'instant-photo-upload':undefined}>{!instant&&'사진 선택'}{instant&&<button type="button" className="secondary-button" disabled={busy||disabled} onClick={()=>inputRef.current?.click()}>{busy?'사진 업로드 중…':'사진 변경'}</button>}<input ref={inputRef} aria-label="사진 파일 선택" hidden={instant} type="file" accept={allowGif?'image/jpeg,image/png,image/webp,image/gif':'image/jpeg,image/png,image/webp'} disabled={busy||disabled} onChange={async e=>{
    const file=e.target.files?.[0];e.target.value='';if(!file)return;if(onPreview)onPreview(URL.createObjectURL(file));setBusy(true);onBusyChange?.(true);setFailed(false);setMsg('파일 확인 중…');
    try{const result=await uploadFile(file,setMsg,{endpoint,maxBytes});setMsg('사진을 적용하고 있습니다…');await onUploaded(result.url,result.path);if(showPreview)setPreview(URL.createObjectURL(file));setMsg(instant?'프로필 사진을 저장했습니다.':'업로드 완료. 저장 버튼을 눌러 적용해주세요.');}
    catch(e){onPreview?.('');setFailed(true);setMsg(e instanceof Error?e.message:'사진 업로드에 실패했습니다.');}
    finally{setBusy(false);onBusyChange?.(false);}
  }}/></label>{instant&&actions}</div><small>JPG, PNG, WebP{allowGif?', GIF':''} · 최대 {maxBytes/1024/1024}MB</small>{preview&&<img className="upload-preview" src={preview} alt="선택한 이미지 미리보기"/>}<p className={'form-feedback '+(failed?'error':'')} role="status" aria-live="polite">{msg}</p></div>;
}
