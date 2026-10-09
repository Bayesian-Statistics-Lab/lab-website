-- Run once after 001_schema.sql. Safe to re-run. No existing content is deleted.
begin;
alter table public.profiles add column if not exists academic_role text check(academic_role in ('Masters','PhD','Undergraduate','Alumni'));
alter table public.profiles add column if not exists membership_status text not null default 'pending' check(membership_status in ('pending','approved','rejected'));
alter table public.members add column if not exists user_id uuid unique references auth.users(id) on delete set null;
alter table public.posts add column if not exists author_id uuid references auth.users(id) on delete set null;
update public.profiles set membership_status='approved' where role in ('admin','owner');
create or replace function public.is_lab_member() returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and membership_status='approved')
$$;
drop policy if exists own_profile on public.profiles;
create policy own_profile on public.profiles for select to authenticated using(id=(select auth.uid()));
drop policy if exists own_member on public.members;
create policy own_member on public.members for select to authenticated using(user_id=(select auth.uid()));
drop policy if exists own_posts_read on public.posts;
create policy own_posts_read on public.posts for select to authenticated using(author_id=(select auth.uid()));
drop policy if exists own_posts_insert on public.posts;
create policy own_posts_insert on public.posts for insert to authenticated with check(author_id=(select auth.uid()) and public.is_lab_member() and category in ('news','academic','events'));
drop policy if exists own_posts_update on public.posts;
create policy own_posts_update on public.posts for update to authenticated using(author_id=(select auth.uid()) and public.is_lab_member() and category in ('news','academic','events')) with check(author_id=(select auth.uid()) and public.is_lab_member() and category in ('news','academic','events'));
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
drop trigger if exists on_lab_member_signup on auth.users;
create trigger on_lab_member_signup after insert on auth.users for each row execute procedure public.register_lab_member();
commit;
-- Atomic approval: no member can approve themselves or promote their site role.
create or replace function public.review_lab_member(target_user uuid, approve boolean) returns void language plpgsql security definer set search_path=public as $$
declare member_uuid uuid;
begin
 if not public.is_admin() then raise exception 'Administrator access required'; end if;
 if not exists(select 1 from public.profiles where id=target_user and role='viewer') then raise exception 'Not a member application'; end if;
 if approve and not exists(select 1 from auth.users where id=target_user and email_confirmed_at is not null) then raise exception 'Email confirmation is required before approval'; end if;
 select id into member_uuid from public.members where user_id=target_user;
 if member_uuid is null then raise exception 'Member application not found'; end if;
 update public.profiles set membership_status=case when approve then 'approved' else 'rejected' end where id=target_user;
 update public.members set is_visible=approve where id=member_uuid;
 update public.scholar_profiles set auto_sync=approve where member_id=member_uuid;
end $$;
revoke all on function public.review_lab_member(uuid,boolean) from public;
grant execute on function public.review_lab_member(uuid,boolean) to authenticated;
