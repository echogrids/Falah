-- Callable, Master-Admin-only resets for each module's counts, so Settings
-- can offer a button instead of requiring a hand-run migration each time
-- (see the one-off 20260730120000_reset_zad_and_qala_data.sql this
-- generalizes). Same wipe-the-log-and-zero-the-totals shape as that
-- migration; charity has no separate totals row (paid_total lives on each
-- offer, and amount can't be zeroed — it has a > 0 check), so its offers
-- are truncated outright instead.
create function public.reset_sponsorship_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'master_admin' then
    raise exception 'Only Master Admin can reset this data.';
  end if;

  truncate table public.sponsorship_transactions;

  update public.sponsorships
  set
    intended_total = 0,
    donated_total = 0,
    pending_total = 0,
    intended_meals = 0,
    donated_meals = 0,
    pending_meals = 0,
    updated_at = now();
end;
$$;

grant execute on function public.reset_sponsorship_data() to authenticated;

create function public.reset_qala_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'master_admin' then
    raise exception 'Only Master Admin can reset this data.';
  end if;

  truncate table public.qala_transactions;
  truncate table public.qala_balance_adjustments;

  update public.qala_balances
  set
    initial_balance = 0,
    current_balance = 0,
    updated_at = now();
end;
$$;

grant execute on function public.reset_qala_data() to authenticated;

create function public.reset_charity_data()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if public.current_user_role() <> 'master_admin' then
    raise exception 'Only Master Admin can reset this data.';
  end if;

  truncate table public.charity_payments, public.charity_offers;
end;
$$;

grant execute on function public.reset_charity_data() to authenticated;
