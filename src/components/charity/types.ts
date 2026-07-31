import { Landmark, HandCoins, Receipt } from "lucide-react";

export const OFFER_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  partial: { label: "Partially Paid", className: "bg-accent/15 text-accent" },
  fulfilled: { label: "Completed", className: "bg-primary/15 text-primary" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive" },
};

export const ACTIVITY_TYPE_META = {
  institution_created: { label: "Institution Added", icon: Landmark },
  offer_created: { label: "Offer Created", icon: HandCoins },
  donation_recorded: { label: "Donation Recorded", icon: Receipt },
} as const;
