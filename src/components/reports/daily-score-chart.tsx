"use client";

import { useState } from "react";
import type { DailyTotal } from "@/lib/reports/daily-totals";

const WEEKDAY_FORMAT = new Intl.DateTimeFormat(undefined, { weekday: "short" });
const FULL_DATE_FORMAT = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

export function DailyScoreChart({ data }: { data: DailyTotal[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((day) => day.score));
  const barWidth = 100 / data.length;
  const gap = Math.min(3, barWidth * 0.15);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-40 w-full">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="h-full w-full overflow-visible"
        >
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1={0}
              x2={100}
              y1={100 - y}
              y2={100 - y}
              className="stroke-border"
              strokeWidth={0.5}
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {data.map((day, index) => {
            const heightPct = (day.score / max) * 100;
            const x = index * barWidth + gap / 2;
            const width = barWidth - gap;
            return (
              <rect
                key={day.date}
                x={x}
                y={100 - heightPct}
                width={width}
                height={heightPct}
                rx={1.5}
                className={
                  hovered === index ? "fill-primary/80" : "fill-primary"
                }
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered((current) => (current === index ? null : current))}
              />
            );
          })}
        </svg>
        {hovered !== null ? (
          <div
            className="pointer-events-none absolute -top-8 rounded-md bg-popover px-2 py-1 text-xs font-medium text-popover-foreground shadow-sm"
            style={{
              left: `${hovered * barWidth + barWidth / 2}%`,
              transform: "translateX(-50%)",
            }}
          >
            {FULL_DATE_FORMAT.format(new Date(data[hovered].date))}:{" "}
            {data[hovered].score}
          </div>
        ) : null}
      </div>
      <div className="flex">
        {data.map((day) => (
          <span
            key={day.date}
            className="flex-1 text-center text-xs text-muted-foreground"
          >
            {WEEKDAY_FORMAT.format(new Date(day.date))}
          </span>
        ))}
      </div>
    </div>
  );
}
