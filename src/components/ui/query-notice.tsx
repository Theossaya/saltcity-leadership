type QueryNoticeProps = {
  message: string;
  tone?: "urgent" | "ok" | "quiet";
};

export function QueryNotice({ message, tone = "urgent" }: QueryNoticeProps) {
  const toneClasses =
    tone === "ok"
      ? "bg-ok-bg text-ok"
      : tone === "quiet"
        ? "bg-quiet-bg text-quiet"
        : "bg-urgent-bg text-urgent";

  return (
    <div
      className={`rounded-card px-4 py-3 font-sans text-sm font-semibold leading-6 shadow-lift ${toneClasses}`}
    >
      {message}
    </div>
  );
}
