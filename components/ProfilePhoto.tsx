"use client";
import { useState,useEffect } from 'react';
import ImageUpload from './ImageUpload';
import { photoLimit } from '@/lib/profile-photo';
export default function ProfilePhoto({ member }: { member: { name: string; photo_url?: string | null } }) {
  const [photo, setPhoto] = useState(member.photo_url || ''), [busy, setBusy] = useState(false), [message, setMessage] = useState(''),[preview,setPreview]=useState('');useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview)},[preview]);
  async function save(path: string | null) {
    const response = await fetch('/api/account/photo', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ path }) });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || '사진을 저장하지 못했습니다.');
    setPhoto(data.photo_url || '');if(!path)setPreview(''); setMessage('');
  }
  return <section className="admin-box profile-photo-card"><h2>프로필 사진</h2><div className="my-avatar">{preview||photo ? <img src={preview||photo} alt={`${member.name} 프로필 사진`} /> : <span aria-label="등록된 프로필 사진 없음">{member.name.slice(0,1)}</span>}</div><p className="muted">구성원 페이지에 표시되는 사진입니다.<br />사진 변경은 바로 저장됩니다.</p><ImageUpload onPreview={setPreview} endpoint="/api/account/photo" maxBytes={photoLimit} showPreview={false} instant disabled={busy} onBusyChange={setBusy} onUploaded={async (_url, path) => save(path)} />{photo && <button className="secondary-button" type="button" disabled={busy} onClick={async () => { setBusy(true); try { await save(null); setMessage('사진을 기본 이미지로 변경했습니다.'); } catch (error) { setMessage(error instanceof Error ? error.message : '사진 변경 실패'); } finally { setBusy(false); } }}>기본 이미지로 변경</button>}<p className="form-feedback" role="status">{message}</p></section>;
}
