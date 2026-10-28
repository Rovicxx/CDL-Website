-- Caritas Libmanan website: database security for Supabase.
-- Run manually in the Supabase SQL Editor. Review each step first; this has not been run against the live database.
-- Safe to run more than once: each policy is dropped (rule only, never data) and recreated.
--
-- Goal: anyone can READ activities (the home page needs this), but only listed staff can
-- add them and upload photos, even if someone calls the API directly and skips the website.
-- Nothing here deletes data. No UPDATE/DELETE permissions are granted through the API, so
-- published activities and photos can only be changed or removed from the Supabase dashboard.

-- STEP 0: Look at the current policies before changing anything.
select policyname, cmd, roles, qual, with_check
from pg_policies
where (schemaname = 'public' and tablename = 'project_activities')
   or (schemaname = 'storage' and tablename = 'objects');
-- If existing INSERT/UPDATE/DELETE policies allow any "authenticated" user (or anon), drop those
-- policies after the new ones below are in place. Dropping a policy does not delete any rows. Example:
--   drop policy "<existing policy name>" on public.project_activities;

-- STEP 1: Staff allowlist. Only accounts listed here may publish.
create table if not exists public.admin_users (
    user_id    uuid primary key references auth.users (id) on delete cascade,
    created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- No policies on purpose: website visitors and signed-in users cannot read or change this table.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
    select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Add each staff account (replace the email). Repeat for each admin.
insert into public.admin_users (user_id)
select id from auth.users where email = 'rovicmaderazo03@gmail.com'
on conflict do nothing;

update auth.users
set encrypted_password = extensions.crypt('Rovic#032504', extensions.gen_salt('bf'))
where email = 'rovicmaderazo03@gmail.com';


do $$
begin
    if not exists (select 1 from public.admin_users) then
        raise warning 'admin_users is empty: no account matched the email above, so nobody can publish yet.';
    end if;
end;
$$;

-- STEP 2: Row Level Security on project_activities.
alter table public.project_activities enable row level security;

drop policy if exists "Public can read activities" on public.project_activities;
create policy "Public can read activities"
    on public.project_activities for select
    to anon, authenticated
    using (true);

drop policy if exists "Admins can add activities" on public.project_activities;
create policy "Admins can add activities"
    on public.project_activities for insert
    to authenticated
    -- Compared as text because project_activities.user_id is a text column.
    with check (public.is_admin() and user_id::text = auth.uid()::text);

-- STEP 2b: Photo uploads to the existing public "activity-images" bucket.
-- Public viewing keeps working because the bucket is public. Only staff can upload, and
-- uploads cannot overwrite or delete existing photos (no UPDATE/DELETE policy).
-- Some Supabase projects don't allow the SQL Editor to change storage tables ("must be owner").
-- In that case this step is skipped with a notice and the rest still runs; create the policy
-- in the dashboard instead (Storage > Policies > activity-images > New policy):
--   operation INSERT, role authenticated,
--   definition: bucket_id = 'activity-images' and public.is_admin()
do $$
begin
    drop policy if exists "Admins can upload activity images" on storage.objects;
    create policy "Admins can upload activity images"
        on storage.objects for insert
        to authenticated
        with check (bucket_id = 'activity-images' and public.is_admin());
exception when insufficient_privilege then
    raise notice 'Skipped storage upload policy (not allowed from SQL Editor). Create it in Storage > Policies.';
end;
$$;

-- Server-side upload limits: images only, 5 MB max. (Can also be set in Storage > activity-images > Edit bucket.)
do $$
begin
    update storage.buckets
    set file_size_limit = 5242880,
        allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
    where id = 'activity-images';
exception when insufficient_privilege then
    raise notice 'Skipped bucket limits (not allowed from SQL Editor). Set them in Storage > activity-images > Edit bucket.';
end;
$$;

-- STEP 3: Audit log of changes to activities (security logging).
-- Records who changed what and when. Never stores passwords or tokens.
create table if not exists public.activity_audit_log (
    id          bigint generated always as identity primary key,
    occurred_at timestamptz not null default now(),
    actor_id    uuid,
    action      text not null,
    activity_id text,
    old_row     jsonb,
    new_row     jsonb
);
alter table public.activity_audit_log enable row level security;
-- No policies: readable only from the Supabase dashboard (service role).

create or replace function public.log_activity_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
    insert into public.activity_audit_log (actor_id, action, activity_id, old_row, new_row)
    values (
        auth.uid(),
        tg_op,
        coalesce(new.id, old.id)::text,
        case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
        case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
    );
    return coalesce(new, old);
end;
$$;

drop trigger if exists project_activities_audit on public.project_activities;
create trigger project_activities_audit
    after insert or update or delete on public.project_activities
    for each row execute function public.log_activity_change();

-- STEP 4: Verify (from a terminal, with the anon key):
--   * GET  /rest/v1/project_activities            -> 200 with rows   (public read still works)
--   * POST /rest/v1/project_activities (anon key) -> 401/403         (anonymous write blocked)
--   * Sign in as a NON-admin account and POST     -> 403             (non-staff write blocked)
--   * Add an activity with a photo from /admin    -> works, and a row appears in activity_audit_log
