# 전남대학교 베이즈통계 연구실 홈페이지

연구실 소개, 구성원, 논문과 게시판을 관리하는 Next.js 웹사이트입니다. 공개 홈페이지와 관리자 CMS를 같은 프로젝트에서 운영하며 Supabase Auth·Postgres·private Storage, SerpApi Scholar 연동을 사용합니다.

- 운영 사이트: https://lab-website-eight-omega.vercel.app/
- 저장소: https://github.com/Bayesian-Statistics-Lab/lab-website
- 패키지 버전: `0.1.0`
- [변경 이력](CHANGELOG.md) · [2026-10-10 릴리스 문서](docs/releases/2026-10-10.md)
- [가입·승인·프로필·계정 삭제 운영 안내](docs/AUTH_AND_PROFILE.md)
- [단계별 리팩토링 구조·보존 계약](docs/REFACTORING.md)

## 제공 기능

| 영역 | 기능 |
| --- | --- |
| 공개 홈페이지 | 반응형 내비게이션, 소개·연구 분야·연구지원·논문·공지·소식·오시는 길 |
| 홈·고정 페이지 | 이미지/GIF 배너, 연구 분야 카드 1~3개, 본문 편집, 연·월별 연혁 묶음·이력 추가·최신순 정렬 |
| 게시판·갤러리 | Tiptap 이미지 삽입, 작성자·등록일·수정일·번호, 검색, 게시판 15/30/50개·갤러리 6/12개 페이지 크기 |
| 구성원 | 교수 소개·주요 이력, 역할별 구성원과 Alumni, 역할 노드 조직도·랩장 지정 |
| 내 계정 | 프로필·사진·소속·학과·학번·연락처, 공개 항목 선택, 내 게시글, 아이디 저장 |
| 관리자 | 콘텐츠 작성·수정·공개 관리, 가입 승인·해제, 구성원/가입 계정 삭제, 파일 관리, 모바일 관리 메뉴 선택 목록 |
| 논문 | Scholar 검색·가져오기·초안 검토, 공개 토글, 선택 삭제, 인용수 정렬, 제공된 요약·학술지 표시 |

Pretendard는 `public/assets/fonts`에서 자체 제공하며 OFL 라이선스를 포함합니다. 로고·파비콘과 기본 리소스는 `public/assets`에 있습니다. 외부 API가 요약을 제공하지 않는 논문에는 임의 요약을 생성하지 않습니다.

## 최근 반영 사항 (2026-10-10)

- **모바일 관리 화면**: 900px 이하에서 관리자 메뉴를 선택 목록으로 전환합니다. 홈페이지 하위 메뉴는 여러 줄로 표시하고 대시보드·폼·버튼·표의 가로 넘침을 조정했습니다.
- **연혁**: `2026.03`, `2026년 3월`, 같은 월의 일자 표기를 하나의 연·월로 묶습니다. 각 그룹의 ‘+ 이력 추가’로 내용을 이어 쓰고 최근 월부터 표시합니다. 기존 중복 연혁도 읽을 때 묶으며 저장 시 같은 구조를 반영합니다.
- **이미지**: 공개 이미지 참조 조회를 공유 캐시로 통합했습니다. 배너를 우선 요청하고 배너·연구 카드의 사이트 내 JPG/PNG/WebP는 화면 크기에 맞춰 최적화합니다.
- **GIF 배너**: 정지·재생 버튼을 제거했습니다. 기본적으로 자동 재생하며 기기의 모션 감소 설정은 존중합니다.

기능 기준 커밋은 [`9eddf14`](https://github.com/Bayesian-Statistics-Lab/lab-website/commit/9eddf14ef2d4c2bbdf7f20ab7a454cf187acb33a)입니다. 설치 조건, 상세 변경과 검증 범위는 [릴리스 문서](docs/releases/2026-10-10.md)에 정리했습니다.

## 로컬 실행

Node.js **22 이상**과 npm을 준비합니다. 의존성은 lockfile 기준으로 설치합니다.

```bash
npm ci
cp .env.example .env.local
# .env.local에 해당 프로젝트의 환경변수 설정
npm run dev
```

http://localhost:3000 에 접속합니다. 환경변수가 없으면 DB·로그인·업로드 기능은 작동하지 않습니다. 프로덕션 실행은 `npm run build` 후 `npm start`를 사용합니다.

### 환경변수

| 이름 | 용도 | 노출 범위 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 주소 | 브라우저 사용 |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key | 브라우저 사용, RLS 적용 |
| `SUPABASE_SECRET_KEY` | 가입 생성, 구성원 연결, 삭제 RPC, Storage 등 | 서버 전용 |
| `SERPAPI_API_KEY` | Scholar 조회·가져오기·동기화 | 서버 전용 |
| `CRON_SECRET` | Scholar Cron Bearer 인증 | 서버 전용 |

실제 `.env.local`과 비밀키를 커밋하지 않습니다. 서버 키에 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다.

## Supabase 초기 설치

새 프로젝트의 SQL Editor에서 다음 파일을 순서대로 실행합니다. 환경변수 등록만으로 테이블·정책·관리자 계정이 설치되지는 않습니다.

| 순서 | SQL | 설치 내용 |
| --- | --- | --- |
| 1 | [001_schema.sql](supabase/001_schema.sql) | 기본 테이블·RLS·Storage 정책 |
| 2 | [002_membership.sql](supabase/002_membership.sql) | 가입 신청·승인·게시글 작성자 권한 |
| 3 | [003_alumni.sql](supabase/003_alumni.sql) | 졸업생 구분·본인 프로필 저장 |
| 4 | [004_account_withdrawal.sql](supabase/004_account_withdrawal.sql) | 계정·가입 정보·구성원 프로필의 원자적 삭제 |

기존 DB에는 **미적용 파일만** 실행합니다. `001_schema.sql`은 초기 설치용이므로 운영 DB에 그대로 재실행하지 않습니다. 코드 배포가 SQL을 자동 적용하지 않으며 실제 적용 상태는 운영 DB에서 별도로 확인해야 합니다.

Authentication에서 이메일/비밀번호 로그인을 사용합니다. 새 웹 가입은 서버의 `auth.admin.createUser({ email_confirm: true })`로 처리하므로 **가입 확인 이메일·템플릿 설정은 필요하지 않습니다.** Supabase 이메일 확인 필드와 연구실 승인 상태는 다릅니다. 연구실 기능은 `profiles.membership_status`의 관리자 승인으로 결정합니다.

최초 관리자 계정은 Supabase에서 생성한 뒤 해당 Auth 사용자 UUID로 `profiles`에 등록합니다.

```sql
-- 실제 관리자 Auth UUID로 바꿔 실행합니다.
insert into public.profiles (id, role, display_name, membership_status)
values ('YOUR_AUTH_USER_UUID'::uuid, 'owner', '관리자', 'approved')
on conflict (id) do update
set role = excluded.role, membership_status = excluded.membership_status;
```

`lab-media` bucket은 private으로 유지합니다. Postdoc/Researcher는 기존 학위 제약에 호환되는 `academic_role`을 사용하고 실제 구분은 `members.role`과 메타데이터의 `lab_role`로 반영합니다. 구성원 역할 선택은 관리자 권한을 부여하지 않습니다.

## 가입과 권한

`/register` 신청 → 관리자 `/admin?view=membership` 승인 → 구성원 공개·게시판 작성 활성화 순서입니다. 새 신청자는 이메일 인증 없이 로그인해 본인 프로필을 관리할 수 있습니다. 과거 인증 대기 계정은 관리자 승인 시 로그인 설정도 처리합니다.

| 사용자 | 가능한 기능 |
| --- | --- |
| 방문자 | 공개 콘텐츠 조회 |
| 승인 대기·승인 해제 계정 | 로그인, 본인 프로필·사진 관리, 회원 탈퇴 |
| 승인된 구성원 | 위 기능과 구성원 공개, 소식·학술활동·행사 글 작성 및 본인 글 관리 |
| 관리자·소유자 | 전체 콘텐츠, 가입 승인·해제, 구성원/가입 계정 삭제, 논문·배너·설정 관리 |

일반 사용자 글 관리 UI는 수정 진입을 제공하며 관리자 UI는 삭제를 제공합니다. 서버의 본인 글 수정·삭제 허용 범위는 `lib/permissions.ts`와 게시판 API에서도 검사합니다. 승인 버튼은 상태에 따라 **승인 또는 승인 해제 하나만** 표시합니다. 학번·연락처·이메일은 사용자가 선택한 공개 범위에 따라 반영됩니다.

### 삭제와 탈퇴

- 게시글과 선택 논문 삭제는 실제 DB 삭제이며 사이트 UI에서 복구할 수 없습니다. 논문 삭제 시 구성원·Scholar 연결도 제거됩니다.
- 연결된 구성원 삭제는 로그인 계정·가입 정보·프로필을 함께 제거합니다. 과거 프로필만 삭제한 계정은 가입 승인 목록의 **계정 삭제**로 정리합니다.
- 계정 없는 수동 구성원은 프로필·관련 소개 설정을 삭제합니다.
- 본인 탈퇴는 현재 비밀번호와 동의를 확인합니다. 관리자·소유자 계정은 이 삭제 경로에서 보호합니다.
- 계정 삭제 후 기존 게시글·논문 원본은 유지하고 게시글의 계정 연결은 해제합니다. Storage 파일 일괄 삭제와 작성자 표시 문자열 익명화는 포함하지 않습니다.
- 페이지 등 기타 콘텐츠의 공개 해제는 draft 전환이며 재게시할 수 있습니다.

계정 삭제와 탈퇴에는 `004_account_withdrawal.sql`이 필요합니다. 함수 설치 자체가 기존 계정을 삭제하지는 않습니다.

## 렌더링·파일 전송

공개 데이터는 `lib/data.ts`의 `unstable_cache`로 **3600초** 캐시하며 저장·승인·삭제 시 `lab-public` 태그와 관련 경로를 무효화합니다. 권한 UI는 공유 `/api/session` 응답을 사용하고 서버 API·DB 권한 검사는 별도로 수행합니다.

서명 업로드 URL을 발급한 뒤 브라우저가 Storage로 파일을 직접 전송합니다. 파일 본문은 Vercel 함수로 중계하지 않습니다. 관리자 업로드는 JPG/PNG/WebP/GIF/PDF, 최대 10MB이며 본인 사진은 JPG/PNG/WebP, 최대 5MB입니다. 본인 사진 저장 시 경로 소유자·크기·MIME·시그니처를 검사합니다.

공개 미디어는 공개 구성원·게시글·페이지의 참조를 모아 **60초 공유 캐시**로 확인합니다. 같은 서버 인스턴스의 동시 초기 조회도 공유해 이미지마다 반복하던 DB 검색을 줄입니다. 배너·연구 카드·로그인 화면 이미지 설정도 참조에 포함합니다. 서명 URL은 60초, 공개 리다이렉트 응답은 30초 캐시합니다. 미공개 자료는 관리자 또는 로그인한 본인 경로 권한을 검사하고 `private, no-store`로 응답합니다.

배너·연구 카드의 사이트 내 정적 사진은 `components/PublicImage.tsx`와 Next.js 이미지 최적화를 사용합니다. `sizes`에 따라 축소본을 제공하며 최적화 캐시 최소 TTL은 60초입니다. GIF·SVG·외부 이미지에는 이 변환을 적용하지 않습니다. 본인 계정·관리자 미리보기는 기존 권한 경로를 유지합니다. 업로드 시 큰 정적 사진은 브라우저에서 WebP로 압축하며 GIF는 유지합니다.

첫 변환에는 원본 조회·변환 시간이 들 수 있고 GIF 원본 용량은 그대로입니다. 실제 사용자 환경에서 ‘6초 → 몇 초’와 같은 개선 폭은 측정하지 않았습니다.

가입 재시도 제한은 서버 인스턴스별 IP+이메일 조합당 1분에 5회이며 유효한 입력에 적용합니다. 다른 이메일은 분리하고 성공 시 카운터를 해제합니다. 인스턴스 간 공유되는 영구 제한은 아닙니다.

## Vercel 배포와 Scholar

GitHub 저장소를 Vercel에 연결하고 Next.js, Root Directory `./`, 위 환경변수와 DB를 설정합니다. `vercel.json`은 서울 `icn1` 리전과 `0 3 * * 1` Cron을 지정합니다. UTC 기준 월요일 03:00, 한국 시간 월요일 12:00입니다.

`/api/cron/scholar`는 `CRON_SECRET` Bearer 인증 후 자동 동기화 대상 프로필을 실행당 최대 3개 처리합니다. 신규 논문은 draft로 등록하고 기존 연결 논문의 인용수를 갱신합니다. Cron 실행 지원과 SerpApi 사용량은 실제 계정 환경에서 확인합니다.

Scholar Author citation ID와 Search result ID는 다릅니다. 인용 포맷 조회는 지원하지만 BibTeX 파일 영구 보관, 전체 페이지 순회와 대량 작업 큐는 후속 작업입니다.

## 주요 API

| Method | Path | 용도 |
| --- | --- | --- |
| GET | `/api/v1/posts`, `/api/v1/members`, `/api/v1/publications` | 공개 콘텐츠 |
| POST | `/api/registration/signup` | 이메일 인증 없는 가입 신청 |
| GET/POST | `/api/registration` | 가입 준비 상태·본인 구성원 연결 확인 |
| GET | `/api/session` | 사용자·권한 UI 정보 |
| PATCH | `/api/account` | 본인 프로필 저장 |
| POST/PATCH | `/api/account/photo` | 사진 업로드 URL 발급·참조 저장 |
| POST | `/api/account/withdraw` | 본인 탈퇴 |
| GET/POST/PATCH/DELETE | `/api/v1/admin/content` | 관리자 콘텐츠 관리 |
| GET/POST/DELETE | `/api/v1/admin/membership` | 가입 조회·승인/해제·계정 삭제 |
| POST | `/api/v1/admin/media` | JSON 파일 정보로 서명 업로드 URL 발급 |
| PATCH | `/api/v1/admin/publications/status` | 논문 공개 토글 |
| POST | `/api/v1/admin/publications/delete` | 선택 논문 삭제 |
| POST | `/api/v1/admin/scholar/{preview,connect,search,import,cite}` | Scholar 연동 |
| GET | `/api/cron/scholar` | 인증된 주간 동기화 |

## 검증 및 운영 확인

```bash
npm test
npm run typecheck
npm run build
```

단위 테스트는 권한, 가입 입력·요청 제한, 구성원 연결·삭제, 게시판 계산, 리치 텍스트, 미디어, Scholar 응답·설정 처리 등을 확인합니다. 운영 DB SQL 적용, 실제 계정 생성·승인·탈퇴·삭제, 파일 전송 및 외부 Scholar 호출은 별도 운영 검증 대상입니다.

DB·Storage 데이터와 환경변수는 Git 저장소 및 소스 ZIP에 포함되지 않습니다. 복구에는 별도 백업이 필요합니다. 리팩토링은 작은 도메인 단위로 진행합니다. 논문 공개·삭제 API 계층과 화면 API 호출·상태 표시 분리를 첫 단계로 두고, DB·캐시·의존성 변경과 분리합니다. 세부 구조와 검증 계약은 [리팩토링 안내](docs/REFACTORING.md)를 참고하세요.

홈페이지 배너 편집에서 오버레이 불투명도(알파값)를 0~100%로 조절하고 미리보기로 확인할 수 있습니다. 기존 배너는 기본값 100%로 유지됩니다.

### 사이트 디자인 설정

관리자 대시보드의 **사이트 디자인**에서 블루·포레스트·버건디 추천 테마 또는 대표·제목·본문·기본 배경·구분 영역 색상을 설정합니다. 저장 전 미리보기, 대비 안내, 기본값 복원을 지원합니다. 설정은 기존 `pages`의 `settings/theme`에 저장하며 별도 SQL 적용은 필요하지 않습니다. 색상은 서버에서 공통 CSS 변수로 전달하고 기존 `lab-public` 캐시를 사용합니다. 기본 로고·파비콘·모바일 홈 화면 아이콘과 기본 연구 카드 SVG 색상은 테마를 따릅니다. 직접 업로드한 사진과 오류·삭제 상태 색상은 유지됩니다.

테마 API는 `server/theme`의 컨트롤러·DTO·서비스·리포지토리·엔터티로 분리되어 있습니다. 관리자 UI와 요청 모듈은 `features/theme`에 있습니다.

사이트 디자인에서 상단 브랜드 이름(최대 60자)과 아래 문구(최대 200자, 줄바꿈 지원)도 편집할 수 있습니다. 색상 추천 테마 변경은 브랜드 문구를 유지하며, 기본값 복원은 문구와 색상을 함께 복원합니다. 기존 색상 설정에는 기본 브랜드 문구를 적용합니다.
