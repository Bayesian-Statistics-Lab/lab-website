'use client';
import Link from 'next/link';
import {useState} from 'react';import {useRouter} from 'next/navigation';import dynamic from 'next/dynamic';
import {useAccount} from './AccountProvider';import {isAdministrator} from '@/lib/permissions';
const PublicationEditor=dynamic(()=>import('@/features/publications/components/PublicationEditor'),{loading:()=> <p>편집 화면을 불러오는 중…</p>});
const AdminEditor=dynamic(()=>import('./AdminEditor'),{loading:()=> <p>편집 화면을 불러오는 중…</p>});
const ResearchEditor=dynamic(()=>import('./ResearchEditor'));
const HistoryEditor=dynamic(()=>import('./HistoryEditor'));
const BannerEditor=dynamic(()=>import('./BannerEditor'));
export default function AdminToolbar({type='pages',slug='',category='notice',id='',title='',children}:{type?:string;slug?:string;category?:string;id?:string;title?:string;children?:React.ReactNode}){
 const {account}=useAccount(),router=useRouter();const [editing,setEditing]=useState(false);
 if(type==='posts'||!isAdministrator(account?.role))return <>{title&&<h2 className="content-heading">{title}</h2>}{children}</>;
 if(type==='members')return <section className="editable-region member-management-region"><div className="inline-edit-toolbar"><Link className="secondary-button" href={'/admin?view=members'+(id?'&id='+id:'')}>{id?'소개 관리':'구성원 관리'}</Link></div>{children}</section>;
 const label=slug==='about/history'?'연혁 관리':type==='research'?'연구 분야 설정':slug==='home/banner'?'배너 수정':type==='members'?(id?'소개 편집':'구성원 관리'):type==='publications'?(id?'논문 편집':'논문 관리'):'본문 수정';
 const close=()=>{setEditing(false);router.refresh()};
 return <section className={'editable-region '+(slug==='home/banner'?'editable-banner':'')}><div className={title?'page-edit-heading':'inline-edit-toolbar'}>{title&&<h2 className="content-heading">{title}</h2>}<button type="button" className="secondary-button" onClick={()=>setEditing(!editing)}>{editing?'편집 닫기':label}</button></div>{editing?<div className="inline-editor">{slug==='about/history'?<HistoryEditor onDone={close} onCancel={()=>setEditing(false)}/>:type==='research'?<ResearchEditor onDone={close} onCancel={()=>setEditing(false)}/>:slug==='home/banner'?<BannerEditor/>:type==='publications'?<PublicationEditor initialId={id} focused onDone={close} onCancel={()=>setEditing(false)}/>:<AdminEditor initialType={type} initialSlug={slug} initialCategory={category} initialId={id} focused onDone={close} onCancel={()=>setEditing(false)}/>}</div>:children}</section>;
}
