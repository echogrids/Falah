"use client";

import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function SuccessToast({
  message,
  onDismiss,
}: {
  message: string | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 transition-all duration-300 md:bottom-8",
        message ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
    >
      {message ? (
        <div className="pointer-events-auto flex max-w-sm items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)]">
          <CheckCircle2 className="size-4 shrink-0" />
          {message}
        </div>
      ) : null}
    </div>
  );
}
