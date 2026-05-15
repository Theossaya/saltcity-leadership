import { MetricCard } from "@/components/ui/metric-card";

type AnnouncementSummaryCardProps = {
  label: string;
  value: number;
};

export function AnnouncementSummaryCard({
  label,
  value,
}: AnnouncementSummaryCardProps) {
  return <MetricCard label={label} value={value} />;
}
