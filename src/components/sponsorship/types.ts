import { Clock, HandCoins } from "lucide-react";

export type SponsorshipTransaction = {
  id: string;
  type: "intended" | "donated" | "pending";
  amount: number;
  meals: number | null;
  unit_price: number | null;
  note: string | null;
  created_at: string;
};

export const TRANSACTION_TYPE_META = {
  intended: { label: "Intended", icon: Clock },
  donated: { label: "Donated", icon: HandCoins },
} as const;
