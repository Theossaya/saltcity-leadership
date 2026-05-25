import { Counter } from "@/components/v2/primitives/counter";

type TaskSummaryCardProps = {
  label: string;
  value: number;
};

export function TaskSummaryCard({ label, value }: TaskSummaryCardProps) {
  return <Counter label={label} value={value} />;
}
