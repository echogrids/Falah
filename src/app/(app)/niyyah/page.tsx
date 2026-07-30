import Link from "next/link";
import { Plus, Target } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { NiyyahCard, type NiyyahListRow } from "@/components/niyyah/niyyah-card";
import { Button } from "@/components/ui/button";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function NiyyahPage({
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

  if (!(profile?.module_access as ModuleAccess | undefined)?.niyyah) {
    return <ModuleDisabledNotice title="Niyyah" />;
  }

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const { data: niyyahs } = await supabase
    .from("niyyahs")
    .select("id, title, intention, target_count, current_count, deadline, status")
    .eq("member_id", memberId)
    .order("status", { ascending: true })
    .order("created_at", { ascending: false });

  const rows = (niyyahs ?? []) as NiyyahListRow[];
  const newHref = `/niyyah/new${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Niyyah</h1>
        <p className="mt-1 text-muted-foreground">
          A committed vow, recited a little at a time.
        </p>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="size-5" />
          </span>
          <div className="flex flex-col gap-1">
            <p className="font-heading text-base font-semibold text-foreground">
              No Niyyah yet
            </p>
            <p className="max-w-xs text-sm text-muted-foreground">
              Commit to a count of dhikr or swalath, and log your recitations as you go.
            </p>
          </div>
          <Button asChild className="mt-2">
            <Link href={newHref}>
              <Plus className="size-4" />
              Add Niyyah
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {rows.map((niyyah) => (
              <NiyyahCard key={niyyah.id} niyyah={niyyah} />
            ))}
          </div>

          <Link
            href={newHref}
            aria-label="Add Niyyah"
            className="fixed right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-20 flex items-center gap-2 rounded-full bg-primary py-3 pr-5 pl-4 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)] transition-transform duration-150 active:scale-95 md:right-8 md:bottom-8"
          >
            <Plus className="size-4.5" />
            Add Niyyah
          </Link>
        </>
      )}
    </div>
  );
}
