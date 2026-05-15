import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  EventListItem,
  EventStatus,
} from "@/features/events/queries";
import { cn } from "@/lib/utils";

type EventCardProps = {
  event: EventListItem;
};

const statusLabels: Record<EventStatus, string> = {
  planning: "Planning",
  ready: "Ready",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function formatRange(event: EventListItem) {
  if (!event.endsAt) {
    return formatDateTime(event.startsAt);
  }

  return `${formatDateTime(event.startsAt)} - ${formatDateTime(event.endsAt)}`;
}

export function EventCard({ event }: EventCardProps) {
  const isCancelled = event.status === "cancelled";
  const isCompleted = event.status === "completed";

  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-[0_10px_28px_rgba(21,18,23,0.045)]">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              {event.audienceLabel ?? "Leadership"}
            </p>
            <CardTitle className="mt-1 text-lg font-semibold">
              {event.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-6 rounded-4xl px-2.5 text-[0.7rem] font-semibold uppercase",
              isCancelled
                ? "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]"
                : isCompleted
                  ? "border-border bg-white text-muted-foreground"
                  : "border-[#CFC4D4] bg-[#F5F0F7] text-[#241126]",
            )}
          >
            {statusLabels[event.status]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        {event.description ? (
          <p className="rounded-lg border border-border/80 bg-white px-4 py-3 text-sm leading-6 whitespace-pre-wrap text-muted-foreground break-words shadow-xs">
            {event.description}
          </p>
        ) : null}

        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 sm:grid-cols-3 sm:p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Time
            </p>
            <p className="mt-1 font-medium text-foreground">
              {formatRange(event)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Location
            </p>
            <p className="mt-1 font-medium text-foreground">
              {event.location ?? "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              From
            </p>
            <p className="mt-1 font-medium text-foreground">
              {event.createdByName ?? "Leadership admin"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
