type TaskEmptyStateProps = {
  title?: string;
  message?: string;
};

export function TaskEmptyState({
  title = "Nothing pressing.",
  message = "Rest is part of the work.",
}: TaskEmptyStateProps) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <h2 className="font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
        {title}
      </h2>
      <p className="mt-2 font-serif text-[13.5px] italic leading-[1.45] text-ink-2 text-pretty">
        {message}
      </p>
    </section>
  );
}
