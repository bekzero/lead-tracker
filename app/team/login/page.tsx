import Image from "next/image";
import { redirect } from "next/navigation";
import { isTeamAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isTeamAuthenticated()) redirect("/team");
  const { error } = await searchParams;

  return (
    <main className="login-shell" lang="en">
      <form className="login-card" action="/api/team/login" method="post">
        <Image
          className="login-logo"
          src="/brand/kzero-passwordless-horizontal.png"
          width={3361}
          height={1419}
          alt="KZero Passwordless"
          priority
        />
        <h1>Team access</h1>
        <p>Sign in to view and manage conference leads.</p>
        <label>
          Team password
          <input className="login-input" type="password" name="password" required autoComplete="current-password" autoFocus />
        </label>
        {error && <div className="error-message" role="alert">Incorrect password. Please try again.</div>}
        <button className="primary-button" type="submit">Sign in</button>
      </form>
    </main>
  );
}
