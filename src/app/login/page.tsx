import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { IslamicScene } from "@/components/auth/islamic-scene";

export default function LoginPage() {
  return (
    <IslamicScene>
      <Card className="w-full max-w-sm bg-card/95 shadow-[var(--shadow-lift)] backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Sign in to Falah</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </IslamicScene>
  );
}
