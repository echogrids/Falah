-- Change the bootstrap master_admin email from fahadbinrahmah@gmail.com to echogrids@gmail.com.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when new.email = 'echogrids@gmail.com' then 'master_admin'
      else 'member'
    end
  );
  return new;
end;
$$;
