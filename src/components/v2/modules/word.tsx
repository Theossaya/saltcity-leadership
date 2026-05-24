import { Quote } from "lucide-react";

type WordProps = {
  body: string;
  cite: string;
  eyebrow?: string;
};

export function Word({ body, cite, eyebrow = "For the week" }: WordProps) {
  return (
    <section className="relative mt-3.5 overflow-hidden rounded-card bg-primary px-5 py-5 text-primary-ink shadow-lift">
      <div className="pointer-events-none absolute -top-5 -right-1 font-serif text-[120px] italic leading-none text-primary-ink/10">
        &quot;
      </div>
      <p className="flex items-center gap-2 font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.18em] text-primary-soft">
        <Quote className="size-3" aria-hidden="true" />
        {eyebrow}
      </p>
      <p className="mt-2.5 font-serif text-lg italic leading-[1.4] tracking-[-0.005em] text-pretty">
        {body}
      </p>
      <p className="mt-3.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-primary-soft/90">
        {cite}
      </p>
    </section>
  );
}
