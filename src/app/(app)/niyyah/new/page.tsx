import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { NiyyahForm } from "@/components/niyyah/niyyah-form";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function NewNiyyahPage({
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/niyyah"
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Niyyah
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">New Niyyah</h1>
        <p className="text-muted-foreground">
          Commit to a count. You can log recitations against it any time.
        </p>
      </div>

      <NiyyahForm mode="create" memberId={memberId} cancelHref="/niyyah" />
    </div>
  );
}
