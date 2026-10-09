import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase';
export default async function AdminToolbar({type='pages',slug='',category='notice',id=''}:{type?:string;slug?:string;category?:string;id?:string}){if(!await requireAdmin())return null;const query=new URLSearchParams({type,slug,category,id});return <div className="admin-toolbar"><span>관리자 모드</span><Link href={'/admin?'+query.toString()+'#content'}>{id?'이 항목 수정':'이 페이지 관리'}</Link>{slug&&<Link href={'/admin?'+new URLSearchParams({type:'posts',category:'page:'+slug}).toString()+'#content'}>페이지 게시글 작성</Link>}</div>}
