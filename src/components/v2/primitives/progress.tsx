type ProgressProps = {
  value: number;
  tone?: "primary" | "warm" | "calm";
};

export function Progress({ value, tone = "warm" }: ProgressProps) {
  const clamped = Math.max(0, Math.min(value, 100));

  return (
    <div className="h-1.5 overflow-hidden rounded-pill bg-ink/10">
      <span
        className={
          tone === "primary"
            ? "block h-full rounded-pill bg-primary"
            : tone === "calm"
              ? "block h-full rounded-pill bg-calm"
              : "block h-full rounded-pill bg-warm"
        }
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
