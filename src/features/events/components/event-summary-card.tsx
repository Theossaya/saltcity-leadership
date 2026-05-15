import { MetricCard } from "@/components/ui/metric-card";

type EventSummaryCardProps = {
  label: string;
  value: number | string;
};

export function EventSummaryCard({ label, value }: EventSummaryCardProps) {
  return <MetricCard label={label} value={value} />;
}
