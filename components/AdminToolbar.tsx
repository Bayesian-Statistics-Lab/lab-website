'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import dynamic from 'next/dynamic';
import {useAccount} from './AccountProvider';import {isAdministrator} from '@/lib/permissions';
const AdminEditor=dynamic(()=>import('./AdminEditor'),{loading:()=> <p>편집 화면을 불러오는 중…</p>});
const BannerEditor=dynamic(()=>import('./BannerEditor'));
export default function AdminToolbar({type='pages',slug='',category='notice',id='',children}:{type?:string;slug?:string;category?:string;id?:string;children?:React.ReactNode}){
 const {account}=useAccount(),router=useRouter();const [editing,setEditing]=useState(false);
 if(type==='posts'||!isAdministrator(account?.role))return <>{children}</>;
 const label=slug==='home/banner'?'배너 수정':type==='members'?'구성원 수정':type==='publications'?'논문 수정':'본문 수정';
 const close=()=>{setEditing(false);router.refresh()};
 return <><div className="inline-edit-toolbar"><span>{editing?'현재 페이지 편집 중':'페이지 관리'}</span><button type="button" className="secondary-button" onClick={()=>setEditing(!editing)}>{editing?'편집 닫기':label}</button></div>{editing?<div className="inline-editor">{slug==='home/banner'?<BannerEditor/>:<AdminEditor initialType={type} initialSlug={slug} initialCategory={category} initialId={id} focused onDone={close} onCancel={()=>setEditing(false)}/>}</div>:children}</>;
}
