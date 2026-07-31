import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { OfferForm } from "@/components/charity/offer-form";
import type { ModuleAccess } from "@/lib/module-access";

export default async function EditOfferPage({
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

  const canManageAny = profile?.role === "admin" || profile?.role === "master_admin";

  const { data: offer } = await supabase
    .from("charity_offers")
    .select("id, member_id, amount, remarks, notes, charity_institutions(name)")
    .eq("id", id)
    .single();

  if (!offer) notFound();
  if (offer.member_id !== user!.id && !canManageAny) notFound();

  const institution = offer.charity_institutions as unknown as
    | { name: string }
    | { name: string }[]
    | null;
  const institutionName = Array.isArray(institution)
    ? (institution[0]?.name ?? "Unknown institution")
    : (institution?.name ?? "Unknown institution");

  const detailHref = `/charity/offers/${id}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Link
          href={detailHref}
          className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          {offer.remarks ?? "Offer"}
        </Link>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Edit Offer</h1>
      </div>

      <OfferForm
        mode="edit"
        memberId={offer.member_id}
        offerId={id}
        institutionName={institutionName}
        defaultValues={{
          purpose: offer.remarks ?? "",
          amount: offer.amount,
          notes: offer.notes,
        }}
        cancelHref={detailHref}
      />
    </div>
  );
}
