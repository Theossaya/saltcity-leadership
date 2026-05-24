type DateTileProps = {
  month: string;
  day: string;
  date: string;
  dark?: boolean;
};

type EventCardProps = {
  month: string;
  day: string;
  date: string;
  title: string;
  eyebrow: string;
  meta: string;
};

export function DateTile({ month, day, date, dark = false }: DateTileProps) {
  return (
    <div
      className={
        dark
          ? "w-[54px] shrink-0 rounded-input bg-primary px-2 py-2.5 text-center text-primary-ink"
          : "w-[54px] shrink-0 rounded-input bg-bg-deep px-2 py-2.5 text-center text-ink"
      }
    >
      <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.16em] opacity-70">
        {month}
      </div>
      <div className="mt-0.5 font-serif text-[28px] font-medium leading-none tracking-[-0.01em]">
        {date}
      </div>
      <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.12em] opacity-60">
        {day}
      </div>
    </div>
  );
}

export function EventCard({
  month,
  day,
  date,
  title,
  eyebrow,
  meta,
}: EventCardProps) {
  return (
    <section className="flex items-center gap-4 rounded-card bg-surface p-[18px] text-ink shadow-lift">
      <DateTile month={month} day={day} date={date} dark />
      <div className="min-w-0">
        <p className="mb-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] text-ink-3">
          {eyebrow}
        </p>
        <h3 className="font-serif text-[17px] font-medium leading-[1.2] tracking-[-0.005em] text-ink">
          {title}
        </h3>
        <p className="mt-1 font-sans text-[12.5px] leading-[1.45] text-ink-3">
          {meta}
        </p>
      </div>
    </section>
  );
}
