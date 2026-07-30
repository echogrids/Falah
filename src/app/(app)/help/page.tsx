import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FAQS = [
  {
    question: "How do I log today's prayers?",
    answer:
      "Open Munājāh from the menu, tap a prayer, and choose its status, congregation, and location. It saves automatically as you go.",
  },
  {
    question: "What is Qala?",
    answer:
      "Qala tracks make-up prayers that are still owed. A Parent or Master Admin sets the starting count, and completed ones are logged from the Qala page.",
  },
  {
    question: "What is Niyyah?",
    answer:
      "A Niyyah is a committed vow — reciting a set count of dhikr or swalath over time. Log recitations against it until the target is reached.",
  },
  {
    question: "How do I sponsor a meal or make a Sadaqah offering?",
    answer:
      "Zād tracks meal sponsorships and Sadaqah tracks offerings to charity institutions — both are in the menu, each with its own log.",
  },
  {
    question: "Who can see my family's data?",
    answer:
      "Only the Parent or Master Admin assigned to a Student can view and log on their behalf. Scores are for reporting and motivation only.",
  },
];

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">Help</h1>
        <p className="mt-1 text-muted-foreground">
          Answers to common questions about using Falah.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FAQS.map((faq) => (
          <Card key={faq.question}>
            <CardHeader>
              <CardTitle className="text-base">{faq.question}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {faq.answer}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
