"use client";

import Image from "next/image";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-12 w-full items-center justify-center rounded-pill bg-primary px-5 py-3 font-sans text-[13.5px] font-semibold leading-none text-primary-ink transition-colors hover:bg-primary/95 disabled:pointer-events-none disabled:opacity-60"
      disabled={pending}
      type="submit"
    >
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

export function LoginForm() {
  const [state, formAction] = useActionState(login, {});

  return (
    <section className="w-full max-w-[420px]">
      <div className="mb-5 flex justify-center">
        <div className="flex size-16 items-center justify-center rounded-card bg-primary shadow-lift">
          <Image
            src="/brand/logo-white.svg"
            alt="SaltCity"
            width={42}
            height={42}
            priority
          />
        </div>
      </div>

      <div className="rounded-card bg-surface p-5 shadow-lift sm:p-6">
        <div className="mb-5 text-center">
          <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-primary">
            SaltCity Leadership
          </p>
          <h1 className="mt-2 font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.008em] text-ink">
            Leadership briefing
          </h1>
          <p className="mx-auto mt-2 max-w-[18rem] font-sans text-[13px] leading-5 text-ink-2">
            Sign in to review company reports, follow-up care, tasks, notices,
            and events.
          </p>
        </div>

        <form action={formAction} className="grid gap-4">
          {state.error ? (
            <div
              className="rounded-input bg-urgent-bg px-3.5 py-3 font-sans text-[13px] leading-5 text-urgent"
              role="alert"
              aria-live="polite"
            >
              {state.error}
            </div>
          ) : null}

          <div className="grid gap-2">
            <Label
              className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3"
              htmlFor="email"
            >
              Email
            </Label>
            <Input
              autoComplete="email"
              className="h-12 rounded-input border-[var(--rule-strong)] bg-bg/50 px-3.5 font-sans text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-primary focus-visible:ring-primary/15"
              id="email"
              name="email"
              placeholder="leader@example.com"
              required
              type="email"
            />
          </div>

          <div className="grid gap-2">
            <Label
              className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-ink-3"
              htmlFor="password"
            >
              Password
            </Label>
            <Input
              autoComplete="current-password"
              className="h-12 rounded-input border-[var(--rule-strong)] bg-bg/50 px-3.5 font-sans text-[15px] text-ink placeholder:text-ink-4 focus-visible:border-primary focus-visible:ring-primary/15"
              id="password"
              name="password"
              required
              type="password"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </section>
  );
}
