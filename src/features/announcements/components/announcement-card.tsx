import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnnouncementListItem } from "@/features/announcements/queries";
import { cn } from "@/lib/utils";

type AnnouncementCardProps = {
  announcement: AnnouncementListItem;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function trimMessage(message: string) {
  if (message.length <= 220) {
    return message;
  }

  return `${message.slice(0, 217).trim()}...`;
}

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {announcement.audienceLabel}
            </p>
            <CardTitle className="mt-1 text-xl font-semibold">
              {announcement.title}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-6 rounded-4xl px-2.5 text-[0.7rem] font-semibold uppercase tracking-normal",
              announcement.isExpired
                ? "border-border bg-white text-muted-foreground"
                : announcement.isUrgent
                  ? "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]"
                  : "border-[#CFC4D4] bg-[#F5F0F7] text-[#241126]",
            )}
          >
            {announcement.isExpired
              ? "Expired"
              : announcement.isUrgent
                ? "Urgent"
                : "Active"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <p className="whitespace-pre-line text-sm leading-6 text-muted-foreground">
          {trimMessage(announcement.message)}
        </p>

        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Published
            </p>
            <p className="mt-1 font-medium text-foreground">
              {formatDateTime(announcement.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              From
            </p>
            <p className="mt-1 font-medium text-foreground">
              {announcement.createdByName ?? "Leadership admin"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Expires
            </p>
            <p className="mt-1 font-medium text-foreground">
              {announcement.expiresAt
                ? formatDateTime(announcement.expiresAt)
                : "No expiry"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
