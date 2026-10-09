import Link from 'next/link';
import {currentAccount} from '@/lib/supabase';
import {canWriteBoard,canManagePost} from '@/lib/permissions';
import PostActions from './PostActions';
export async function BoardWrite({category}:{category:string}){const account=await currentAccount();if(!canWriteBoard(account,category))return null;return <div className="board-controls"><Link className="primary" href={'/write?category='+encodeURIComponent(category)}>글쓰기</Link><Link className="more" href="/account#my-posts">내 글 관리</Link></div>}
export async function BoardActions({post}:{post:any}){const account=await currentAccount();return canManagePost(account,post)?<PostActions id={post.id}/>:null}
