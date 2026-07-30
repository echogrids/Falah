import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Placeholder content — not wired to any rotating verse/hadith source yet.
const REMINDER = {
  arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا",
  translation: "Indeed, with hardship comes ease.",
  reference: "Qur'an 94:6",
};

export function TodaysReminder() {
  return (
    <Card className="bg-gold/8">
      <CardContent className="flex flex-col items-center gap-3 pt-1 pb-6 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-gold/20 text-gold-foreground">
          <BookOpen className="size-5" />
        </span>
        <p className="font-arabic text-xl leading-relaxed text-foreground">
          {REMINDER.arabic}
        </p>
        <p className="max-w-sm text-sm text-foreground">&ldquo;{REMINDER.translation}&rdquo;</p>
        <p className="text-xs font-medium text-gold-foreground">{REMINDER.reference}</p>
      </CardContent>
    </Card>
  );
}
