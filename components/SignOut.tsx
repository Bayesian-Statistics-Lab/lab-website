'use client';
import {useState} from 'react';
export default function SignOut({compact=false}:{compact?:boolean}) {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  return <div className={compact?'nav-signout':'signout-control'}><button type="button" className={compact?'nav-button':'secondary-button'} disabled={busy} onClick={async()=>{
    setBusy(true);setError('');
    try { const r=await fetch('/api/logout',{method:'POST'});if(!r.ok)throw Error();window.location.assign('/'); }
    catch {setError('로그아웃 실패. 다시 시도해주세요.');setBusy(false);}
  }}>{busy?'로그아웃 중…':'로그아웃'}</button>{error&&<span className="error" role="alert">{error}</span>}</div>;
}
