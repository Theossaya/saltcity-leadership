import { MetricCard } from "@/components/ui/metric-card";

type FollowUpSummaryCardProps = {
  label: string;
  value: number;
};

export function FollowUpSummaryCard({
  label,
  value,
}: FollowUpSummaryCardProps) {
  return <MetricCard label={label} value={value} />;
}
