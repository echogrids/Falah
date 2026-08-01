import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
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
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            Back to Login
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Home className="size-4" />
            Home
          </Link>
        </div>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create your Falah account</CardTitle>
            <CardDescription>
              Enter an email and password to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <SignupForm admins={admins ?? []} />
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Log in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
