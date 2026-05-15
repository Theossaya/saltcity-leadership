import { CalendarDays } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ServiceScheduleCardProps = {
  day: string;
  time: string;
  note?: string;
};

export function ServiceScheduleCard({
  day,
  time,
  note = "Regular service",
}: ServiceScheduleCardProps) {
  return (
    <Card
      className="rounded-lg border-border/80 bg-[#FBFAF8] shadow-[0_8px_22px_rgba(21,18,23,0.04)]"
      size="sm"
    >
      <CardContent className="flex min-h-24 items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-white text-primary">
          <CalendarDays className="size-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-foreground">
            {day}
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {time}
          </span>
          <span className="mt-2 block text-xs font-medium uppercase text-primary/70">
            {note}
          </span>
        </span>
      </CardContent>
    </Card>
  );
}
