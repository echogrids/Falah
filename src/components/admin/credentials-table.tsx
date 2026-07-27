type Credential = {
  id: string;
  email: string;
  plaintext_password: string;
  created_at: string;
};

export function CredentialsTable({ credentials }: { credentials: Credential[] }) {
  if (credentials.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No accounts created here yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Username</th>
            <th className="py-2 pr-4 font-medium">Password</th>
            <th className="py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {credentials.map((credential) => (
            <tr key={credential.id} className="border-b border-border last:border-0">
              <td className="py-2 pr-4">{credential.email}</td>
              <td className="py-2 pr-4 font-mono">{credential.plaintext_password}</td>
              <td className="py-2 text-muted-foreground">
                {new Date(credential.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
