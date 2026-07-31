import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { NiyyahCard, type NiyyahListRow } from "@/components/niyyah/niyyah-card";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function NiyyahHistoryPage({
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
    .eq("status", "completed")
    .order("created_at", { ascending: false });

  const rows = (niyyahs ?? []) as NiyyahListRow[];
  const homeHref = `/niyyah${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Niyyah
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">History</h1>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No completed Niyyah yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((niyyah) => (
            <NiyyahCard key={niyyah.id} niyyah={niyyah} />
          ))}
        </div>
      )}
    </div>
  );
}
