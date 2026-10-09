-- Run in Supabase SQL editor. Enable email/password Auth separately.
create extension if not exists pgcrypto;
create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, role text not null default 'viewer' check(role in ('viewer','admin','owner')), display_name text, created_at timestamptz not null default now());
create table if not exists public.pages (id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, lead text default '', body text default '', status text not null default 'draft' check(status in ('draft','published')), updated_at timestamptz default now());
create table if not exists public.posts (id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null, excerpt text default '', body text default '', category text not null default 'notice', status text not null default 'draft' check(status in ('draft','published')), published_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.members (id uuid primary key default gen_random_uuid(), name text not null, name_en text, role text default 'Researcher', bio text default '', email text, photo_url text, scholar_author_id text, is_visible boolean not null default false, sort_order integer not null default 100);
create table if not exists public.publications (id uuid primary key default gen_random_uuid(), title text not null, authors text[] not null default '{}', year integer, venue text, doi text, paper_url text, citation_count integer default 0, status text not null default 'draft' check(status in ('draft','published')), created_at timestamptz default now());
create unique index if not exists publications_doi_unique on public.publications(lower(doi)) where doi is not null;
create table if not exists public.member_publications(member_id uuid not null references public.members(id) on delete cascade,publication_id uuid not null references public.publications(id) on delete cascade,primary key(member_id,publication_id));
create table if not exists public.publication_external_ids(id uuid primary key default gen_random_uuid(),publication_id uuid not null references public.publications(id) on delete cascade,source text not null,external_id text not null,unique(source,external_id));
create table if not exists public.scholar_profiles (member_id uuid primary key references public.members(id) on delete cascade,author_id text not null,auto_sync boolean not null default true,last_synced_at timestamptz);
create table if not exists public.media_assets(id uuid primary key default gen_random_uuid(),storage_path text unique not null,display_name text,uploaded_by uuid references auth.users(id),created_at timestamptz default now());
create table if not exists public.documents(id uuid primary key default gen_random_uuid(),title text not null,category text not null default 'forms',storage_path text,description text,status text default 'draft' check(status in ('draft','published')));
create table if not exists public.history_entries(id uuid primary key default gen_random_uuid(),year integer not null,description text not null,sort_order integer default 100);
create table if not exists public.centers(id uuid primary key default gen_random_uuid(),slug text unique not null,title text not null,body text default '',status text default 'draft');
create table if not exists public.organization_nodes(id uuid primary key default gen_random_uuid(),parent_id uuid references public.organization_nodes(id),title text not null,member_id uuid references public.members(id),sort_order integer default 100);
create table if not exists public.audit_logs(id uuid primary key default gen_random_uuid(),actor_id uuid references auth.users(id),action text not null,entity_type text not null,entity_id uuid,created_at timestamptz default now());
create function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$select exists(select 1 from public.profiles where id=(select auth.uid()) and role in ('admin','owner'))$$;
-- Only explicitly published/visible records are readable by the public.
create or replace function public.enable_lab_rls() returns void language plpgsql security definer set search_path=public as $$
declare t text;begin
foreach t in array array['profiles','pages','posts','members','publications','member_publications','publication_external_ids','scholar_profiles','media_assets','documents','history_entries','centers','organization_nodes','audit_logs'] loop
 execute format('alter table public.%I enable row level security',t);
 execute format('create policy "admin_all_%s" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())',t,t);
end loop;
end$$;
select public.enable_lab_rls();drop function public.enable_lab_rls();
create policy "published_pages" on public.pages for select to anon,authenticated using(status='published');
create policy "published_posts" on public.posts for select to anon,authenticated using(status='published');
create policy "visible_members" on public.members for select to anon,authenticated using(is_visible=true);
create policy "published_publications" on public.publications for select to anon,authenticated using(status='published');
create policy "published_member_publications" on public.member_publications for select to anon,authenticated using(exists(select 1 from public.publications p where p.id=publication_id and p.status='published') and exists(select 1 from public.members m where m.id=member_id and m.is_visible=true));
create policy "published_documents" on public.documents for select to anon,authenticated using(status='published');
create policy "public_history" on public.history_entries for select to anon,authenticated using(true);
create policy "public_centers" on public.centers for select to anon,authenticated using(status='published');
create policy "public_organization" on public.organization_nodes for select to anon,authenticated using(true);
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types) values ('lab-media','lab-media',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf']) on conflict(id) do nothing;
create policy "admins_upload_lab_media" on storage.objects for insert to authenticated with check(bucket_id='lab-media' and public.is_admin());
create policy "admins_read_lab_media" on storage.objects for select to authenticated using(bucket_id='lab-media' and public.is_admin());
create policy "admins_delete_lab_media" on storage.objects for delete to authenticated using(bucket_id='lab-media' and public.is_admin());
-- IMPORTANT: after inviting a professor through Supabase Auth, grant role deliberately:
-- insert into public.profiles(id,role,display_name) values ('AUTH_USER_UUID','owner','연구실 관리자');

-- Verified starting profile (only institutional contact information; other members need confirmation).
insert into public.members(name,name_en,role,bio,email,is_visible,sort_order)
select '이광민','Kwangmin Lee','Principal Investigator','전남대학교 통계학과 조교수','klee564@jnu.ac.kr',true,1
where not exists(select 1 from public.members where email='klee564@jnu.ac.kr');
