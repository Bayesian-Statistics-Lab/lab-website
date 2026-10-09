# 이메일 인증과 프로필 사진 운영 설정

## Supabase Authentication → URL Configuration

- Site URL: `https://lab-website-eight-omega.vercel.app`
- Redirect URLs: `https://lab-website-eight-omega.vercel.app/auth/callback`
- 별도 도메인을 연결하면 그 도메인의 Site URL과 `/auth/callback`도 함께 등록합니다.
- 로컬 개발은 `http://localhost:3000/auth/callback`을 별도로 등록합니다.

## Authentication → Email Templates → Confirm signup

권장 인증 링크:

```html
<h2>베이즈통계 연구실 이메일 인증</h2>
<p>아래 버튼으로 가입 이메일을 인증해주세요.</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&amp;type=email">이메일 인증하기</a></p>
```

`token_hash`로 확인하면 가입 때 사용한 브라우저의 PKCE 쿠키가 없어도 인증할 수 있습니다. 홈페이지에서 인증 완료 버튼을 눌러 POST로 검증하므로, 단순 링크 미리보기 GET 요청이 토큰을 소모하지 않습니다. 기존 `ConfirmationURL` 이메일도 `code` 또는 기존 implicit 세션으로 처리합니다. 이미 발송된 PKCE 링크는 가입했던 브라우저에서 열어야 할 수 있으며, 만료·기사용 링크는 새 이메일을 요청해야 합니다.

위 설정은 앱 배포로 Supabase에 자동 적용되지 않습니다. 기본 메일 서비스의 발송 제한과 SMTP 설정도 Supabase에서 확인해야 합니다. 새 계정으로 이메일 수신 → 링크 클릭 → 마이페이지 → 관리자 승인 절차를 실제 확인합니다.

## 본인 프로필 사진

- `002_membership.sql`이 적용되어 `members.user_id`가 가입 계정에 연결되어야 합니다.
- 기본 프로필 정보 수정은 `003_alumni.sql` RPC를 사용합니다. 사진 변경에는 추가 DB 마이그레이션이 없습니다.
- 기존 다섯 환경변수만 사용하며 다른 키 이름이나 임의의 대체값은 사용하지 않습니다.
- 사진은 `/api/account/photo`에서 로그인과 본인 구성원 연결을 검증한 뒤 서버가 발급한 경로로 직접 업로드합니다.
- 서버가 파일 소유자·크기(5MB)·MIME·이미지 파일 시그니처를 검사한 뒤 해당 계정의 `photo_url`만 수정합니다. 클라이언트가 다른 구성원의 ID를 지정할 수 없습니다.
- 미승인 회원은 자기 사진만 비공개로 미리 볼 수 있습니다. 승인된 공개 구성원에서 참조하는 사진만 공개 접근이 가능합니다.
- 기본 이미지로 변경하면 구성원의 사진 참조를 비웁니다. 스토리지 파일은 영구 삭제하지 않습니다.
- 계정에 구성원 프로필이 연결되지 않은 관리자에게는 연결 확인 안내가 표시됩니다. 다른 사람의 구성원 기록을 자동 연결하지 않습니다.

참고: https://supabase.com/docs/guides/auth/auth-email-templates , https://supabase.com/docs/guides/auth/sessions/pkce-flow
