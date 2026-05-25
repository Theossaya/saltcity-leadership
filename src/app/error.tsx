"use client";

import { useEffect } from "react";

import { Button } from "@/components/v2/primitives/button";

type AppErrorProps = {
  error: Error & { digest?: string };
  unstable_retry: () => void;
};

export default function AppError({ error, unstable_retry }: AppErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-bg px-4 py-8 text-ink">
      <section className="mx-auto mt-16 max-w-sm rounded-card bg-surface p-[18px] text-center shadow-lift">
        <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.16em] text-ink-3">
          Something went wrong
        </p>
        <h1 className="mt-3 font-serif text-[24px] font-medium leading-[1.12] tracking-[-0.012em] text-ink text-pretty">
          We could not load this view.
        </h1>
        <p className="mt-2 font-sans text-sm leading-6 text-ink-2">
          Please try again. If it keeps happening, ask an admin to check your
          access.
        </p>
        <Button type="button" variant="ink" className="mt-5 w-full" onClick={unstable_retry}>
          Try again
        </Button>
      </section>
    </main>
  );
}
