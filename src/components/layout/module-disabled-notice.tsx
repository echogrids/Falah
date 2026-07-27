import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ModuleDisabledNotice({ title }: { title: string }) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-heading text-2xl font-semibold text-foreground">
        {title}
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Not enabled</CardTitle>
          <CardDescription>
            Ask your Parent or Master Admin to enable this for you.
          </CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  );
}
