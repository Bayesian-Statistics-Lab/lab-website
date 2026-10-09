import {NextRequest, NextResponse} from 'next/server';
import {sessionDb} from '@/lib/supabase';
export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin) return NextResponse.json({error:'잘못된 요청입니다.'},{status:403});
  const db = await sessionDb();
  if (db) { const {error} = await db.auth.signOut({scope:'local'}); if (error) return NextResponse.json({error:'로그아웃하지 못했습니다. 다시 시도해주세요.'},{status:502}); }
  return NextResponse.json({ok:true}, {headers:{'Cache-Control':'private, no-store'}});
}
