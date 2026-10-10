import {boardOptions} from '@/lib/board-options';
import Link from 'next/link';
import {currentAccount} from '@/lib/supabase';
import {canManagePost,canWriteBoard} from '@/lib/permissions';
import {sections} from '@/lib/content';
import PostEditor from '@/components/PostEditor';
export const dynamic='force-dynamic';
export default async function Write({searchParams}:{searchParams:Promise<{id?:string;category?:string}>}){const qs=await searchParams;const account=await currentAccount();if(!account)return <main className="account-wrap"><h1>로그인 후 작성할 수 있습니다</h1><Link className="primary" href={'/admin/login?next='+encodeURIComponent('/write?'+new URLSearchParams(qs).toString())}>로그인</Link></main>;let post:any=null;if(qs.id&&/^[0-9a-f-]{36}$/.test(qs.id)){const {data}=await account.db.from('posts').select('*').eq('id',qs.id).maybeSingle();post=data;if(!post||!canManagePost(account,post))return <main className="account-wrap"><h1>이 글의 수정 권한이 없습니다</h1><Link href="/account">내 계정으로</Link></main>;}const category=post?.category||qs.category||'news';if(!canWriteBoard(account,category))return <main className="account-wrap"><h1>이 게시판의 작성 권한이 없습니다</h1><p>구성원은 관리자 승인 후 연구실 소식·학술활동·행사 게시판을 이용할 수 있습니다.</p><Link className="more" href="/account">가입 상태 확인</Link></main>;const label=boardOptions.find(([key])=>key===category)?.[1]||sections[category.replace('page:','')]?.title||'게시판';return <main className="account-wrap wide"><p className="kicker">{label}</p><h1>{post?'게시글 수정':'새 글 작성'}</h1><PostEditor category={category} post={post}/></main>}
