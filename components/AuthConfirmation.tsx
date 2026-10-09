"use client";
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { callbackInput, confirmationError } from '@/lib/auth-callback';
import VerificationEmail from './VerificationEmail';

export default function AuthConfirmation() {
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('인증 정보를 확인하고 있습니다.'), [busy, setBusy] = useState(false);
  const started = useRef(false), input = useRef<ReturnType<typeof callbackInput>>({ kind: 'empty' });
  async function confirm() {
    setBusy(true);
    try {
      const value = input.current;
      if (value.kind === 'error') throw Error(confirmationError());
      if (value.kind === 'code' || value.kind === 'token') {
        const response = await fetch('/api/auth/confirm', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value.kind === 'code' ? { code: value.code } : { token_hash: value.token_hash, type: value.type }) });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || confirmationError());
      } else {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (!url || !key) throw Error('인증 연결을 확인할 수 없습니다. 관리자에게 문의해주세요.');
        const client = createBrowserClient(url, key);
        if (value.kind === 'session') {
          const { error } = await client.auth.setSession({ access_token: value.access_token, refresh_token: value.refresh_token });
          if (error) throw Error(confirmationError(error.code));
        }
        const { data: { user } } = await client.auth.getUser();
        if (!user?.email_confirmed_at) throw Error('인증 메일의 링크를 열어주세요. 이미 인증을 완료했다면 로그인할 수 있습니다.');
      }
      const application = await fetch('/api/registration', {method:'POST'});
      const result = await application.json();
      if (!application.ok) throw Error(result.error);
      window.location.replace('/account');
    } catch (error) {
      setState('error'); setMessage(error instanceof Error ? error.message : confirmationError());
    } finally { setBusy(false); }
  }
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    input.current = callbackInput(window.location.search, window.location.hash);
    // Avoid exposing confirmation credentials in referrers and subsequent navigation.
    window.history.replaceState(null, '', '/auth/callback');
    if (input.current.kind === 'token') { setState('ready'); setMessage('아래 버튼을 눌러 이메일 인증을 완료해주세요.'); }
    else void confirm();
  }, []);
  return <main className="account-wrap auth-wrap"><p className="kicker">EMAIL VERIFICATION</p><h1>이메일 인증</h1><section className="auth-card"><p className={state === 'error' ? 'notice' : 'muted'} role="status">{message}</p>{state === 'ready' && <button className="primary" disabled={busy} onClick={confirm}>{busy ? '인증 중…' : '이메일 인증 완료하기'}</button>}{state === 'error' && <VerificationEmail />}<div className="auth-links"><Link href="/admin/login">로그인</Link><Link href="/">홈페이지로</Link></div></section></main>;
}
