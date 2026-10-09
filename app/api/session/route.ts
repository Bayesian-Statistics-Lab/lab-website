import {NextResponse} from 'next/server';
import {currentAccount} from '@/lib/supabase';
export async function GET(){const a=await currentAccount();return NextResponse.json({account:a?{role:a.role,approved:a.approved,user:{id:a.user.id}}:null},{headers:{'Cache-Control':'private, no-store'}})}
