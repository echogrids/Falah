import Link from "next/link";
import { ChevronLeft, Landmark, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { InstitutionListCard } from "@/components/charity/institution-list-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import { getInstitutionRows } from "@/lib/charity-institutions";
import type { ModuleAccess } from "@/lib/module-access";

export default async function InstitutionsPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const { student } = await searchParams;
  const supabase = await createClient();
  // Middleware already validated this request's JWT against Supabase's
  // Auth server; read the session locally instead of re-validating.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, module_access")
    .eq("id", user?.id)
    .single();

  if (!(profile?.module_access as ModuleAccess | undefined)?.charity) {
    return <ModuleDisabledNotice title="Sadaqah" />;
  }

  const role = profile?.role ?? "member";
  const canEditInstitution = role === "admin" || role === "master_admin";

  const students = await getManageableStudents(supabase, user!.id, role);
  const memberId = resolveTargetMemberId(student, user!.id, students);
  const rows = await getInstitutionRows(supabase, memberId);

  const homeHref = `/charity${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Sadaqah
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Institutions</h1>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      {rows.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((institution) => (
            <InstitutionListCard key={institution.id} institution={institution} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Landmark}
          title="No institutions yet"
          description="Add an institution to start sponsoring it."
          action={canEditInstitution ? { label: "Add Institution", href: "/charity/institutions/new" } : undefined}
        />
      )}

      {canEditInstitution ? (
        <Link
          href="/charity/institutions/new"
          aria-label="Add Institution"
          className="fixed right-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform duration-150 active:scale-95 md:right-8 md:bottom-8"
        >
          <Plus className="size-6" strokeWidth={2.25} />
        </Link>
      ) : null}
    </div>
  );
}
