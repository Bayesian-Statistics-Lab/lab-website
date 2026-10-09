import {NextResponse} from 'next/server';
import {publicDb} from '@/lib/supabase';
export async function GET(){const db=publicDb();if(!db)return NextResponse.json({ready:false,error:'회원가입 연결이 설정되지 않았습니다.'},{status:503});const {error}=await db.from('members').select('user_id').limit(0);const check=await db.from('profiles').select('academic_role,membership_status').limit(0);return NextResponse.json(error||check.error?{ready:false,error:'회원가입 기능 준비 중입니다. 관리자에게 문의해주세요.'}:{ready:true},{status:error||check.error?503:200})}
