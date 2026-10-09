import BoardWorkspace from '@/components/BoardWorkspace';import {BoardWrite} from '@/components/BoardControls';
import Link from 'next/link';
import {currentAccount} from '@/lib/supabase';
import {isAdministrator,canManagePost} from '@/lib/permissions';
import AccountForm from '@/components/AccountForm';
import ProfilePhoto from '@/components/ProfilePhoto';
import PostActions from '@/components/PostActions';
import SignOut from '@/components/SignOut';
export const dynamic='force-dynamic';
export default async function Account(){
  const account=await currentAccount();
  if(!account)return <main className="account-wrap auth-wrap"><p className="kicker">MY ACCOUNT</p><h1>로그인이 필요합니다</h1><section className="auth-card"><p className="muted">로그인하면 내 프로필과 게시글을 관리할 수 있습니다.</p><Link className="primary" href="/admin/login?next=%2Faccount">로그인</Link><div className="auth-links"><Link href="/register">구성원 회원가입</Link></div></section></main>;
  const [memberResult,postsResult]=await Promise.all([
    account.db.from('members').select('*').eq('user_id',account.user.id).maybeSingle(),
    account.db.from('posts').select('id,title,status,category,author_id').eq('author_id',account.user.id).order('created_at',{ascending:false}),
  ]);
  const member=memberResult.data,posts=postsResult.data,admin=isAdministrator(account.role);
  return <main className="account-wrap wide"><div className="dashboard-heading"><div><p className="kicker">MY ACCOUNT</p><h1>마이페이지</h1><p>{account.profile?.display_name||'연구실 구성원'} · {account.user.email}</p></div><SignOut/></div><div className="status-card"><strong>{admin?'관리자 계정':account.approved?'승인된 구성원':account.profile?.membership_status==='rejected'?'가입 신청 미승인':'관리자 승인 대기'}</strong><p>{admin?'홈페이지 콘텐츠와 구성원 가입 신청을 관리할 수 있습니다.':account.approved?'내 프로필을 변경하고 연구실 소식·학술활동·행사를 작성할 수 있습니다.':'프로필과 사진을 먼저 작성해주세요. 관리자 승인 후 구성원 페이지에 표시됩니다.'}</p></div><nav className="account-tabs" aria-label="마이페이지 메뉴">{member&&<a href="#my-profile">내 프로필</a>}<a href="#my-posts">내 게시글</a>{admin&&<Link href="/admin">관리자 대시보드 ↗</Link>}</nav>{member?<div className="account-profile-grid" id="my-profile"><ProfilePhoto member={member}/><AccountForm member={member}/></div>:<div className="notice" style={{marginTop:24}}>계정에 연결된 구성원 프로필이 없습니다. {admin?<Link href="/admin?view=members">구성원 관리에서 확인해주세요.</Link>:'관리자에게 계정 연결을 요청해주세요.'}</div>}<BoardWorkspace category="news"><section className="admin-box account-section" id="my-posts"><h2>내 게시글</h2>{posts?.map(post=><div className="cms-row" key={post.id}><div><strong>{post.title}</strong><p>{post.status==='published'?'게시 중':'임시저장'}</p></div>{canManagePost(account,post)&&<PostActions id={post.id}/>}</div>)}{!posts?.length&&<div className="empty"><p>아직 작성한 게시글이 없습니다.</p>{account.approved&&<BoardWrite category="news"/>}</div>}{postsResult.error&&<p className="error">게시글 목록을 불러오지 못했습니다. 잠시 후 다시 확인해주세요.</p>}</section></BoardWorkspace><div className="auth-links"><Link href="/news">연구실 소식</Link><Link href="/people">구성원 페이지</Link></div></main>;
}
