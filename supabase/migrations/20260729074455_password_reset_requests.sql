-- Falah has no email/SMS provider, so "forgot password" can't be a self-serve
-- reset link. Instead it's a request queue a Master Admin works through by
-- hand (mirrors the signup-approval workflow) and resolves via the existing
-- "Edit user" password field.
create table public.password_reset_requests (
  id uuid primary key default gen_random_uuid(),
  identifier text not null,
  profile_id uuid references public.profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now(),
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz
);

alter table public.password_reset_requests enable row level security;

-- Whoever forgot their password isn't signed in, so this must allow anon.
create policy "Anyone can submit a password reset request"
  on public.password_reset_requests for insert
  to anon, authenticated
  with check (true);

create policy "Master admins can view password reset requests"
  on public.password_reset_requests for select
  using (public.current_user_role() = 'master_admin');

create policy "Master admins can resolve password reset requests"
  on public.password_reset_requests for update
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');
