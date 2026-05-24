import { cn } from "@/lib/utils";

type AvatarProps = {
  name: string;
  ring?: "urgent" | "care" | "ok";
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0]?.slice(0, 2);

  return initials?.toUpperCase() || "SC";
}

export function Avatar({ name, ring }: AvatarProps) {
  return (
    <span
      className={cn(
        "flex size-[42px] shrink-0 items-center justify-center rounded-pill bg-bg-tint font-sans text-[13px] font-semibold text-ink-2",
        ring === "urgent" &&
          "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--status-urgent)]",
        ring === "care" &&
          "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--status-care)]",
        ring === "ok" &&
          "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--status-ok)]",
      )}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
