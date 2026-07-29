"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { StudentOption } from "@/lib/proxy-entry";
import { profileLabel } from "@/lib/profile-label";

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
    <div className="flex w-full flex-col gap-2 sm:w-fit">
      <Label htmlFor="student_selector">Student</Label>
      <Select
        value={selectedId}
        onValueChange={(value) => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("student", value);
          router.push(`${pathname}?${params.toString()}`);
        }}
      >
        <SelectTrigger id="student_selector" className="w-full sm:w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="self">{selfLabel}</SelectItem>
          {students.map((student) => (
            <SelectItem key={student.id} value={student.id}>
              {profileLabel(student)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
