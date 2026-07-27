-- General-purpose activity log. actor_id is who performed the action;
-- target_id is who/what it affected (often a member, sometimes null for
-- account-level actions). details holds action-specific context.
create table public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id) on delete set null,
  action text not null,
  target_type text not null,
  target_id uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index activity_log_target_id_idx on public.activity_log (target_id);
create index activity_log_actor_id_idx on public.activity_log (actor_id);

alter table public.activity_log enable row level security;

-- Any authenticated user can insert a log row for their own actions —
-- actor_id is trusted from the session, not client input, at the call site.
create policy "Authenticated users can insert activity_log"
  on public.activity_log for insert
  with check (actor_id = auth.uid());

create policy "Master admins view all activity_log"
  on public.activity_log for select
  using (public.current_user_role() = 'master_admin');

create policy "Admins view activity_log about their assigned members"
  on public.activity_log for select
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = activity_log.target_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Users view activity_log about themselves"
  on public.activity_log for select
  using (target_id = auth.uid() or actor_id = auth.uid());
