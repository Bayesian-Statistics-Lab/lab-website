import {storageImageHeader} from '@/lib/image-transfer';
import {NextRequest,NextResponse} from 'next/server';import {z} from 'zod';
import {currentAccount,privilegedDb} from '@/lib/supabase';import {canWriteBoard} from '@/lib/permissions';import {imageTypes,imageLimit,ownImagePath,imageSignature} from '@/lib/media';import {allowGifUploads} from '@/lib/media-storage';
const headers={'Cache-Control':'private, no-store'};
export async function POST(req:NextRequest){return handle(req,false)}
export async function PATCH(req:NextRequest){return handle(req,true)}
async function handle(req:NextRequest,verify:boolean){
 const account=await currentAccount();if(!account)return NextResponse.json({error:'로그인이 필요합니다.'},{status:401,headers});
 const raw=await req.json().catch(()=>null);const category=z.string().min(1).max(180).safeParse(raw?.category);if(!category.success||!canWriteBoard(account,category.data))return NextResponse.json({error:'이 게시판에 사진을 올릴 권한이 없습니다.'},{status:403,headers});
 const storage=privilegedDb();if(!storage)return NextResponse.json({error:'사진 저장 연결을 확인해주세요.'},{status:503,headers});
 try{
 if(verify){const parsed=z.object({path:z.string().max(128)}).safeParse(raw);if(!parsed.success||!ownImagePath(account.user.id,parsed.data.path))return NextResponse.json({error:'본인이 업로드한 사진만 삽입할 수 있습니다.'},{status:400,headers});
 const path=parsed.data.path,bucket=storage.storage.from('lab-media');const {data:info,error:infoError}=await bucket.info(path);const size=info?.size??info?.metadata?.size??0,mime=info?.contentType||info?.metadata?.mimetype||'';
 if(infoError||!info||size<1||size>imageLimit||!imageTypes.includes(mime as typeof imageTypes[number]))return NextResponse.json({error:'지원하는 이미지와 10MB 이하 크기를 확인해주세요.'},{status:400,headers});
 const header=await storageImageHeader(storage,path);if(!imageSignature(header,mime))return NextResponse.json({error:'올바른 이미지 파일을 선택해주세요.'},{status:400,headers});return NextResponse.json({url:'/api/media/'+path},{headers});}
 const parsed=z.object({name:z.string().min(1).max(255),type:z.enum(imageTypes),size:z.number().int().min(1).max(imageLimit)}).safeParse(raw);if(!parsed.success)return NextResponse.json({error:'JPG, PNG, WebP, GIF 중 10MB 이하 파일을 선택해주세요.'},{status:400,headers});if(parsed.data.type==='image/gif')await allowGifUploads();
 const ext={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','image/gif':'gif'}[parsed.data.type];const path=`${account.user.id}/${crypto.randomUUID()}.${ext}`;const {data,error}=await storage.storage.from('lab-media').createSignedUploadUrl(path);if(error||!data)throw Error('사진 업로드를 준비하지 못했습니다.');return NextResponse.json({path:data.path,token:data.token,signedUrl:data.signedUrl},{headers});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'사진을 저장하지 못했습니다.'},{status:503,headers});}
}
