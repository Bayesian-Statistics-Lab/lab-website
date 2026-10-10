import {publicMediaPaths} from '@/lib/public-media';
import {NextRequest,NextResponse} from 'next/server';
import {unstable_cache} from 'next/cache';
import {publicDb,privilegedDb,currentAccount} from '@/lib/supabase';
// Share the reference index across all images instead of querying each image separately.
const publicReferences=unstable_cache(async()=>{
 const db=publicDb();if(!db)return [] as string[];
 async function rows(table:string,columns:string,filter:string,value:unknown){
  const result:any[]=[];
  for(let offset=0;;offset+=1000){const {data,error}=await db!.from(table).select(columns).eq(filter,value).order('id').range(offset,offset+999);if(error)throw Error('공개 이미지 정보를 확인하지 못했습니다.');result.push(...(data||[]));if(!data||data.length<1000)return result}
 }
 const [members,posts,pages]=await Promise.all([rows('members','photo_url,bio','is_visible',true),rows('posts','body,category','status','published'),rows('pages','slug,body','status','published')]);
 return publicMediaPaths(members,posts,pages);
},['public-media-reference-index'],{revalidate:60,tags:['lab-public']});
let pendingReferences:Promise<string[]>|undefined;
function references(){return pendingReferences??=(publicReferences().finally(()=>{pendingReferences=undefined}))}
const publicImage=unstable_cache(async(storagePath:string)=>{
 if(!(await references()).includes(storagePath))return null;
 const service=privilegedDb();if(!service)return null;
 const {data}=await service.storage.from('lab-media').createSignedUrl(storagePath,300);
 return data?.signedUrl||null;
},['public-lab-image-v2'],{revalidate:60,tags:['lab-public']});
export async function GET(_req:NextRequest,{params}:{params:Promise<{path:string[]}>}){const {path}=await params;const storagePath=path.join('/');if(!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif|pdf)$/.test(storagePath))return new NextResponse(null,{status:404});const signed=await publicImage(storagePath);if(signed)return NextResponse.redirect(signed,{headers:{'Cache-Control':'public, max-age=30, s-maxage=30'}});const account=await currentAccount();if(!account)return new NextResponse(null,{status:404});if(!['admin','owner'].includes(account.role)){if(!storagePath.startsWith(account.user.id+'/'))return new NextResponse(null,{status:404});}const storage=privilegedDb();if(!storage)return new NextResponse(null,{status:404});const {data}=await storage.storage.from('lab-media').createSignedUrl(storagePath,120);if(!data)return new NextResponse(null,{status:404});return NextResponse.redirect(data.signedUrl,{headers:{'Cache-Control':'private, no-store'}})}
