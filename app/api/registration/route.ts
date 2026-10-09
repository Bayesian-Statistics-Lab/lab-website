import {currentAccount,privilegedDb} from '@/lib/supabase';
import {ensureMemberApplication} from '@/lib/member-application';
import {revalidateTag} from 'next/cache';
import {NextResponse} from 'next/server';
import {publicDb} from '@/lib/supabase';
export async function GET(){const db=publicDb();if(!db)return NextResponse.json({ready:false,error:'회원가입 연결이 설정되지 않았습니다.'},{status:503});const {error}=await db.from('members').select('user_id').limit(0);const check=await db.from('profiles').select('academic_role,membership_status').limit(0);return NextResponse.json(error||check.error?{ready:false,error:'회원가입 기능 준비 중입니다. 관리자에게 문의해주세요.'}:{ready:true},{status:error||check.error?503:200})}

export async function POST(){const account=await currentAccount(),service=privilegedDb();const headers={'Cache-Control':'private, no-store'};if(!account)return NextResponse.json({error:'로그인이 필요합니다.'},{status:401,headers});if(!service)return NextResponse.json({error:'가입 신청 연결을 확인할 수 없습니다.'},{status:503,headers});if(account.role==='admin'||account.role==='owner')return NextResponse.json({ok:true,approved:account.approved},{headers});try{await ensureMemberApplication(service,account.user);revalidateTag('lab-public');return NextResponse.json({ok:true,approved:account.approved},{headers})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:'가입 신청 연결에 실패했습니다.'},{status:503,headers})}}
