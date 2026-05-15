import { Card, CardContent } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: number | string;
};

export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <Card
      className="rounded-lg border-border/80 bg-[#FBFAF8] shadow-[0_8px_22px_rgba(21,18,23,0.04)]"
      size="sm"
    >
      <CardContent className="relative py-1">
        <div className="absolute top-0 left-3 h-0.5 w-8 rounded-full bg-primary/35" />
        <p className="pt-2 text-[0.66rem] font-semibold uppercase text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold leading-none text-foreground">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
