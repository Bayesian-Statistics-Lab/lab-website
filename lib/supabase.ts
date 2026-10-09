import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const configured = Boolean(url && anon);
export function publicDb(){if(!url||!anon)return null;return createClient(url,anon,{auth:{persistSession:false}})}
export async function sessionDb(){if(!url||!anon)return null;const jar=await cookies();return createServerClient(url,anon,{cookies:{getAll(){return jar.getAll()},setAll(items){try{items.forEach(({name,value,options})=>jar.set(name,value,options))}catch{/* in server component */}}}})}
export async function requireAdmin(){const db=await sessionDb();if(!db)return null;const {data:{user}}=await db.auth.getUser();if(!user)return null;const {data}=await db.from('profiles').select('role').eq('id',user.id).single();return data?.role==='admin'||data?.role==='owner'?{db,user,role:data.role}:null}
export function privilegedDb(){if(!url||!process.env.SUPABASE_SERVICE_ROLE_KEY)return null;return createClient(url,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}})}
