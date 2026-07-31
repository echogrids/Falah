import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { InstitutionForm } from "@/components/charity/institution-form";
import type { ModuleAccess } from "@/lib/module-access";

export default async function EditInstitutionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const canEditInstitution = profile?.role === "admin" || profile?.role === "master_admin";
  if (!canEditInstitution) notFound();

  const { data: institution } = await supabase
    .from("charity_institutions")
    .select("id, name, notes")
    .eq("id", id)
    .single();

  if (!institution) notFound();

  const detailHref = `/charity/institutions/${id}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={detailHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {institution.name}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Institution</h1>
      </div>

      <InstitutionForm
        mode="edit"
        institutionId={id}
        defaultValues={{ name: institution.name, notes: institution.notes }}
        cancelHref={detailHref}
      />
    </div>
  );
}
