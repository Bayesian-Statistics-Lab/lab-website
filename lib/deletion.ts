import type {SupabaseClient} from '@supabase/supabase-js';

// A successful HTTP response is not proof of deletion: RLS can affect zero rows.
export async function deleteRecord(db:SupabaseClient,type:'posts'|'members',id:string,authorId?:string){
  if(type==='members'){
    const linked=await db.from('organization_nodes').update({member_id:null}).eq('member_id',id);
    if(linked.error)return {data:null,error:linked.error};
  }
  let query=db.from(type).delete().eq('id',id);
  if(authorId)query=query.eq('author_id',authorId);
  return query.select('id').maybeSingle();
}
