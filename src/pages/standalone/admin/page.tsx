import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useAdminSession } from "@/features/main/hooks/useAdminSession";
import {
  adminUserId,
  isSupabaseConfigured,
  supabase,
} from "@/lib/supabase";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useAdminSession();
  const [error, setError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      return;
    }

    setError("");
    setIsSigningIn(true);

    const formData = new FormData(event.currentTarget);
    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: String(formData.get("email")).trim(),
        password: String(formData.get("password")),
      });

    if (signInError) {
      setError(signInError.message);
      setIsSigningIn(false);
      return;
    }

    if (data.user.id !== adminUserId) {
      await supabase.auth.signOut({ scope: "local" });
      setError("This account is not allowed to manage projects.");
      setIsSigningIn(false);
      return;
    }

    navigate("/");
  }

  async function handleSignOut() {
    await supabase?.auth.signOut({ scope: "local" });
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-4">
      <section className="flex w-full max-w-sm flex-col gap-5 rounded-xl bg-popover p-5 ring-1 ring-foreground/10">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium">Portfolio admin</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to publish projects.
          </p>
        </div>

        {!isSupabaseConfigured ? (
          <p className="text-sm text-muted-foreground">
            Add the Supabase values from <code>.env.example</code> to a
            local <code>.env</code> file first.
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">
            Checking your session…
          </p>
        ) : isAdmin ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm">You are signed in.</p>
            <div className="flex gap-2">
              <Button render={<Link to="/" />}>View portfolio</Button>
              <Button variant="outline" onClick={handleSignOut}>
                Sign out
              </Button>
            </div>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSignIn}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="admin-email">Email</FieldLabel>
                <Input
                  id="admin-email"
                  name="email"
                  className="text-base md:text-xs"
                  type="email"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="admin-password">Password</FieldLabel>
                <Input
                  id="admin-password"
                  name="password"
                  className="text-base md:text-xs"
                  type="password"
                  autoComplete="current-password"
                  required
                />
              </Field>
              {error && (
                <Field data-invalid>
                  <FieldError>{error}</FieldError>
                </Field>
              )}
            </FieldGroup>
            <Button type="submit" disabled={isSigningIn}>
              {isSigningIn ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
