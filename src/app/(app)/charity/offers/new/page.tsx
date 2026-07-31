import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { OfferForm } from "@/components/charity/offer-form";
import { EmptyState } from "@/components/ui/empty-state";
import { Landmark } from "lucide-react";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function NewCharityOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string; institution?: string }>;
}) {
  const { student, institution } = await searchParams;
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

  const canAddInstitution =
    profile?.role === "admin" || profile?.role === "master_admin";
  const students = await getManageableStudents(supabase, user!.id, profile?.role ?? "member");
  const memberId = resolveTargetMemberId(student, user!.id, students);

  const { data: institutions } = await supabase
    .from("charity_institutions")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  const homeHref = `/charity${memberId !== user!.id ? `?student=${memberId}` : ""}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={homeHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Sadaqah
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">New Niyyah</h1>
      </div>

      {institutions && institutions.length > 0 ? (
        <OfferForm
          mode="create"
          memberId={memberId}
          institutions={institutions}
          defaultInstitutionId={institution}
          cancelHref={homeHref}
        />
      ) : (
        <EmptyState
          icon={Landmark}
          title="No institutions yet"
          description="Add an institution before making an offer."
          action={
            canAddInstitution
              ? { label: "Add Institution", href: "/charity/institutions/new" }
              : undefined
          }
        />
      )}
    </div>
  );
}
