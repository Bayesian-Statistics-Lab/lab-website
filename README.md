# Bayesian Statistics Laboratory — Chonnam National University

DSRI 디자인을 참고한 전남대학교 통계학과 이광민 교수님 연구실 Next.js 프로젝트 (Vercel 배포 프로젝트).

## 현재 구현됨
- 반응형 메인 화면, 드롭다운 내비게이션, 하위 페이지 및 공통 푸터
- 소개/연구/연구지원/공지/연구소식/오시는 길, 구성원, 논문 화면
- Supabase Auth 관리자 로그인과 DB 역할 검증
- 홈페이지 배너 문구·배경 이미지·버튼 설정 및 사진 업로드
- 게시글·고정 페이지·구성원·논문 생성·수정·공개 해제 및 복원
- 페이지별 관리자 버튼, 페이지별 게시판, 교수/박사/석사/학부연구생/졸업생 구분
- 자체 SVG 로고·파비콘·베이지안 분포 배경 (`public/assets/`)
- SerpApi Scholar Author 검색/논문 검색/후보 선택/검토 상태 저장
- Scholar 자동 동기화 Cron(일주일 1회, 실행 시 최대 3개 저자 프로필 처리)
- 파일 10MB 이하 Supabase private Storage 업로드
- 공개 논문/구성원/게시글 JSON 조회 API

## 아직 완료되지 않은 범위 (중요)
- 원본 사이트의 픽셀 단위 일치와 리치 애니메이션, 교수/학생의 실제 사진
- 조직도·연혁·센터·문서의 전용 구조화 CRUD 화면 (현재 페이지 본문·게시판으로 관리) 및 PDF 공개 다운로드
- Cite API 응답 조회는 구현. BibTeX 내보내기 URL의 실제 다운로드·영구 보관 및 논문별 자동 매칭은 미구현
- Scholar 전체 페이지네이션/대량 작업 큐, 데이터 충돌 방지 및 수동 검토 UX 고도화
- 다국어, 검색/페이지네이션, 변경 이력·감사 로그, 통합/보안 자동 테스트
- 데이터베이스의 일관된 논문 deduplication/외부 API 과금 제한/모니터링

관리자 권한을 가진 Supabase 계정으로 실제 CRUD 검증이 필요합니다. 환경변수만 설정하는 것으로 DB 테이블이나 관리자 계정이 자동 생성되지는 않습니다.

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

http://localhost:3000 으로 접속. 환경변수 없이도 공개 페이지에 기본 안내 문구가 표시되지만 DB/로그인은 작동하지 않습니다.

## Supabase 설정
1. Supabase 프로젝트 생성 후 SQL Editor에서 `supabase/001_schema.sql` 실행.
2. Authentication에서 Email 로그인 사용, 관리자 이메일 사용자를 직접 초대/생성하고 공개 회원가입 비활성화.
3. 해당 사용자의 auth.users UUID를 사용해 `profiles`에 `role='owner'` 행 추가 (SQL 마지막 주석 참고).
4. Project URL 및 **anon/publishable key** 를 `NEXT_PUBLIC_...`로 설정. Secret key는 서버 전용. 환경변수 이름은 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`를 사용합니다.
5. `.env.local`에 `SERPAPI_API_KEY` 와 `CRON_SECRET` 지정.
6. Supabase `lab-media` bucket은 private입니다. `/api/media/...`는 공개된 구성원 사진 또는 공개된 홈페이지 배너에서 참조한 파일만 signed URL로 전달합니다. 미게시 파일은 관리자만 접근할 수 있습니다.

## Vercel
1. GitHub에 저장소를 push한 후 Vercel에서 Import Project.
2. 프레임워크 Next.js, Root Directory `./`, 환경변수 5개 등록.
3. Vercel 배포 후 Supabase Auth의 Site URL/Redirect URLs에 해당 도메인을 설정.
4. Cron 기능은 요금제 제약이 있을 수 있습니다. `vercel.json`의 weekly 스케줄을 확인하고 맞는 요금제로 배포.
5. /admin/login 에서 권한 부여된 계정으로 로그인.

운영 홈페이지: https://lab-website-eight-omega.vercel.app/

현재 사용하는 환경변수는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SERPAPI_API_KEY`, `CRON_SECRET`뿐입니다. 예전 키 이름으로 대체하지 않습니다.

## API 요약

| Method | Path | 설명 |
|---|---|---|
| GET | /api/v1/posts?category=notice | 공개 게시글 |
| GET | /api/v1/members | 공개 구성원 |
| GET | /api/v1/publications | 공개 논문 |
| GET | /api/v1/admin/content?type=posts | 관리자 콘텐츠 목록 |
| POST/PATCH/DELETE | /api/v1/admin/content | 콘텐츠 CRUD |
| POST | /api/v1/admin/media | 파일 업로드 multipart |
| POST | /api/v1/admin/scholar/preview | 저자 논문 미리보기 |
| POST | /api/v1/admin/scholar/connect | 프로필 연결 |
| POST | /api/v1/admin/scholar/search | Scholar 논문 검색 |
| POST | /api/v1/admin/scholar/import | 논문 초안 등록 |
| POST | /api/v1/admin/scholar/cite | Scholar result_id 인용 포맷 조회 |
| GET | /api/cron/scholar | cron bearer 인증, 주간 동기화 |

### Scholar API 주의
SerpApi의 `google_scholar_cite`는 인용 포맷을 제공하며 `google_scholar_author`는 저자의 논문 목록을 제공하는 별도 엔진입니다. Author citation ID와 Search result ID를 혼동하면 안 됩니다. 현재 구현에서는 인용 포맷 조회를 지원하지만 BibTeX 파일의 영구 보관은 지원하지 않습니다.

## 사실 확인
연구실 명칭은 프로젝트 가칭입니다. 공식적으로 확인한 교수 연락처·호실은 전남대학교 통계학과 교수진 페이지입니다. 박사학위/논문(2021)은 서울대학교 Bayesian Statistics Laboratory 졸업생 페이지(https://snubayes.wordpress.com/alumni/)를 확인했습니다. 학사·석사 및 상세 경력 기간은 확인되기 전까지 기재하지 않습니다. 졸업생 명단, 논문, 프로젝트, 연구실 설립 연혁 등은 확인되지 않았으므로 임의 데이터를 게시하지 않았습니다.

원본 DSRI 사이트는 시각적/기능적 레퍼런스이며 타 사이트의 로고, 저작권이 있는 이미지, 문구를 그대로 포함하지 않습니다.

## CMS 사용
`/admin`에서 배너·페이지·게시글·구성원·논문을 관리합니다. 공개 홈페이지에 로그인된 관리자만 편집 버튼이 나타납니다. 페이지 본문은 페이지 경로(예: `about/greetings`)로 저장하고, 해당 페이지 게시판은 `page:about/greetings` 분류를 사용합니다. 사진 업로드 후 반드시 콘텐츠 저장을 눌러야 공개 참조가 반영됩니다. 삭제는 임시저장/비공개로 변경되며 재게시로 복원할 수 있습니다. 교수 이력 본문에는 `## 소제목`을 사용해 섹션을 나눌 수 있습니다.

## 회원가입과 역할별 권한
`supabase/002_membership.sql`을 Supabase SQL Editor에서 적용해야 회원가입과 게시판 작성자 권한이 활성화됩니다. 기존 콘텐츠를 삭제하지 않으며 재실행할 수 있습니다. 학생은 `/register`에서 이름·과정·Scholar 프로필을 입력하고 이메일을 인증합니다. 관리자는 `/admin?view=membership`에서 승인합니다. 승인 후 석사/박사/학부연구생 구분에 맞춰 구성원 페이지에 표시됩니다.

- 관리자/owner: 전체 게시판·배너·페이지·구성원·논문·가입 승인 관리
- 승인된 구성원: 소식·학술활동·행사 게시판 작성 및 본인 글 수정/공개 해제
- 승인 대기: 본인 프로필 관리. 공개 구성원 등록 및 글쓰기는 승인 후 가능
- 방문자: 공개 콘텐츠 조회

회원가입의 과정 선택은 사이트 관리자 권한을 변경하지 않습니다. 프로필의 `role`은 접근 권한, `academic_role` 및 구성원의 `role`은 과정 구분입니다. 본인 글 권한을 API와 Supabase RLS에서 함께 검사합니다. 이메일은 가입자가 공개를 선택한 경우에만 구성원 페이지에 표시합니다. 회원가입은 서버에서 설정 상태를 확인한 뒤 활성화됩니다.

Supabase Authentication의 Site URL은 운영 도메인, Redirect URLs에는 `https://lab-website-eight-omega.vercel.app/auth/callback`을 추가하세요. Email/Password 회원가입이 허용되어야 하며 확인 메일 발송 설정이 필요합니다. 인증된 구성원의 Scholar 프로필은 관리자 승인 시 기존 주간 동기화 대상에 연결됩니다.

검증: `npm run typecheck`, `npm run build`, `npm test`. 권한 검사와 Scholar URL 입력의 경계를 테스트합니다. 실제 회원가입·메일 인증·승인 연동 검증은 DB 설정을 적용한 뒤 진행해야 합니다.

## 렌더링·업로드 최적화
공개 홈페이지는 로그인 여부와 무관하게 ISR로 렌더링하고, 공개 Supabase 데이터는 60초 캐시합니다. 권한 UI는 공유 `/api/session` 응답으로 표시하며, 모든 쓰기 API는 서버에서 권한을 별도로 검증합니다. CMS 저장 시 `lab-public` 캐시 태그를 무효화하므로 변경 사항이 반영됩니다. 관리자·내 계정·작성 화면은 인증이 필요한 SSR 화면입니다.

파일 업로드는 관리자 API에서 서명 토큰만 발급한 뒤 브라우저에서 Supabase Storage로 직접 전송합니다. 파일 본문은 Vercel 함수를 통과하지 않습니다. 최대 10MB와 형식을 검사하며, 미리보기·전송 상태·경로 복사를 지원합니다. 공개 이미지의 승인된 참조와 서명 URL은 짧게 캐시하고, 미게시 파일의 관리자 응답은 캐시하지 않습니다.

졸업생 계정 구분과 원자적 프로필 저장에는 `supabase/003_alumni.sql` 적용이 필요합니다. 신규 설치는 001 → 002 → 003 순서로 실행하세요. 기존 002 적용 환경은 003만 실행하세요. 폼·API·DB 모두 Alumni를 허용하며 이름·과정·Scholar 정보가 일부만 저장되는 상황을 방지합니다.
