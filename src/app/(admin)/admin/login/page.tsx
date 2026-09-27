"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FieldWrapper, TextInput } from "@/components/ui/form-field";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });
    if (result?.error) return setError("Invalid email or password.");
    router.push("/admin");
  }
  return (
    <main className="grid min-h-screen place-items-center bg-background p-5">
      <form
        className="w-full max-w-sm space-y-6 border border-white/15 bg-surface p-6"
        onSubmit={submit}
      >
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
            NOIR staff
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Admin login</h1>
        </div>
        <FieldWrapper htmlFor="email" label="Email">
          <TextInput id="email" name="email" required type="email" />
        </FieldWrapper>
        <FieldWrapper htmlFor="password" label="Password">
          <TextInput id="password" name="password" required type="password" />
        </FieldWrapper>
        {error ? (
          <p className="text-sm text-accent" role="alert">
            {error}
          </p>
        ) : null}
        <Button className="w-full" type="submit">
          Sign in
        </Button>
      </form>
    </main>
  );
}
