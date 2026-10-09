-- Apply after 002_membership.sql. Existing users/content are preserved.
begin;
alter table public.profiles drop constraint if exists profiles_academic_role_check;
alter table public.profiles add constraint profiles_academic_role_check check(academic_role in ('Masters','PhD','Undergraduate','Alumni'));
create or replace function public.register_lab_member() returns trigger language plpgsql security definer set search_path=public as $$
declare degree text; member_uuid uuid; scholar text; person_name text;
begin
 degree:=new.raw_user_meta_data->>'academic_role';
 if degree is null or degree not in ('Masters','PhD','Undergraduate','Alumni') then return new; end if;
 person_name:=left(trim(new.raw_user_meta_data->>'display_name'),100);
 if person_name is null or person_name='' then return new; end if;
 scholar:=new.raw_user_meta_data->>'scholar_author_id';
 if scholar is not null and scholar !~ '^[A-Za-z0-9_-]{6,64}$' then scholar:=null; end if;
 insert into public.profiles(id,role,display_name,academic_role,membership_status) values(new.id,'viewer',person_name,degree,'pending') on conflict(id) do nothing;
 insert into public.members(user_id,name,name_en,role,bio,email,scholar_author_id,is_visible) values(new.id,person_name,left(new.raw_user_meta_data->>'name_en',100),degree,left(coalesce(new.raw_user_meta_data->>'bio',''),5000),case when new.raw_user_meta_data->>'public_email'='true' then new.email else null end,scholar,false) on conflict(user_id) do nothing returning id into member_uuid;
 if member_uuid is not null and scholar is not null and scholar<>'' then insert into public.scholar_profiles(member_id,author_id,auto_sync) values(member_uuid,scholar,false) on conflict(member_id) do nothing; end if;
 return new;
end $$;

create or replace function public.update_my_lab_profile(person_name text, english_name text, degree text, biography text, scholar text, publish_email boolean) returns void language plpgsql security definer set search_path=public as $$
declare person_id uuid; member_uuid uuid; approved boolean; user_email text;
begin
 person_id:=auth.uid();
 if person_id is null then raise exception 'Authentication required'; end if;
 if degree not in ('Masters','PhD','Undergraduate','Alumni') or length(trim(person_name)) not between 1 and 100 or length(biography)>5000 or length(english_name)>100 then raise exception 'Invalid profile'; end if;
 if scholar is not null and scholar<>'' and scholar !~ '^[A-Za-z0-9_-]{6,64}$' then raise exception 'Invalid Scholar ID'; end if;
 select id into member_uuid from public.members where user_id=person_id;
 if member_uuid is null then raise exception 'Member profile not found'; end if;
 select email into user_email from auth.users where id=person_id;
 select membership_status='approved' into approved from public.profiles where id=person_id;
 update public.members set name=trim(person_name),name_en=english_name,role=degree,bio=biography,scholar_author_id=nullif(scholar,''),email=case when publish_email then user_email else null end where id=member_uuid;
 update public.profiles set display_name=trim(person_name),academic_role=degree where id=person_id;
 if scholar is not null and scholar<>'' then
  insert into public.scholar_profiles(member_id,author_id,auto_sync) values(member_uuid,scholar,coalesce(approved,false)) on conflict(member_id) do update set author_id=excluded.author_id,auto_sync=excluded.auto_sync;
 else update public.scholar_profiles set auto_sync=false where member_id=member_uuid;
 end if;
end $$;
revoke all on function public.update_my_lab_profile(text,text,text,text,text,boolean) from public;
grant execute on function public.update_my_lab_profile(text,text,text,text,text,boolean) to authenticated;
commit;
