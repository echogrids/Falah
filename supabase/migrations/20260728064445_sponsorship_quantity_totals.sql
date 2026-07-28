-- Track running quantity totals alongside amount totals, so Food
-- Sponsorship can be reported in both qty and Rs, not amount alone.
-- Lump-sum transactions (no quantity given) contribute 0 to the qty total.
alter table public.sponsorships
  add column intended_qty numeric not null default 0,
  add column donated_qty numeric not null default 0,
  add column pending_qty numeric not null default 0;

create or replace function public.apply_sponsorship_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sponsorships (
    member_id, intended_total, donated_total, pending_total,
    intended_qty, donated_qty, pending_qty
  )
  values (
    new.member_id,
    case when new.type = 'intended' then new.amount else 0 end,
    case when new.type = 'donated' then new.amount else 0 end,
    case when new.type = 'pending' then new.amount else 0 end,
    case when new.type = 'intended' then coalesce(new.quantity, 0) else 0 end,
    case when new.type = 'donated' then coalesce(new.quantity, 0) else 0 end,
    case when new.type = 'pending' then coalesce(new.quantity, 0) else 0 end
  )
  on conflict (member_id) do update set
    intended_total = public.sponsorships.intended_total
      + case when new.type = 'intended' then new.amount else 0 end,
    donated_total = public.sponsorships.donated_total
      + case when new.type = 'donated' then new.amount else 0 end,
    pending_total = public.sponsorships.pending_total
      + case when new.type = 'pending' then new.amount else 0 end,
    intended_qty = public.sponsorships.intended_qty
      + case when new.type = 'intended' then coalesce(new.quantity, 0) else 0 end,
    donated_qty = public.sponsorships.donated_qty
      + case when new.type = 'donated' then coalesce(new.quantity, 0) else 0 end,
    pending_qty = public.sponsorships.pending_qty
      + case when new.type = 'pending' then coalesce(new.quantity, 0) else 0 end,
    updated_at = now();
  return new;
end;
$$;
