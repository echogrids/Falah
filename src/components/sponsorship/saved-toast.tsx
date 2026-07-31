"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SuccessToast } from "@/components/sponsorship/success-toast";

export function SavedToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Captured once at mount so the toast keeps showing even after the effect
  // below strips "saved" from the URL (which would otherwise blank the
  // message the instant the URL updates).
  const [initialSaved] = useState(() => searchParams.get("saved"));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!initialSaved) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("saved");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Runs once on mount to strip the flash param from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const message =
    !dismissed && initialSaved
      ? initialSaved === "donated"
        ? "Donation recorded"
        : "Intention added"
      : null;

  return <SuccessToast message={message} onDismiss={() => setDismissed(true)} />;
}
