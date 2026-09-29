-- Caritas Libmanan website: database security for Supabase.
-- Run manually in the Supabase SQL Editor. Review each step first; this has not been run against the live database.
--
-- Goal: anyone can READ activities (the home page needs this), but only listed staff can
-- add, change, or delete them, even if someone calls the API directly and skips the website.

-- STEP 0: Look at the current policies before changing anything.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'project_activities';
-- If existing INSERT/UPDATE/DELETE policies allow any "authenticated" user, drop them after the
-- new policies below are in place, for example:
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
select id from auth.users where email = 'REPLACE_WITH_ADMIN_EMAIL'
on conflict do nothing;

-- STEP 2: Row Level Security on project_activities.
alter table public.project_activities enable row level security;

create policy "Public can read activities"
    on public.project_activities for select
    to anon, authenticated
    using (true);

create policy "Admins can add activities"
    on public.project_activities for insert
    to authenticated
    with check (public.is_admin() and user_id = auth.uid());

create policy "Admins can update activities"
    on public.project_activities for update
    to authenticated
    using (public.is_admin())
    with check (public.is_admin());

create policy "Admins can delete activities"
    on public.project_activities for delete
    to authenticated
    using (public.is_admin());

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
--   * Add an activity from the website as staff   -> works, and a row appears in activity_audit_log
