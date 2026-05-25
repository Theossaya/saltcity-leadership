import { Avatar } from "@/components/v2/primitives/avatar";
import { Pill } from "@/components/v2/primitives/pill";

type MemberRowProps = {
  name: string;
  meta: string;
  detail?: string;
  status?: "active" | "inactive";
};

export function MemberRow({
  name,
  meta,
  detail,
  status = "active",
}: MemberRowProps) {
  return (
    <div className="flex gap-3.5 py-3.5 first:pt-0 last:pb-0 [&+&]:shadow-[inset_0_1px_0_var(--rule)]">
      <Avatar name={name} ring={status === "active" ? "ok" : undefined} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate font-sans text-[14.5px] font-semibold leading-tight tracking-[-0.005em] text-ink">
            {name}
          </p>
          <Pill tone={status === "active" ? "ok" : "quiet"}>{status}</Pill>
        </div>
        <p className="mt-1 break-words font-sans text-xs leading-[1.4] text-ink-3">
          {meta}
        </p>
        {detail ? (
          <p className="mt-1.5 break-words font-serif text-[13.5px] italic leading-[1.45] text-ink-2 text-pretty">
            {detail}
          </p>
        ) : null}
      </div>
    </div>
  );
}
