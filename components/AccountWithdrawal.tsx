'use client';
import {useState} from 'react';
export default function AccountWithdrawal(){
 const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 return <section className="account-withdrawal"><button className="secondary-button" type="button" onClick={()=>setOpen(!open)} aria-expanded={open}>회원 탈퇴</button>{open&&<form onSubmit={async e=>{
 e.preventDefault();setBusy(true);setMessage('');const form=new FormData(e.currentTarget);
 try{const response=await fetch('/api/account/withdraw',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:form.get('password'),confirmation:form.get('confirmation')})});const data=await response.json();if(!response.ok)throw Error(data.error);try{localStorage.removeItem('bsl-login-email')}catch{}window.location.replace('/');}catch(error){setMessage(error instanceof Error?error.message:'탈퇴 처리에 실패했습니다.');setBusy(false)}
 }}><h2>회원 탈퇴 확인</h2><p>계정과 구성원 프로필은 삭제되며 복구할 수 없습니다. 기존 게시글은 남지만 계정 연결은 해제됩니다.</p><label>현재 비밀번호<input className="field" type="password" name="password" autoComplete="current-password" required disabled={busy}/></label><label className="check-label"><input type="checkbox" name="confirmation" value="withdraw" required disabled={busy}/> 안내를 확인했으며 회원 탈퇴에 동의합니다.</label><div className="form-actions"><button type="button" className="secondary-button" disabled={busy} onClick={()=>setOpen(false)}>취소</button><button className="secondary-button" disabled={busy}>{busy?'탈퇴 처리 중…':'탈퇴하기'}</button></div><p className="error" role="alert">{message}</p></form>}</section>
}
