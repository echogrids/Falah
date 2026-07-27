import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-16">
      <p className="text-lg">Signed in as {user?.email}</p>
      <LogoutButton />
    </div>
  );
}
