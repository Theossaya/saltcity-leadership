import { cn } from "@/lib/utils";

type MemberChipProps = {
  name: string;
  state?: "present" | "absent";
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const value = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);

  return value?.toUpperCase() || "SC";
}

export function MemberChip({ name, state = "present" }: MemberChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-pill py-2 pr-3 pl-2 font-sans text-[13px] font-medium text-ink shadow-[inset_0_0_0_1px_var(--rule)]",
        state === "present" && "bg-surface",
        state === "absent" &&
          "bg-urgent-bg text-urgent shadow-[inset_0_0_0_1px_var(--status-urgent-bg)]",
      )}
      title={name}
    >
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-pill bg-bg-deep text-[10px] font-semibold text-ink-2",
          state === "absent" && "bg-urgent text-bg",
        )}
        aria-hidden="true"
      >
        {initials(name)}
      </span>
      <span className={cn("truncate", state === "absent" && "line-through")}>
        {name}
      </span>
    </span>
  );
}
