-- Run after 001, 002, 003. Account and profile removal is one transaction.
begin;
create or replace function public.withdraw_lab_account(target_user uuid)
returns void language plpgsql security definer set search_path=public as $$
declare member_uuid uuid;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Server access required'; end if;
 if exists(select 1 from public.profiles where id=target_user and role in ('admin','owner')) then raise exception 'Transfer administrator access first'; end if;
 if not exists(select 1 from auth.users where id=target_user) then raise exception 'Account not found'; end if;
 select id into member_uuid from public.members where user_id=target_user;
 if member_uuid is not null then
  delete from public.pages where slug in ('settings/member/'||member_uuid::text,'settings/alumni/'||member_uuid::text,'settings/professor/'||member_uuid::text);
  update public.organization_nodes set member_id=null where member_id=member_uuid;
  delete from public.members where id=member_uuid;
 end if;
 update public.media_assets set uploaded_by=null where uploaded_by=target_user;
 update public.audit_logs set actor_id=null where actor_id=target_user;
 -- Existing posts retain their contents, with author_id set null by the FK.
 delete from auth.users where id=target_user;
end $$;
revoke all on function public.withdraw_lab_account(uuid) from public,anon,authenticated;
grant execute on function public.withdraw_lab_account(uuid) to service_role;
commit;
