import type { ReactNode } from "react";

type V2GreetingProps = {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: string;
};

export function V2Greeting({ eyebrow, title, subtitle }: V2GreetingProps) {
  return (
    <section className="pt-4">
      {eyebrow ? (
        <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.18em] text-ink-3">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2.5 font-serif text-[32px] font-medium leading-[1.05] tracking-[-0.02em] text-ink text-pretty [&_em]:font-normal [&_em]:text-ink-2">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 max-w-[34ch] font-serif text-[15px] italic leading-[1.5] text-ink-2 text-pretty">
          {subtitle}
        </p>
      ) : null}
    </section>
  );
}
