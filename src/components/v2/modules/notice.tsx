import { Pill } from "@/components/v2/primitives/pill";

type NoticeProps = {
  title: string;
  body: string;
  date?: string;
  tone?: "accent" | "urgent" | "quiet";
  tag?: string;
};

export function Notice({ title, body, date, tone = "accent", tag }: NoticeProps) {
  return (
    <section
      className={
        tone === "urgent"
          ? "rounded-card bg-urgent-bg p-[18px] text-ink shadow-lift"
          : tone === "quiet"
            ? "rounded-card bg-surface p-[18px] text-ink shadow-lift"
            : "rounded-card bg-calm-soft p-[18px] text-ink"
      }
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] text-calm">
          {tag || "Notice"}
        </p>
        {date ? (
          <p className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-3">
            {date}
          </p>
        ) : null}
      </div>
      <h3 className="font-serif text-[17px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
        {title}
      </h3>
      <p className="mt-1.5 font-sans text-[13px] leading-[1.5] text-ink-2">
        {body}
      </p>
      {tone === "urgent" ? (
        <div className="mt-3">
          <Pill tone="urgent">Urgent</Pill>
        </div>
      ) : null}
    </section>
  );
}
