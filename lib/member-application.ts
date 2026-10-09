import type {SupabaseClient,User} from '@supabase/supabase-js';
import {academicTrack,requestedLabRole} from './membership-role.ts';
import {scholarId} from './permissions.ts';
// Repair missing trigger-created rows; existing roles and approvals are never overwritten.
export async function ensureMemberApplication(db:SupabaseClient,user:User){
 const [{data:existingProfile,error:profileLookup},{data:existingMember,error:memberLookup}]=await Promise.all([db.from('profiles').select('id').eq('id',user.id).maybeSingle(),db.from('members').select('id').eq('user_id',user.id).maybeSingle()]);
 if(profileLookup||memberLookup)throw Error('가입 상태를 확인하지 못했습니다.');
 if(existingProfile&&existingMember)return;
 const role=requestedLabRole(user.user_metadata)||requestedLabRole({lab_role:user.user_metadata.academic_role}),name=String(user.user_metadata.display_name||'').trim().slice(0,100);
 if(!role||!name)throw Error('가입 신청 정보를 확인할 수 없습니다. 관리자에게 문의해주세요.');
 const {error:profileError}=await db.from('profiles').upsert({id:user.id,role:'viewer',display_name:name,academic_role:academicTrack(role),membership_status:'pending'},{onConflict:'id',ignoreDuplicates:true});
 if(profileError)throw Error('가입 신청 정보를 저장하지 못했습니다.');
 const {data:profile,error}=await db.from('profiles').select('role,membership_status').eq('id',user.id).single();
 if(error)throw Error('가입 상태를 확인하지 못했습니다.');
 if(profile.role!=='viewer')return;
 const scholar=scholarId(String(user.user_metadata.scholar_author_id||''));
 const {error:memberError}=await db.from('members').upsert({user_id:user.id,name,name_en:String(user.user_metadata.name_en||'').slice(0,100),role,bio:String(user.user_metadata.bio||'').slice(0,5000),email:user.user_metadata.public_email===true?user.email:null,scholar_author_id:scholar||null,is_visible:Boolean(user.email_confirmed_at&&profile.membership_status==='approved')},{onConflict:'user_id',ignoreDuplicates:true});
 if(memberError)throw Error('구성원 프로필을 연결하지 못했습니다. 관리자에게 문의해주세요.');
}
