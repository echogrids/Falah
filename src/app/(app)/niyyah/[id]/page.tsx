import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Pencil, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ModuleDisabledNotice } from "@/components/layout/module-disabled-notice";
import { NiyyahProgress } from "@/components/niyyah/niyyah-progress";
import { AddCountForm } from "@/components/niyyah/add-count-form";
import { NiyyahLogList } from "@/components/niyyah/niyyah-log-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/format-date";
import type { ModuleAccess } from "@/lib/module-access";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function NiyyahDetailPage({
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

  const [{ data: niyyah }, { data: logs }] = await Promise.all([
    supabase
      .from("niyyahs")
      .select("id, title, intention, target_count, current_count, deadline, status")
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("niyyah_logs")
      .select("id, count, logged_at")
      .eq("niyyah_id", id)
      .order("logged_at", { ascending: false })
      .limit(100),
  ]);

  if (!niyyah) notFound();

  const remaining = Math.max(0, niyyah.target_count - niyyah.current_count);
  const isCompleted = niyyah.status === "completed";
  const deadlinePassed =
    !isCompleted && niyyah.deadline !== null && niyyah.deadline < todayIso();

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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-heading text-2xl font-semibold break-words text-foreground">
              {niyyah.title}
            </h1>
            {niyyah.intention ? (
              <p className="mt-1 text-muted-foreground">{niyyah.intention}</p>
            ) : null}
          </div>
          <Button variant="outline" size="icon-sm" asChild className="shrink-0">
            <Link href={`/niyyah/${niyyah.id}/edit`} aria-label="Edit Niyyah">
              <Pencil className="size-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-4 pt-1">
          <NiyyahProgress current={niyyah.current_count} target={niyyah.target_count} />

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {!isCompleted ? (
              <span className="text-muted-foreground">
                <span className="font-medium tabular-nums text-foreground">
                  {remaining.toLocaleString()}
                </span>{" "}
                remaining
              </span>
            ) : null}
            {niyyah.deadline ? (
              <span
                className={
                  deadlinePassed
                    ? "rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    : "text-xs text-muted-foreground"
                }
              >
                {deadlinePassed ? "Past deadline · " : "By "}
                {formatDate(niyyah.deadline)}
              </span>
            ) : null}
          </div>

          {isCompleted ? (
            <div className="flex items-center gap-2 rounded-xl bg-primary/8 px-4 py-3 text-sm text-primary">
              <Check className="size-4 shrink-0" />
              Completed, alhamdulillah.
            </div>
          ) : null}
        </CardContent>
      </Card>

      {!isCompleted ? (
        <Card>
          <CardHeader>
            <CardTitle>Add count</CardTitle>
          </CardHeader>
          <CardContent>
            <AddCountForm niyyahId={niyyah.id} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
        </CardHeader>
        <CardContent>
          <NiyyahLogList rows={logs ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
