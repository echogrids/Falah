-- One-time data reset: zero out Zad (sponsorship) and Qala tracking data
-- for every member. Wipes the append-only logs entirely and resets the
-- running totals/balances to 0, rather than deleting the per-member rows,
-- so existing settings (set_by, member_id) stay intact.

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

truncate table public.qala_transactions;
truncate table public.qala_balance_adjustments;

update public.qala_balances
set
  initial_balance = 0,
  current_balance = 0,
  updated_at = now();
