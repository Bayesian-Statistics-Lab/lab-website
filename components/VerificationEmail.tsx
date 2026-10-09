"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function VerificationEmail({ initialEmail = '' }: { initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail), [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(0), [message, setMessage] = useState('');
  useEffect(() => {
    if (!remaining) return;
    const timer = setTimeout(() => setRemaining(n => n - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);
  return <form className="verification-resend" onSubmit={async e => {
    e.preventDefault(); setBusy(true); setMessage('');
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
      if (!url || !key) throw Error('이메일 연결을 확인할 수 없습니다. 관리자에게 문의해주세요.');
      const { error } = await createBrowserClient(url, key).auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: window.location.origin + '/auth/callback' } });
      if (error) throw Error('이메일을 보내지 못했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해주세요.');
      setRemaining(60); setMessage('인증 대기 중인 계정이면 이메일이 전송됩니다. 스팸함도 확인해주세요.');
    } catch (error) { setMessage(error instanceof Error ? error.message : '이메일 전송에 실패했습니다.'); }
    finally { setBusy(false); }
  }}><h3>인증 이메일 다시 받기</h3><label>가입한 이메일<input className="field" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></label><button className="secondary-button" disabled={busy || remaining > 0}>{busy ? '전송 중…' : remaining ? `${remaining}초 후 재전송 가능` : '인증 이메일 재발송'}</button><p className="form-feedback" role="status">{message}</p></form>;
}
