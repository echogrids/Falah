-- Institution visibility used to be fully open ("Everyone views
-- charity_institutions" using (true)) and any Admin could manage any
-- institution, not just their own. Tighten both to a family-scoped model:
--   - Master Admin: sees and manages every institution (unchanged, via the
--     existing "Master admins manage charity_institutions" policy).
--   - An institution created by Master Admin is global — visible to
--     everyone.
--   - An institution created by an Admin (Parent) is visible only to that
--     Admin and the Students assigned to them (admin_members), and only
--     that Admin (not other Admins) can manage it.
--   - Members with no assigned Admin, or assigned to a different Admin,
--     never see another family's institutions.
drop policy "Admins manage charity_institutions" on public.charity_institutions;
drop policy "Everyone views charity_institutions" on public.charity_institutions;

create policy "Admins manage their own charity_institutions"
  on public.charity_institutions for all
  using (public.current_user_role() = 'admin' and created_by = auth.uid())
  with check (public.current_user_role() = 'admin' and created_by = auth.uid());

create policy "View charity_institutions scoped to family"
  on public.charity_institutions for select
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.profiles creator
      where creator.id = charity_institutions.created_by
        and creator.role = 'master_admin'
    )
    or exists (
      select 1 from public.admin_members
      where admin_members.admin_id = charity_institutions.created_by
        and admin_members.member_id = auth.uid()
    )
  );
