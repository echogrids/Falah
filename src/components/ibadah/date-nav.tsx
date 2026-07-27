"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateNav({ date }: { date: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="prayer_day_nav">Date</Label>
      <Input
        id="prayer_day_nav"
        type="date"
        defaultValue={date}
        className="w-fit"
        onChange={(event) => {
          router.push(`/ibadah?date=${event.target.value}`);
        }}
      />
    </div>
  );
}
