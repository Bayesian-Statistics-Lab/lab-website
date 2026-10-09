import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import {cache} from 'react';
import { cookies } from 'next/headers';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const configured = Boolean(url && anon);
export function publicDb(){if(!url||!anon)return null;return createClient(url,anon,{auth:{persistSession:false}})}
export async function sessionDb(){if(!url||!anon)return null;const jar=await cookies();return createServerClient(url,anon,{cookies:{getAll(){return jar.getAll()},setAll(items){try{items.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* in server component */}}}})}
export async function requireAdmin(){const db=await sessionDb();if(!db)return null;const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data}=await db.from('profiles').select('role').eq('id',user.id).single();return data?.role==='admin'||data?.role==='owner'?{db,user,role:data.role}:null}
export function privilegedDb(){const key=process.env.SUPABASE_SECRET_KEY;if(!url||!key)return null;return createClient(url,key,{auth:{persistSession:false}})}

export const currentAccount=cache(async function currentAccount(){const db=await sessionDb();if(!db)return null;const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data:profile}=await db.from('profiles').select('*').eq('id',user.id).maybeSingle();const role=profile?.role||'viewer';return {db,user,profile,role,approved:role==='admin'||role==='owner'||Boolean(user.email_confirmed_at&&profile?.membership_status==='approved')};});
