'use client';
import {createContext,useContext,useState,useRef} from 'react';import dynamic from 'next/dynamic';
const PostEditor=dynamic(()=>import('./PostEditor'),{ssr:false,loading:()=> <p role="status">작성 화면을 불러오는 중…</p>});
const Context=createContext<{open:(id?:string)=>void}|null>(null);export function useBoardWorkspace(){return useContext(Context)}
export default function BoardWorkspace({category,children}:{category:string;children:React.ReactNode}){
 const [editing,setEditing]=useState(false),[post,setPost]=useState<any>(null),[loading,setLoading]=useState(false),[error,setError]=useState('');const pane=useRef<HTMLDivElement>(null);const requestVersion=useRef(0);
 async function open(id?:string){const version=++requestVersion.current;setLoading(Boolean(id));setEditing(true);setError('');setPost(null);pane.current?.scrollIntoView({behavior:'smooth',block:'start'});if(!id)return;setLoading(true);try{const r=await fetch('/api/board?id='+encodeURIComponent(id),{cache:'no-store'});const j=await r.json();if(!r.ok)throw Error(j.error);if(requestVersion.current===version)setPost(j.data)}catch(e){if(requestVersion.current===version)setError(e instanceof Error?e.message:'게시글을 불러오지 못했습니다.')}finally{if(requestVersion.current===version)setLoading(false)}}
 const close=()=>{requestVersion.current++;setLoading(false);setEditing(false);setPost(null);setError('')};
 return <Context.Provider value={{open}}><div ref={pane} className="board-workspace">{editing?<><div className="workspace-title"><h2>{post?'게시글 수정':'새 게시글 작성'}</h2><button type="button" className="secondary-button" onClick={close}>목록으로</button></div>{loading?<p role="status">게시글을 불러오는 중…</p>:error?<p className="error" role="alert">{error}</p>:<PostEditor category={post?.category||category} post={post} onCancel={close} onDone={close}/>}</>:children}</div></Context.Provider>;
}
