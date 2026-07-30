"use client";

import { memo } from "react";
import { ChevronDown, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusChip } from "@/components/ibadah/status-chip";
import { SelectionChip } from "@/components/ibadah/selection-chip";
import {
  STATUS_VISUALS,
  PENDING_BADGE_CLASSNAME,
  CONGREGATION_ICONS,
  LOCATION_ICONS,
} from "@/lib/ibadah/chip-visuals";
import { PRAYER_STATUSES, CONGREGATION_OPTIONS, LOCATION_OPTIONS } from "@/lib/ibadah/constants";

function PrayerCardImpl({
  label,
  arabic,
  icon: Icon,
  iconClassName,
  status,
  congregation,
  location,
  expanded,
  justCompleted,
  onToggleExpand,
  onStatusChange,
  onCongregationChange,
  onLocationChange,
}: {
  label: string;
  arabic: string;
  icon: LucideIcon;
  iconClassName: string;
  status: string | null;
  congregation: string | null;
  location: string | null;
  expanded: boolean;
  justCompleted: boolean;
  onToggleExpand: () => void;
  onStatusChange: (value: string) => void;
  onCongregationChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}) {
  const statusVisual = status ? STATUS_VISUALS[status] : null;
  const StatusIcon = statusVisual?.icon;
  const statusLabel = status
    ? (PRAYER_STATUSES.find((option) => option.value === status)?.label ?? status)
    : "Pending";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-card ring-1 ring-foreground/8 shadow-[var(--shadow-soft)] transition-shadow duration-300",
        expanded && "shadow-[var(--shadow-lift)]",
      )}
    >
      <button
        type="button"
        onClick={onToggleExpand}
        aria-expanded={expanded}
        className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-muted/60"
      >
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-full",
            iconClassName,
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="flex items-baseline gap-2">
            <span className="font-heading text-base font-semibold text-foreground">
              {label}
            </span>
            <span className="font-arabic text-sm text-muted-foreground">{arabic}</span>
          </span>
        </span>
        <span
          className={cn(
            "flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
            statusVisual ? statusVisual.badgeClassName : PENDING_BADGE_CLASSNAME,
          )}
        >
          {StatusIcon ? <StatusIcon className="size-3.5" /> : null}
          {statusLabel}
        </span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-muted-foreground transition-transform duration-300",
            expanded && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <div className="flex flex-col gap-5 px-4 pt-1 pb-5">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Status
              </span>
              <div
                role="radiogroup"
                aria-label={`${label} status`}
                className="grid grid-cols-4 gap-2"
              >
                {PRAYER_STATUSES.map((option) => (
                  <StatusChip
                    key={option.value}
                    status={option.value}
                    label={option.label}
                    selected={status === option.value}
                    onSelect={() => onStatusChange(option.value)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Congregation
              </span>
              <div
                role="radiogroup"
                aria-label={`${label} congregation`}
                className="grid grid-cols-2 gap-2"
              >
                {CONGREGATION_OPTIONS.map((option) => (
                  <SelectionChip
                    key={option.value}
                    icon={CONGREGATION_ICONS[option.value]}
                    label={option.label}
                    selected={congregation === option.value}
                    onSelect={() => onCongregationChange(option.value)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Location
              </span>
              <div
                role="radiogroup"
                aria-label={`${label} location`}
                className="grid grid-cols-3 gap-2 sm:grid-cols-6"
              >
                {LOCATION_OPTIONS.map((option) => (
                  <SelectionChip
                    key={option.value}
                    icon={LOCATION_ICONS[option.value]}
                    label={option.label}
                    selected={location === option.value}
                    onSelect={() => onLocationChange(option.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {justCompleted ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-card/95 backdrop-blur-[2px]">
          <span className="flex animate-in zoom-in-50 fade-in-0 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md duration-300">
            <Check className="size-4" />
            Completed
          </span>
        </div>
      ) : null}
    </div>
  );
}

export const PrayerCard = memo(PrayerCardImpl);
