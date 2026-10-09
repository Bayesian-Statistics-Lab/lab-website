"use client";
import ProfileDetailsFields,{readProfileDetails} from './ProfileDetailsFields';
import {useState} from 'react';
export default function AccountForm({member,details}:{member:any;details?:unknown}){
  const [role,setRole]=useState(member.role);
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[failed,setFailed]=useState(false);
  return <form className="admin-box" onSubmit={async e=>{
    e.preventDefault();const form=new FormData(e.currentTarget);setBusy(true);setFailed(false);setMessage('');
    try{
      const response=await fetch('/api/account',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({name:form.get('name'),name_en:form.get('name_en'),academic_role:form.get('academic_role'),bio:form.get('bio'),scholar:form.get('scholar'),public_email:form.get('public_email')==='on',profile_details:readProfileDetails(form)})});
      const data=await response.json();if(!response.ok)throw Error(data.error);setMessage('프로필을 저장했습니다. 승인된 구성원은 공개 페이지에도 반영됩니다.');
    }catch(error){setFailed(true);setMessage(error instanceof Error?error.message:'저장에 실패했습니다.');}finally{setBusy(false)}
  }}><h2>인적사항</h2><p className="muted">이름과 연구 관심 분야를 구성원 페이지에 소개하세요.</p><fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0}}><div className="form-grid"><label>이름 <span className="muted">(필수)</span><input name="name" className="field" required maxLength={100} autoComplete="name" defaultValue={member.name}/></label><label>영문 이름<input name="name_en" className="field" maxLength={100} defaultValue={member.name_en||''}/></label></div><label>연구실 구분<select name="academic_role" className="field" value={role} onChange={e=>setRole(e.target.value)}><option value="Masters">석사과정</option><option value="PhD">박사과정</option><option value="Undergraduate">학부연구생</option><option value="Alumni">졸업생</option></select></label><ProfileDetailsFields value={details} alumni={role==='Alumni'}/><label>Google Scholar 프로필<input name="scholar" className="field" maxLength={2048} defaultValue={member.scholar_author_id||''} placeholder="Google Scholar 프로필 URL 또는 user ID"/><small className="search-help">아직 프로필이 없으면 비워두어도 됩니다.</small></label><label>소개 / 연구 관심 분야<textarea name="bio" className="field" rows={6} maxLength={5000} defaultValue={member.bio||''}/></label><label className="check-label"><input name="public_email" type="checkbox" defaultChecked={!!member.email}/> 로그인 이메일을 구성원 페이지에 공개합니다 (선택)</label></fieldset><div className="form-actions"><button className="primary" disabled={busy}>{busy?'저장 중…':'프로필 저장'}</button><p className={'form-feedback '+(failed?'error':'success')} role="status" aria-live="polite">{message}</p></div></form>;
}
