# Bayesian Statistics Laboratory — Chonnam National University

DSRI 디자인을 참고한 전남대학교 통계학과 이광민 교수님 연구실 Next.js 프로젝트 (개발용 최초 구현).

## 현재 구현됨
- 반응형 메인 화면, 드롭다운 내비게이션, 하위 페이지 및 공통 푸터
- 소개/연구/연구지원/공지/연구소식/오시는 길, 구성원, 논문 화면
- Supabase Auth 관리자 로그인과 DB 역할 검증
- 게시글·고정 페이지·구성원·논문 생성·수정·삭제(기본 텍스트 에디터)
- SerpApi Scholar Author 검색/논문 검색/후보 선택/검토 상태 저장
- Scholar 자동 동기화 Cron(일주일 1회, 실행 시 최대 3개 저자 프로필 처리)
- 파일 10MB 이하 Supabase private Storage 업로드
- 공개 논문/구성원/게시글 JSON 조회 API

## 아직 완료되지 않은 범위 (중요)
- 원본 사이트의 픽셀 단위 일치, 실제 배너·로고·사진 자산 사용 권한 및 리치 애니메이션
- 회원 및 논문 상세 편집 UX 개선, 조직도·연혁·센터·문서 전용 CRUD 화면/목록, 다운로드 서명 URL
- Cite API 응답 조회는 구현. BibTeX 내보내기 URL의 실제 다운로드·영구 보관 및 논문별 자동 매칭은 미구현
- Scholar 전체 페이지네이션/대량 작업 큐, 데이터 충돌 방지 및 수동 검토 UX 고도화
- 다국어, 검색/페이지네이션, 변경 이력·감사 로그, 통합/보안 자동 테스트
- 데이터베이스의 일관된 논문 deduplication/외부 API 과금 제한/모니터링

이 저장소는 **완제품이 아니라 운영 환경 연결 전의 기능성 스타터**입니다. 실제 교수님 계정, 키, DB가 없으므로 현재 API 통합 테스트를 수행하지 않았습니다.

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
4. Project URL 및 **anon/publishable key** 를 `NEXT_PUBLIC_...`로 설정. Service role은 서버 전용.
5. `.env.local`에 `SERPAPI_API_KEY` 와 `CRON_SECRET` 지정.
6. Supabase `lab-media` bucket은 private입니다. 업로드 파일을 공개하려면 승인 후 signed URL용 다운로드 API가 추가로 필요합니다.

## Vercel
1. GitHub에 저장소를 push한 후 Vercel에서 Import Project.
2. 프레임워크 Next.js, Root Directory `./`, 환경변수 5개 등록.
3. Vercel 배포 후 Supabase Auth의 Site URL/Redirect URLs에 해당 도메인을 설정.
4. Cron 기능은 요금제 제약이 있을 수 있습니다. `vercel.json`의 weekly 스케줄을 확인하고 맞는 요금제로 배포.
5. /admin/login 에서 권한 부여된 계정으로 로그인.

**실제 도메인 배포는 아직 수행되지 않았습니다.** Vercel 계정, GitHub 연결, Supabase 및 SerpApi 키 제공이 필요합니다.

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
연구실 명칭은 프로젝트 가칭입니다. 공식적으로 확인한 교수 연락처·호실은 전남대학교 통계학과 교수진 페이지입니다. 졸업생 명단, 논문, 프로젝트, 연구실 설립 연혁 등은 확인되지 않았으므로 임의 데이터를 게시하지 않았습니다.

원본 DSRI 사이트는 시각적/기능적 레퍼런스이며 타 사이트의 로고, 저작권이 있는 이미지, 문구를 그대로 포함하지 않습니다.
