"use client";
import {thumbnailUrl} from '@/lib/media-variants';
import { useState,useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { photoLimit } from '@/lib/profile-photo';
export default function ProfilePhoto({ member }: { member: { name: string; photo_url?: string | null } }) {
  const [photo, setPhoto] = useState(member.photo_url || ''), [busy, setBusy] = useState(false), [message, setMessage] = useState(''),[preview,setPreview]=useState('');useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
  async function save(path: string | null) {
    const response = await fetch('/api/account/photo', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || '사진을 저장하지 못했습니다.');
    setPhoto(data.photo_url || '');window.dispatchEvent(new Event('account-photo-updated'));if(!path)setPreview(''); setMessage('');
  }
  const resetButton=photo?<button className="secondary-button photo-reset" type="button" disabled={busy} onClick={async()=>{setBusy(true);try{await save(null);setMessage('사진을 초기화했습니다.')}catch(error){setMessage(error instanceof Error?error.message:'사진 변경 실패')}finally{setBusy(false)}}}>사진 초기화</button>:null;
  return <section className="profile-photo-card"><h2>프로필 사진</h2><div className="my-avatar">{preview||photo?<img src={preview||thumbnailUrl(photo,640,true)} alt={`${member.name} 프로필 사진`}/>:<span aria-label="등록된 프로필 사진 없음">{member.name.slice(0,1)}</span>}</div><strong className="profile-photo-name">{member.name}</strong><ImageUpload actions={resetButton} onPreview={setPreview} endpoint="/api/account/photo" maxBytes={photoLimit} showPreview={false} instant disabled={busy} onBusyChange={setBusy} onUploaded={async(_url,path)=>save(path)}/><p className="profile-photo-note">변경한 사진은 바로 저장됩니다.</p><p className="form-feedback" role="status">{message}</p></section>;
}
