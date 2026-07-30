-- Qala logging moves from "one tap = one row, saved instantly" to
-- "tap to build up a count per prayer, then Save the batch at once."
-- A single log entry can now represent several completions, with an
-- optional note for that save.
alter table public.qala_transactions
  add column count int not null default 1 check (count > 0),
  add column remarks text;

-- Clamp to zero defensively (the app also validates before submitting)
-- so a race between two saves can never push a balance negative.
create or replace function public.apply_qala_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.qala_balances
  set current_balance = greatest(0, current_balance - new.count),
      updated_at = now()
  where member_id = new.member_id and prayer = new.prayer;
  return new;
end;
$$;
