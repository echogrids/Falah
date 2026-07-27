-- Food Sponsorship: quantity + price-per-unit, with amount auto-derived
-- (qty * unit_price) so the stored total can never drift from the inputs.
-- Both are optional so a plain lump-sum transaction (no unit tracking)
-- still works with just amount.
alter table public.sponsorship_transactions
  add column quantity numeric,
  add column unit_price numeric;
