export const CURRENCY_OPTIONS = ["Rs", "USD", "SAR", "AED", "GBP", "EUR", "PKR", "BDT"] as const;

export function formatMoney(amount: number, currency: string = "Rs"): string {
  return `${currency} ${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export function formatRs(amount: number): string {
  return formatMoney(amount, "Rs");
}
