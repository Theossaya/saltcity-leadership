import { Avatar } from "@/components/v2/primitives/avatar";
import { Pill } from "@/components/v2/primitives/pill";

type PersonRowProps = {
  name: string;
  sub: string;
  note?: string;
  pill?: string;
  tone?: "urgent" | "care" | "ok" | "quiet";
};

export function PersonRow({
  name,
  sub,
  note,
  pill,
  tone = "care",
}: PersonRowProps) {
  return (
    <div className="flex gap-3.5 py-3.5 first:pt-0 last:pb-0 [&+&]:shadow-[inset_0_1px_0_var(--rule)]">
      <Avatar name={name} ring={tone === "quiet" ? undefined : tone} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="min-w-0 flex-1 basis-40 truncate font-sans text-[14.5px] font-semibold leading-tight tracking-[-0.005em] text-ink">
            {name}
          </p>
          {pill ? (
            <Pill tone={tone} className="shrink-0">
              {pill}
            </Pill>
          ) : null}
        </div>
        <p className="mt-0.5 break-words font-sans text-xs leading-[1.4] text-ink-3">
          {sub}
        </p>
        {note ? (
          <p className="mt-1.5 font-serif text-[13.5px] italic leading-[1.45] text-ink-2 text-pretty">
            {note}
          </p>
        ) : null}
      </div>
    </div>
  );
}
