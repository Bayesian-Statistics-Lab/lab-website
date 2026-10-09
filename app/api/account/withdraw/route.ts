import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {currentAccount,privilegedDb,publicDb} from '@/lib/supabase';
import {revalidatePath,revalidateTag} from 'next/cache';
const headers={'Cache-Control':'private, no-store'};
export async function POST(req:NextRequest){
 const origin=req.headers.get('origin');
 let validOrigin=false;try{validOrigin=!!origin&&new URL(origin).host===req.headers.get('host')}catch{}
 if(!validOrigin)return NextResponse.json({error:'사이트에서 다시 요청해주세요.'},{status:403,headers});
 const account=await currentAccount();
 if(!account)return NextResponse.json({error:'로그인이 필요합니다.'},{status:401,headers});
 if(account.role==='admin'||account.role==='owner')return NextResponse.json({error:'관리자 계정은 권한을 이전한 후 탈퇴할 수 있습니다.'},{status:403,headers});
 const input=z.object({password:z.string().min(1).max(256),confirmation:z.literal('withdraw')}).safeParse(await req.json().catch(()=>null));
 if(!input.success)return NextResponse.json({error:'현재 비밀번호와 탈퇴 동의를 확인해주세요.'},{status:400,headers});
 const service=privilegedDb(),verify=publicDb();
 if(!service||!verify||!account.user.email)return NextResponse.json({error:'탈퇴 연결을 확인할 수 없습니다. 관리자에게 문의해주세요.'},{status:503,headers});
 const {data,error}=await verify.auth.signInWithPassword({email:account.user.email,password:input.data.password});
 if(error||data.user?.id!==account.user.id)return NextResponse.json({error:'비밀번호를 확인해주세요. 요청이 많다면 잠시 후 다시 시도해주세요.'},{status:401,headers});
 await verify.auth.signOut({scope:'local'});
 const result=await service.rpc('withdraw_lab_account',{target_user:account.user.id});
 if(result.error)return NextResponse.json({error:'탈퇴를 완료하지 못했습니다. 관리자에게 탈퇴 설정(004_account_withdrawal.sql)을 확인해주세요.'},{status:503,headers});
 await account.db.auth.signOut();
 revalidateTag('lab-public');revalidatePath('/','layout');
 return NextResponse.json({ok:true},{headers});
}
