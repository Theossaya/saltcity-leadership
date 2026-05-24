type CounterProps = {
  value: string | number;
  label: string;
};

export function Counter({ value, label }: CounterProps) {
  return (
    <div className="min-w-0">
      <div className="font-serif text-[28px] font-medium leading-none tracking-[-0.015em] text-ink">
        {value}
      </div>
      <div className="mt-1 font-sans text-[11.5px] font-medium leading-snug text-ink-3">
        {label}
      </div>
    </div>
  );
}
