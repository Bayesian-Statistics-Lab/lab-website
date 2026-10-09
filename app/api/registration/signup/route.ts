import {NextRequest,NextResponse} from 'next/server';
import {privilegedDb} from '@/lib/supabase';
import {signupSchema,signupMetadata} from '@/lib/signup';
import {ensureMemberApplication} from '@/lib/member-application';
const headers={'Cache-Control':'private, no-store'};
// Bound repeated submissions within each server instance; membership remains administrator-gated.
const attempts=new Map<string,{count:number;expires:number}>();
export async function POST(req:NextRequest){
 let sameOrigin=false;try{sameOrigin=new URL(req.headers.get('origin')||'').host===req.headers.get('host')}catch{}
 if(!sameOrigin)return NextResponse.json({error:'사이트에서 가입 신청을 해주세요.'},{status:403,headers});
 const ip=req.headers.get('x-vercel-forwarded-for')?.split(',')[0]||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown';
 const now=Date.now();for(const [key,value] of attempts)if(value.expires<=now)attempts.delete(key);
 const limit=attempts.get(ip)||{count:0,expires:now+15*60*1000};limit.count++;attempts.set(ip,limit);
 if(limit.count>5)return NextResponse.json({error:'가입 신청 요청이 많습니다. 잠시 후 다시 시도해주세요.'},{status:429,headers});
 if(Number(req.headers.get('content-length'))>20000)return NextResponse.json({error:'가입 신청 내용을 확인해주세요.'},{status:413,headers});
 const parsed=signupSchema.safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'가입 정보를 확인해주세요. 비밀번호는 10자 이상이어야 합니다.'},{status:400,headers});
 const service=privilegedDb();if(!service)return NextResponse.json({error:'가입 신청 연결을 확인할 수 없습니다. 관리자에게 문의해주세요.'},{status:503,headers});
 const {data,error}=await service.auth.admin.createUser({email:parsed.data.email,password:parsed.data.password,email_confirm:true,user_metadata:signupMetadata(parsed.data)});
 if(error||!data.user)return NextResponse.json({error:error?.code==='email_exists'?'이미 신청한 이메일입니다. 로그인하거나 관리자에게 신청 상태를 확인해주세요.':'가입 신청을 처리하지 못했습니다. 입력 정보를 확인하거나 관리자에게 문의해주세요.'},{status:400,headers});
 try{await ensureMemberApplication(service,data.user)}catch{return NextResponse.json({error:'계정이 생성되었지만 구성원 프로필 연결에 실패했습니다. 로그인하여 다시 연결하거나 관리자에게 문의해주세요.'},{status:503,headers})}
 return NextResponse.json({ok:true,status:'pending'},{headers});
}
