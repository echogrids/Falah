"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { StudentOption } from "@/lib/proxy-entry";

export function StudentSelector({
  students,
  selectedId,
  selfLabel,
}: {
  students: StudentOption[];
  selectedId: string;
  selfLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (students.length === 0) return null;

  return (
    <Select
      value={selectedId}
      onValueChange={(value) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("student", value);
        router.push(`${pathname}?${params.toString()}`);
      }}
    >
      <SelectTrigger className="w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="self">{selfLabel}</SelectItem>
        {students.map((student) => (
          <SelectItem key={student.id} value={student.id}>
            {student.email}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
