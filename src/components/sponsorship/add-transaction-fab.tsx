"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Clock, HandCoins } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export function AddTransactionFab({
  intendedHref,
  donatedHref,
}: {
  intendedHref: string;
  donatedHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Add transaction"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-20 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-lift)] transition-transform duration-150 active:scale-95 md:right-8 md:bottom-8"
      >
        <Plus className="size-6" strokeWidth={2.25} />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>Add a transaction</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-2 p-4 pt-0">
            <Link
              href={intendedHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4 text-left transition-colors duration-150 active:scale-[0.98] hover:bg-muted"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-foreground">
                  Add Intention
                </span>
                <span className="text-xs text-muted-foreground">Commit to meals to give</span>
              </span>
            </Link>
            <Link
              href={donatedHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4 text-left transition-colors duration-150 active:scale-[0.98] hover:bg-muted"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HandCoins className="size-5" />
              </span>
              <span className="flex flex-col">
                <span className="font-heading text-sm font-semibold text-foreground">
                  Record Donation
                </span>
                <span className="text-xs text-muted-foreground">Log meals you&apos;ve given</span>
              </span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
