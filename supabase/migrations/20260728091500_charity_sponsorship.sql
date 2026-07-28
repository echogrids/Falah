-- Charity Sponsorship: a fourth, independent module. Distinct from the
-- existing per-member Food Sponsorship tracker, this sponsors charity
-- institutions: a shared institution directory (added once, reused by
-- everyone), pledges ("offers") against an institution, and a payment
-- log per offer. paid_total/status are maintained by trigger, same
-- pattern as Qala/Sponsorship. Each offer carries its own currency (no
-- conversion, just a free-text label) since a family may sponsor
-- institutions in more than one currency.

create table public.charity_institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  notes text,
  default_currency text not null default 'Rs',
  is_active boolean not null default true,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.charity_offers (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.charity_institutions (id) on delete cascade,
  member_id uuid not null references public.profiles (id) on delete cascade,
  amount numeric not null check (amount > 0),
  currency text not null default 'Rs',
  remarks text,
  paid_total numeric not null default 0,
  status text not null default 'pending' check (status in ('pending', 'partial', 'fulfilled', 'cancelled')),
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create table public.charity_payments (
  id uuid primary key default gen_random_uuid(),
  offer_id uuid not null references public.charity_offers (id) on delete cascade,
  amount numeric not null check (amount > 0),
  remarks text,
  recorded_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

create function public.apply_charity_payment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.charity_offers
  set paid_total = paid_total + new.amount,
      status = case
        when status = 'cancelled' then status
        when paid_total + new.amount >= amount then 'fulfilled'
        when paid_total + new.amount > 0 then 'partial'
        else 'pending'
      end
  where id = new.offer_id;
  return new;
end;
$$;

create trigger on_charity_payment_insert
  after insert on public.charity_payments
  for each row execute function public.apply_charity_payment();

alter table public.charity_institutions enable row level security;
alter table public.charity_offers enable row level security;
alter table public.charity_payments enable row level security;

-- charity_institutions: a shared directory. Any Admin/Master Admin can
-- add and manage institutions; everyone (including Students) can view
-- the list, since they need it to pick an institution when making an offer.
create policy "Master admins manage charity_institutions"
  on public.charity_institutions for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Admins manage charity_institutions"
  on public.charity_institutions for all
  using (public.current_user_role() = 'admin')
  with check (public.current_user_role() = 'admin');

create policy "Everyone views charity_institutions"
  on public.charity_institutions for select
  using (true);

-- charity_offers: same self/assigned-admin shape as qala_balances.
create policy "Master admins manage charity_offers"
  on public.charity_offers for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own charity_offers"
  on public.charity_offers for select
  using (member_id = auth.uid());

create policy "Members insert their own charity_offers"
  on public.charity_offers for insert
  with check (
    member_id = auth.uid()
    and coalesce((select (module_access ->> 'charity')::boolean from public.profiles where id = auth.uid()), false)
  );

create policy "Admins manage assigned members' charity_offers"
  on public.charity_offers for all
  using (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = charity_offers.member_id
        and admin_members.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.admin_members
      where admin_members.member_id = charity_offers.member_id
        and admin_members.admin_id = auth.uid()
    )
  );

-- charity_payments: permission mirrors the parent offer's member_id.
create policy "Master admins manage charity_payments"
  on public.charity_payments for all
  using (public.current_user_role() = 'master_admin')
  with check (public.current_user_role() = 'master_admin');

create policy "Members view their own charity_payments"
  on public.charity_payments for select
  using (
    exists (
      select 1 from public.charity_offers
      where charity_offers.id = charity_payments.offer_id
        and charity_offers.member_id = auth.uid()
    )
  );

create policy "Members insert their own charity_payments"
  on public.charity_payments for insert
  with check (
    exists (
      select 1 from public.charity_offers
      where charity_offers.id = charity_payments.offer_id
        and charity_offers.member_id = auth.uid()
    )
    and coalesce((select (module_access ->> 'charity')::boolean from public.profiles where id = auth.uid()), false)
  );

create policy "Admins view assigned members' charity_payments"
  on public.charity_payments for select
  using (
    exists (
      select 1 from public.charity_offers
      join public.admin_members on admin_members.member_id = charity_offers.member_id
      where charity_offers.id = charity_payments.offer_id
        and admin_members.admin_id = auth.uid()
    )
  );

create policy "Admins insert assigned members' charity_payments"
  on public.charity_payments for insert
  with check (
    exists (
      select 1 from public.charity_offers
      join public.admin_members on admin_members.member_id = charity_offers.member_id
      where charity_offers.id = charity_payments.offer_id
        and admin_members.admin_id = auth.uid()
    )
  );
