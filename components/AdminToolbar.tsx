'use client';
import Link from 'next/link';
import {useState} from 'react';import {useRouter} from 'next/navigation';import dynamic from 'next/dynamic';
import {useAccount} from './AccountProvider';import {isAdministrator} from '@/lib/permissions';
const AdminEditor=dynamic(()=>import('./AdminEditor'),{loading:()=> <p>편집 화면을 불러오는 중…</p>});
const ResearchEditor=dynamic(()=>import('./ResearchEditor'));
const BannerEditor=dynamic(()=>import('./BannerEditor'));
export default function AdminToolbar({type='pages',slug='',category='notice',id='',children}:{type?:string;slug?:string;category?:string;id?:string;children?:React.ReactNode}){
 const {account}=useAccount(),router=useRouter();const [editing,setEditing]=useState(false);
 if(type==='posts'||!isAdministrator(account?.role))return <>{children}</>;
 if(type==='members')return <section className="editable-region member-management-region"><div className="inline-edit-toolbar"><Link className="secondary-button" href={'/admin?view=members'+(id?'&id='+id:'')}>{id?'소개 관리':'구성원 관리'}</Link></div>{children}</section>;
 const label=type==='research'?'연구 분야 설정':slug==='home/banner'?'배너 수정':type==='members'?(id?'소개 편집':'구성원 관리'):type==='publications'?(id?'논문 편집':'논문 관리'):'본문 수정';
 const close=()=>{setEditing(false);router.refresh()};
 return <section className={'editable-region '+(slug==='home/banner'?'editable-banner':'')}><div className="inline-edit-toolbar"><button type="button" className="secondary-button" onClick={()=>setEditing(!editing)}>{editing?'편집 닫기':label}</button></div>{editing?<div className="inline-editor">{type==='research'?<ResearchEditor onDone={close} onCancel={()=>setEditing(false)}/>:slug==='home/banner'?<BannerEditor/>:<AdminEditor initialType={type} initialSlug={slug} initialCategory={category} initialId={id} focused onDone={close} onCancel={()=>setEditing(false)}/>}</div>:children}</section>;
}
