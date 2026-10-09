import {NextRequest,NextResponse} from 'next/server';
import {requireAdmin} from '@/lib/supabase';
import {serp} from '@/lib/scholar';
import {z} from 'zod';

// Scholar result_id, NOT a Scholar Author citation_id.
export async function POST(req:NextRequest){
 const ctx=await requireAdmin();
 if(!ctx)return NextResponse.json({error:'Unauthorized'},{status:401});
 const parsed=z.object({result_id:z.string().min(3).max(200)}).safeParse(await req.json().catch(()=>null));
 if(!parsed.success)return NextResponse.json({error:'result_id required'},{status:400});
 try {
  const response=await serp({engine:'google_scholar_cite',q:parsed.data.result_id});
  // Export links are ephemeral; do not save them as permanent document links.
  return NextResponse.json({citations:response.citations||[],export_links:response.links||[]});
 }catch {return NextResponse.json({error:'Citation service unavailable'},{status:502})}
}
