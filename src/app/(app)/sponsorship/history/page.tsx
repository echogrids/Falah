import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { StudentSelector } from "@/components/layout/student-selector";
import { HistoryList } from "@/components/sponsorship/history-list";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";
import type { SponsorshipTransaction } from "@/components/sponsorship/types";

export default async function SponsorshipHistoryPage({
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

  if (!(profile?.module_access as ModuleAccess | undefined)?.sponsorship) {
    return <ModuleDisabledNotice title="Zād" />;
  }

  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const { data: transactions } = await supabase
    .from("sponsorship_transactions")
    .select("id, type, amount, meals, unit_price, note, created_at")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(100);

  const homeHref = `/sponsorship${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Zād
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">History</h1>
      </div>

      <StudentSelector
        students={students}
        selectedId={memberId === user!.id ? "self" : memberId}
        selfLabel="Myself"
      />

      <HistoryList
        transactions={(transactions ?? []) as SponsorshipTransaction[]}
        homeHref={homeHref}
      />
    </div>
  );
}
