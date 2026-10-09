import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sessionDb } from '@/lib/supabase';
import { confirmationError } from '@/lib/auth-callback';

const input = z.union([
  z.object({ code: z.string().min(1).max(4096) }),
  z.object({ token_hash: z.string().min(1).max(4096), type: z.enum(['email', 'signup']) }),
]);
export async function POST(req: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' };
  const origin = req.headers.get('origin');
  let validOrigin = !origin;
  try { if (origin) validOrigin = new URL(origin).host === req.headers.get('host'); } catch {}
  if (!validOrigin)
    return NextResponse.json({ error: '사이트에서 인증 링크를 다시 열어주세요.' }, { status: 403, headers });
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: '올바른 이메일 인증 링크를 열어주세요.' }, { status: 400, headers });
  const db = await sessionDb();
  if (!db) return NextResponse.json({ error: '이메일 인증 연결을 확인할 수 없습니다. 관리자에게 문의해주세요.' }, { status: 503, headers });
  const { error } = 'code' in parsed.data
    ? await db.auth.exchangeCodeForSession(parsed.data.code)
    : await db.auth.verifyOtp(parsed.data);
  if (error) {
    // A previously used link may be opened again after the user already signed in.
    const { data: { user } } = await db.auth.getUser();
    if (!user?.email_confirmed_at) return NextResponse.json({ error: confirmationError(error.code) }, { status: 400, headers });
  }
  return NextResponse.json({ ok: true }, { headers });
}
