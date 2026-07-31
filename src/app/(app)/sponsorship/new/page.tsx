import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { TransactionForm } from "@/components/sponsorship/transaction-form";
import { Card, CardContent } from "@/components/ui/card";
import { getManageableStudents, resolveTargetMemberId } from "@/lib/proxy-entry";
import type { ModuleAccess } from "@/lib/module-access";

export default async function NewSponsorshipTransactionPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; student?: string }>;
}) {
  const { type: rawType, student } = await searchParams;
  const type = rawType === "donated" ? "donated" : "intended";

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

  const { data: settings } = await supabase
    .from("sponsorship_settings")
    .select("unit_price")
    .single();
  const unitPrice = settings?.unit_price ?? 0;

  const homeHref = `/sponsorship${memberId !== user!.id ? `?student=${memberId}` : ""}`;
  const title = type === "donated" ? "Record Donation" : "Add Intention";

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
        <h1 className="font-heading text-2xl font-semibold text-foreground">{title}</h1>
      </div>

      {unitPrice > 0 ? (
        <TransactionForm memberId={memberId} unitPrice={unitPrice} type={type} homeHref={homeHref} />
      ) : (
        <Card>
          <CardContent className="flex flex-col gap-2 pt-1 text-sm text-muted-foreground">
            <p>Set the price per meal in Settings before logging a transaction.</p>
            <Link href="/sponsorship/settings" className="w-fit text-primary hover:underline">
              Go to Settings
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
