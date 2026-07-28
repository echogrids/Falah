-- Performance pass: add missing indexes on columns filtered directly by RLS
-- policies or app queries (these tables are append-only logs that only
-- grow), and rewrap every policy's bare auth.uid() as (select auth.uid())
-- so Postgres can evaluate it once per statement (InitPlan) instead of
-- once per row — see https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select
-- Policy definitions below are reproduced verbatim from the live database
-- (pg_policies), only wrapping auth.uid() calls.

-- ---------- Indexes ----------
create index if not exists qala_transactions_member_id_idx on public.qala_transactions (member_id);
create index if not exists qala_balance_adjustments_member_id_idx on public.qala_balance_adjustments (member_id);
create index if not exists sponsorship_transactions_member_id_idx on public.sponsorship_transactions (member_id);
create index if not exists charity_offers_member_id_idx on public.charity_offers (member_id);
create index if not exists charity_payments_offer_id_idx on public.charity_payments (offer_id);
create index if not exists profiles_requested_admin_id_idx on public.profiles (requested_admin_id);
create index if not exists admin_members_member_id_idx on public.admin_members (member_id);

-- ---------- RLS: activity_log ----------
alter policy "Admins view activity_log about their assigned members"
  on public.activity_log
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = activity_log.target_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Authenticated users can insert activity_log"
  on public.activity_log
  with check (actor_id = (select auth.uid()));

alter policy "Users view activity_log about themselves"
  on public.activity_log
  using (target_id = (select auth.uid()) or actor_id = (select auth.uid()));

-- ---------- RLS: additional_worship_entries ----------
alter policy "Admins manage their assigned members' additional_worship_entrie"
  on public.additional_worship_entries
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = additional_worship_entries.member_id
      and admin_members.admin_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = additional_worship_entries.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members manage their own additional_worship_entries"
  on public.additional_worship_entries
  using (member_id = (select auth.uid()))
  with check (member_id = (select auth.uid()));

-- ---------- RLS: admin_members ----------
alter policy "Admins can create their own assignments"
  on public.admin_members
  with check (admin_id = (select auth.uid()));

alter policy "Admins can view their own assignments"
  on public.admin_members
  using (admin_id = (select auth.uid()));

-- ---------- RLS: charity_offers ----------
alter policy "Admins manage assigned members' charity_offers"
  on public.charity_offers
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = charity_offers.member_id
      and admin_members.admin_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = charity_offers.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members insert their own charity_offers"
  on public.charity_offers
  with check (
    member_id = (select auth.uid())
    and coalesce((
      select (profiles.module_access ->> 'charity')::boolean
      from profiles
      where profiles.id = (select auth.uid())
    ), false)
  );

alter policy "Members view their own charity_offers"
  on public.charity_offers
  using (member_id = (select auth.uid()));

-- ---------- RLS: charity_payments ----------
alter policy "Admins insert assigned members' charity_payments"
  on public.charity_payments
  with check (exists (
    select 1 from charity_offers
    join admin_members on admin_members.member_id = charity_offers.member_id
    where charity_offers.id = charity_payments.offer_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Admins view assigned members' charity_payments"
  on public.charity_payments
  using (exists (
    select 1 from charity_offers
    join admin_members on admin_members.member_id = charity_offers.member_id
    where charity_offers.id = charity_payments.offer_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members insert their own charity_payments"
  on public.charity_payments
  with check (
    exists (
      select 1 from charity_offers
      where charity_offers.id = charity_payments.offer_id
        and charity_offers.member_id = (select auth.uid())
    )
    and coalesce((
      select (profiles.module_access ->> 'charity')::boolean
      from profiles
      where profiles.id = (select auth.uid())
    ), false)
  );

alter policy "Members view their own charity_payments"
  on public.charity_payments
  using (exists (
    select 1 from charity_offers
    where charity_offers.id = charity_payments.offer_id
      and charity_offers.member_id = (select auth.uid())
  ));

-- ---------- RLS: daily_trackers ----------
alter policy "Admins manage their assigned members' daily_trackers"
  on public.daily_trackers
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = daily_trackers.member_id
      and admin_members.admin_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = daily_trackers.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members manage their own daily_trackers"
  on public.daily_trackers
  using (member_id = (select auth.uid()))
  with check (member_id = (select auth.uid()));

-- ---------- RLS: prayer_entries ----------
alter policy "Admins manage their assigned members' prayer_entries"
  on public.prayer_entries
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = prayer_entries.member_id
      and admin_members.admin_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = prayer_entries.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members manage their own prayer_entries"
  on public.prayer_entries
  using (member_id = (select auth.uid()))
  with check (member_id = (select auth.uid()));

-- ---------- RLS: profiles ----------
alter policy "Admins can approve profiles that requested them"
  on public.profiles
  using (requested_admin_id = (select auth.uid()))
  with check (requested_admin_id = (select auth.uid()));

alter policy "Admins can view assigned members' profiles"
  on public.profiles
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = profiles.id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Admins can view profiles that requested them"
  on public.profiles
  using (requested_admin_id = (select auth.uid()));

alter policy "Members can update their own profile"
  on public.profiles
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

alter policy "Members can view and update their own profile"
  on public.profiles
  using (id = (select auth.uid()));

-- ---------- RLS: qala_balance_adjustments ----------
alter policy "Admins insert assigned members' qala_balance_adjustments"
  on public.qala_balance_adjustments
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = qala_balance_adjustments.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Admins view assigned members' qala_balance_adjustments"
  on public.qala_balance_adjustments
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = qala_balance_adjustments.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members view their own qala_balance_adjustments"
  on public.qala_balance_adjustments
  using (member_id = (select auth.uid()));

-- ---------- RLS: qala_balances ----------
alter policy "Admins manage assigned members' qala_balances"
  on public.qala_balances
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = qala_balances.member_id
      and admin_members.admin_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = qala_balances.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members view their own qala_balances"
  on public.qala_balances
  using (member_id = (select auth.uid()));

-- ---------- RLS: qala_transactions ----------
alter policy "Admins insert assigned members' qala_transactions"
  on public.qala_transactions
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = qala_transactions.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Admins view assigned members' qala_transactions"
  on public.qala_transactions
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = qala_transactions.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members insert their own qala_transactions"
  on public.qala_transactions
  with check (
    member_id = (select auth.uid())
    and coalesce((
      select (profiles.module_access ->> 'qala')::boolean
      from profiles
      where profiles.id = (select auth.uid())
    ), false)
  );

alter policy "Members log and view their own qala_transactions"
  on public.qala_transactions
  using (member_id = (select auth.uid()));

-- ---------- RLS: sponsorship_transactions ----------
alter policy "Admins insert assigned members' sponsorship_transactions"
  on public.sponsorship_transactions
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = sponsorship_transactions.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Admins view assigned members' sponsorship_transactions"
  on public.sponsorship_transactions
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = sponsorship_transactions.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members insert their own sponsorship_transactions"
  on public.sponsorship_transactions
  with check (
    member_id = (select auth.uid())
    and coalesce((
      select (profiles.module_access ->> 'sponsorship')::boolean
      from profiles
      where profiles.id = (select auth.uid())
    ), false)
  );

alter policy "Members log and view their own sponsorship_transactions"
  on public.sponsorship_transactions
  using (member_id = (select auth.uid()));

-- ---------- RLS: sponsorships ----------
alter policy "Admins manage assigned members' sponsorships"
  on public.sponsorships
  using (exists (
    select 1 from admin_members
    where admin_members.member_id = sponsorships.member_id
      and admin_members.admin_id = (select auth.uid())
  ))
  with check (exists (
    select 1 from admin_members
    where admin_members.member_id = sponsorships.member_id
      and admin_members.admin_id = (select auth.uid())
  ));

alter policy "Members view their own sponsorships"
  on public.sponsorships
  using (member_id = (select auth.uid()));
