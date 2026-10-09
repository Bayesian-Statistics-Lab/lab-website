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

// The schema cascades publication deletion to member links and Scholar external IDs.
export async function deletePublications(db:SupabaseClient,ids:string[]){return db.from('publications').delete().in('id',ids).select('id')}

// Linked member removal uses the same transaction as account withdrawal.
// Deleting only members would let application repair resurrect an approved account.
export async function deleteMemberAccount(db:SupabaseClient,id:string){
 const {data:member,error}=await db.from('members').select('id,user_id').eq('id',id).maybeSingle();
 if(error||!member)return {data:null,error};
 if(member.user_id){
  const result=await db.rpc('withdraw_lab_account',{target_user:member.user_id});
  return {data:result.error?null:{id},error:result.error};
 }
 const result=await deleteRecord(db,'members',id);
 if(result.error||!result.data)return result;
 const details=await db.from('pages').delete().in('slug',['settings/member/'+id,'settings/professor/'+id,'settings/alumni/'+id]);
 return {data:details.error?null:result.data,error:details.error};
}
