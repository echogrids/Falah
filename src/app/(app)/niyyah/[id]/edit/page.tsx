import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { NiyyahForm } from "@/components/niyyah/niyyah-form";
import type { ModuleAccess } from "@/lib/module-access";

export default async function EditNiyyahPage({
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
    .select("module_access")
    .eq("id", user?.id)
    .single();

  if (!(profile?.module_access as ModuleAccess | undefined)?.niyyah) {
    return <ModuleDisabledNotice title="Niyyah" />;
  }

  const { data: niyyah } = await supabase
    .from("niyyahs")
    .select("id, member_id, title, intention, target_count, deadline")
    .eq("id", id)
    .maybeSingle();

  if (!niyyah) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/niyyah/${niyyah.id}`}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {niyyah.title}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Niyyah</h1>
      </div>

      <NiyyahForm
        mode="edit"
        memberId={niyyah.member_id}
        niyyahId={niyyah.id}
        defaultValues={{
          title: niyyah.title,
          intention: niyyah.intention,
          target_count: niyyah.target_count,
          deadline: niyyah.deadline,
        }}
        cancelHref={`/niyyah/${niyyah.id}`}
      />
    </div>
  );
}
