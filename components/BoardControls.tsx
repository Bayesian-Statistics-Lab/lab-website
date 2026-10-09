"use client";
import Link from 'next/link';
import {useAccount} from './AccountProvider';
import {canWriteBoard,canManagePost} from '@/lib/permissions';
import PostActions from './PostActions';
export function BoardWrite({category}:{category:string}){const {account}=useAccount();if(!canWriteBoard(account,category))return null;return <div className="board-controls"><Link className="primary" href={'/write?category='+encodeURIComponent(category)}>글쓰기</Link><Link className="more" href="/account#my-posts">내 글 관리</Link></div>}
export function BoardActions({post}:{post:any}){const {account}=useAccount();return canManagePost(account,post)?<PostActions id={post.id}/>:null}
