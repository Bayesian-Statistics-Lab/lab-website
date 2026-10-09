"use client";
import {useBoardWorkspace} from './BoardWorkspace';

import Link from 'next/link';
import {useAccount} from './AccountProvider';
import {canWriteBoard,canManagePost} from '@/lib/permissions';
import PostActions from './PostActions';
export function BoardWrite({category,manageLink=true}:{category:string;manageLink?:boolean}){const workspace=useBoardWorkspace();const {account}=useAccount();if(!canWriteBoard(account,category))return null;return <div className="board-controls">{workspace?<button className="primary" type="button" onClick={()=>workspace.open()}>글쓰기</button>:<Link className="primary" href={'/write?category='+encodeURIComponent(category)}>글쓰기</Link>}{manageLink&&<Link className="secondary-button" href="/account#my-posts">내 글 관리</Link>}</div>}
export function BoardActions({post}:{post:any}){const {account}=useAccount();return canManagePost(account,post)?<PostActions id={post.id}/>:null}
