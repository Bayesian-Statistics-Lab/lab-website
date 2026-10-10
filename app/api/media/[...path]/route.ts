import {mediaVariant} from '@/lib/media-variants';
import {imageDerivative} from '@/server/media/image-transform';
import {boundedBytes,streamMedia} from '@/server/media/media-transfer';
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
const derivativeCache=unstable_cache(async(storagePath:string,width:number,animated:boolean)=>{
 const service=privilegedDb();if(!service)return null;
 const {data,error}=await service.storage.from('lab-media').createSignedUrl(storagePath,120);if(error||!data)throw Error('Media unavailable');
 const original=await fetch(data.signedUrl,{cache:'no-store',signal:AbortSignal.timeout(20000)});
 // A transient upstream failure must not become a cached failed conversion.
 if(!original.ok)throw Error('Media unavailable');
 if(Number(original.headers.get('content-length'))>10*1024*1024){await original.body?.cancel();return null}
 const result=await imageDerivative(await boundedBytes(original),{width,animated});return result?{data:result.bytes.toString('base64'),type:result.type}:null;
},['media-derivatives-v1'],{revalidate:3600,tags:['lab-public']});
const pendingDerivatives=new Map<string,ReturnType<typeof derivativeCache>>();
function derivative(path:string,width:number,animated:boolean){const key=path+':'+width+':'+animated;let pending=pendingDerivatives.get(key);if(!pending){pending=derivativeCache(path,width,animated).finally(()=>pendingDerivatives.delete(key));pendingDerivatives.set(key,pending)}return pending}
export async function GET(req:NextRequest,{params}:{params:Promise<{path:string[]}>}){
 const {path}=await params;const storagePath=path.join('/');
 if(!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp|gif|pdf)$/.test(storagePath))return new NextResponse(null,{status:404});
 const privatePhoto=req.nextUrl.searchParams.get('private')==='1';
 let signed:string|null=null,isPublic=false;
 // Account photos already identify the signed-in owner; avoid a public index scan for them.
 if(!privatePhoto){signed=await publicImage(storagePath);isPublic=!!signed}
 if(!signed){
  const account=await currentAccount();if(!account)return new NextResponse(null,{status:404});
  if(!['admin','owner'].includes(account.role)&&!storagePath.startsWith(account.user.id+'/'))return new NextResponse(null,{status:404});
 }
 const extension=storagePath.split('.').pop()!,variant=mediaVariant(req.nextUrl.searchParams,extension);
 const cacheControl=isPublic?'public, max-age=60, s-maxage=60':'private, no-store';
 if(variant){const result=await derivative(storagePath,variant.width,variant.animated).catch(()=>null);if(result)return new Response(Buffer.from(result.data,'base64'),{headers:{'Content-Type':result.type,'Cache-Control':cacheControl,'X-Content-Type-Options':'nosniff'}})}
 if(!signed){const storage=privilegedDb();if(!storage)return new NextResponse(null,{status:404});const {data}=await storage.storage.from('lab-media').createSignedUrl(storagePath,120);if(!data)return new NextResponse(null,{status:404});signed=data.signedUrl}
 if(extension==='pdf')return NextResponse.redirect(signed,{headers:{'Cache-Control':isPublic?'public, max-age=30, s-maxage=30':'private, no-store'}});
 // A stable same-origin response allows CDN reuse without a second browser connection.
 try{return await streamMedia(signed,cacheControl)}catch{return new NextResponse(null,{status:502,headers:{'Cache-Control':'no-store'}})}
}
