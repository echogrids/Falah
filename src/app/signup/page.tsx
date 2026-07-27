import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SignupForm } from "@/components/auth/signup-form";
import { createClient } from "@/lib/supabase/server";

export default async function SignupPage() {
  const supabase = await createClient();
  const { data: admins } = await supabase.rpc("list_admins_for_signup");

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Create your Falah account</CardTitle>
          <CardDescription>
            Enter an email and password to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignupForm admins={admins ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
