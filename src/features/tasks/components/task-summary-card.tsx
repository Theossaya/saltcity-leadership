import { MetricCard } from "@/components/ui/metric-card";

type TaskSummaryCardProps = {
  label: string;
  value: number;
};

export function TaskSummaryCard({ label, value }: TaskSummaryCardProps) {
  return <MetricCard label={label} value={value} />;
}
