/** Only signup confirmation and session exchange are supported here. No external redirects. */
export function callbackInput(search: string, hash: string) {
  const query = new URLSearchParams(search);
  const fragment = new URLSearchParams(hash.replace(/^#/, ''));
  if (query.has('error') || fragment.has('error')) return { kind: 'error' as const };
  const token = query.get('token_hash');
  if (token) {
    const type = query.get('type');
    return type === 'email' || type === 'signup'
      ? { kind: 'token' as const, token_hash: token, type }
      : { kind: 'error' as const };
  }
  const code = query.get('code');
  if (code) return { kind: 'code' as const, code };
  const access = fragment.get('access_token'), refresh = fragment.get('refresh_token');
  if (access && refresh && (!fragment.get('type') || fragment.get('type') === 'signup'))
    return { kind: 'session' as const, access_token: access, refresh_token: refresh };
  return { kind: 'empty' as const };
}

export function confirmationError(code?: string) {
  if (['flow_state_not_found', 'bad_code_verifier', 'flow_state_expired'].includes(code || ''))
    return '가입 신청을 한 브라우저에서 링크를 다시 열어주세요. 이미 이메일 인증을 완료했다면 로그인할 수 있습니다.';
  return '인증 링크가 만료되었거나 이미 사용되었습니다. 이미 인증했다면 로그인하고, 아직 인증하지 않았다면 새 이메일을 요청해주세요.';
}
