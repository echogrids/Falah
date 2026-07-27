-- Stores the plaintext password for accounts Master Admin creates
-- directly, so it can be looked up later. Explicit, informed tradeoff:
-- normally Supabase Auth only ever stores a salted hash and this value
-- is unrecoverable by design. This table deliberately keeps a second,
-- retrievable copy — visible to Master Admin only. Treat this table as
-- sensitive: anyone who can read it can log in as anyone in it.
create table public.user_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  email text not null,
  plaintext_password text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.user_credentials enable row level security;

create policy "Master admins manage user_credentials"
  on public.user_credentials for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');
