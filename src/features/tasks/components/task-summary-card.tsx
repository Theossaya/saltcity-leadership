import { Card, CardContent } from "@/components/ui/card";

type TaskSummaryCardProps = {
  label: string;
  value: number;
};

export function TaskSummaryCard({ label, value }: TaskSummaryCardProps) {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm" size="sm">
      <CardContent>
        <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
          {label}
        </p>
        <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
