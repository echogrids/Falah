"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SuccessToast } from "@/components/ui/success-toast";

export function DonationToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [initialSaved] = useState(() => searchParams.get("donated"));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!initialSaved) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("donated");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    // Runs once on mount to strip the flash param from the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const message = !dismissed && initialSaved ? "Donation recorded" : null;

  return <SuccessToast message={message} onDismiss={() => setDismissed(true)} />;
}
