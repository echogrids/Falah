import { FalahMark } from "@/components/layout/falah-mark";
import { DateHeader } from "@/components/dashboard/date-header";

// A short, rotating line of encouragement — deterministic by day of week
// so it feels intentional rather than random on every reload, with no
// backend behind it.
const ENCOURAGEMENTS = [
  "May your week begin with ease and khayr.",
  "Every prayer logged is a step closer to consistency.",
  "Small, steady deeds are loved most.",
  "One prayer at a time — you're doing beautifully.",
  "Consistency is the real victory today.",
  "Let today's worship be light upon your heart.",
  "Finish the week the way you'd like to remember it.",
];

function encouragementForToday(): string {
  return ENCOURAGEMENTS[new Date().getDay()];
}

export function GreetingCard({ firstName }: { firstName?: string }) {
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-primary px-6 py-9 text-primary-foreground shadow-[var(--shadow-lift)] sm:px-8 sm:py-11">
      <div
        aria-hidden="true"
        className="bg-geo-pattern pointer-events-none absolute inset-0 text-primary-foreground opacity-[0.08]"
      />
      <div className="relative flex flex-col gap-4">
        <span className="flex items-center gap-2">
          <FalahMark className="size-3.5 shrink-0 text-primary-foreground/70" />
          <DateHeader />
        </span>
        <div className="flex flex-col gap-1">
          <span className="font-arabic text-2xl leading-tight text-primary-foreground/90">
            السلام عليكم
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Assalamu Alaikum{firstName ? `, ${firstName}` : ""}
          </h1>
        </div>
        <p className="max-w-sm text-primary-foreground/80">{encouragementForToday()}</p>
      </div>
    </div>
  );
}
