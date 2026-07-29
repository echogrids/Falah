-- "Quantity" was always a count of meals; rename for clarity.
alter table public.sponsorship_transactions rename column quantity to meals;
alter table public.sponsorships rename column intended_qty to intended_meals;
alter table public.sponsorships rename column donated_qty to donated_meals;
alter table public.sponsorships rename column pending_qty to pending_meals;

create or replace function public.apply_sponsorship_transaction()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.sponsorships (
    member_id, intended_total, donated_total, pending_total,
    intended_meals, donated_meals, pending_meals
  )
  values (
    new.member_id,
    case when new.type = 'intended' then new.amount else 0 end,
    case when new.type = 'donated' then new.amount else 0 end,
    case when new.type = 'pending' then new.amount else 0 end,
    case when new.type = 'intended' then coalesce(new.meals, 0) else 0 end,
    case when new.type = 'donated' then coalesce(new.meals, 0) else 0 end,
    case when new.type = 'pending' then coalesce(new.meals, 0) else 0 end
  )
  on conflict (member_id) do update set
    intended_total = public.sponsorships.intended_total
      + case when new.type = 'intended' then new.amount else 0 end,
    donated_total = public.sponsorships.donated_total
      + case when new.type = 'donated' then new.amount else 0 end,
    pending_total = public.sponsorships.pending_total
      + case when new.type = 'pending' then new.amount else 0 end,
    intended_meals = public.sponsorships.intended_meals
      + case when new.type = 'intended' then coalesce(new.meals, 0) else 0 end,
    donated_meals = public.sponsorships.donated_meals
      + case when new.type = 'donated' then coalesce(new.meals, 0) else 0 end,
    pending_meals = public.sponsorships.pending_meals
      + case when new.type = 'pending' then coalesce(new.meals, 0) else 0 end,
    updated_at = now();
  return new;
end;
$$;
