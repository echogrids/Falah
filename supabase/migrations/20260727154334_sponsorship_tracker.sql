-- Sponsorship Tracker: independent of the other modules. Running totals
-- per member (intended/donated/pending), maintained by trigger from an
-- append-only transaction log, mirroring the Qala tracker's pattern.

create table public.sponsorships (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade unique,
  intended_total numeric not null default 0,
  donated_total numeric not null default 0,
  pending_total numeric not null default 0,
  updated_at timestamptz not null default now()
);

create table public.sponsorship_transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.profiles (id) on delete cascade,
  type text not null check (type in ('intended', 'donated', 'pending')),
  amount numeric not null check (amount > 0),
  note text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create function public.apply_sponsorship_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sponsorships (member_id, intended_total, donated_total, pending_total)
  values (
    new.member_id,
    case when new.type = 'intended' then new.amount else 0 end,
    case when new.type = 'donated' then new.amount else 0 end,
    case when new.type = 'pending' then new.amount else 0 end
  )
  on conflict (member_id) do update set
    intended_total = public.sponsorships.intended_total
      + case when new.type = 'intended' then new.amount else 0 end,
    donated_total = public.sponsorships.donated_total
      + case when new.type = 'donated' then new.amount else 0 end,
    pending_total = public.sponsorships.pending_total
      + case when new.type = 'pending' then new.amount else 0 end,
    updated_at = now();
  return new;
end;
$$;

create trigger on_sponsorship_transaction_insert
  after insert on public.sponsorship_transactions
  for each row execute function public.apply_sponsorship_transaction();

alter table public.sponsorships enable row level security;
alter table public.sponsorship_transactions enable row level security;

create policy "Master admins manage sponsorships"
  on public.sponsorships for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own sponsorships"
  on public.sponsorships for select
  using (member_id = auth.uid());

create policy "Admins manage assigned members' sponsorships"
  on public.sponsorships for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = sponsorships.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = sponsorships.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Master admins manage sponsorship_transactions"
  on public.sponsorship_transactions for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members log and view their own sponsorship_transactions"
  on public.sponsorship_transactions for select
  using (member_id = auth.uid());

create policy "Members insert their own sponsorship_transactions"
  on public.sponsorship_transactions for insert
  with check (member_id = auth.uid());

create policy "Admins view assigned members' sponsorship_transactions"
  on public.sponsorship_transactions for select
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = sponsorship_transactions.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Admins insert assigned members' sponsorship_transactions"
  on public.sponsorship_transactions for insert
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = sponsorship_transactions.member_id
        and admin_members.admin_id = auth.uid()
    )
  );
