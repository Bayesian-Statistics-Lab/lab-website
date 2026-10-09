import {NextRequest,NextResponse} from 'next/server';
import {sessionDb} from '@/lib/supabase';
export async function GET(req:NextRequest){const code=req.nextUrl.searchParams.get('code');if(code){const db=await sessionDb();if(db){const {error}=await db.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/account',req.url));}}return NextResponse.redirect(new URL('/admin/login',req.url))}
