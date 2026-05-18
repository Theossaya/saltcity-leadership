import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createFollowUpCase,
  updateFollowUpCaseProgress,
} from "@/features/follow-up/actions";
import type {
  FollowUpCreateOptions,
  FollowUpQueueItem,
  FollowUpStatus,
} from "@/features/follow-up/queries";
import {
  ABSENCE_REASON_LABELS,
  FOLLOW_UP_STATUSES,
  FOLLOW_UP_STATUS_LABELS,
  REPORT_STATUS_LABELS,
  TASK_PRIORITIES,
  TASK_PRIORITY_LABELS,
} from "@/lib/constants/statuses";
import { cn } from "@/lib/utils";

type FollowUpCardProps = {
  item: FollowUpQueueItem;
  createOptions?: FollowUpCreateOptions;
  canCreateCase?: boolean;
};

const followUpStatusClasses: Record<FollowUpStatus, string> = {
  not_started: "border-border bg-white text-muted-foreground",
  open: "border-[#CFC4D4] bg-[#F5F0F7] text-[#241126]",
  assigned: "border-[#C5D1DE] bg-[#F0F4F8] text-[#102033]",
  contacted: "border-[#C9D8CF] bg-[#F1F7F3] text-[#1D4B31]",
  resolved: "border-[#C9D8CF] bg-[#F1F7F3] text-[#1D4B31]",
  escalated: "border-[#E3C9CE] bg-[#FAF0F2] text-[#7B1E32]",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T00:00:00+01:00`));
}

function getTodayDateInput() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getReportStatusLabel(status: string) {
  return (
    REPORT_STATUS_LABELS[status as keyof typeof REPORT_STATUS_LABELS] ??
    "Unknown"
  );
}

function getFollowUpStatusLabel(status: FollowUpStatus) {
  return status === "not_started"
    ? "Not started"
    : FOLLOW_UP_STATUS_LABELS[
        status as keyof typeof FOLLOW_UP_STATUS_LABELS
      ];
}

function formatRoleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function CreateFollowUpCaseForm({
  absenteeRecordId,
  options,
}: {
  absenteeRecordId: string;
  options: FollowUpCreateOptions;
}) {
  return (
    <form
      action={createFollowUpCase}
      className="grid gap-3 rounded-lg border border-primary/15 bg-[#FBFAF8] p-3 sm:p-4"
    >
      <input type="hidden" name="absenteeRecordId" value={absenteeRecordId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`follow-up-assigned-to-${absenteeRecordId}`}>
            Assigned leader
          </Label>
          <select
            id={`follow-up-assigned-to-${absenteeRecordId}`}
            name="assignedTo"
            defaultValue=""
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            <option value="">Unassigned</option>
            {options.assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name} - {formatRoleLabel(assignee.role)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`follow-up-priority-${absenteeRecordId}`}>
            Priority
          </Label>
          <select
            id={`follow-up-priority-${absenteeRecordId}`}
            name="priority"
            defaultValue="normal"
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`follow-up-next-action-${absenteeRecordId}`}>
          Next action
        </Label>
        <Textarea
          id={`follow-up-next-action-${absenteeRecordId}`}
          name="nextAction"
          maxLength={500}
          className="min-h-20 bg-background"
          placeholder="Optional next step for this case."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`follow-up-notes-${absenteeRecordId}`}>Notes</Label>
        <Textarea
          id={`follow-up-notes-${absenteeRecordId}`}
          name="notes"
          maxLength={2000}
          className="min-h-24 bg-background"
          placeholder="Optional private context for follow-up."
        />
      </div>

      <div className="border-t border-border/80 pt-1">
        <Button
          type="submit"
          className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
        >
          Create follow-up case
        </Button>
      </div>
    </form>
  );
}

function UpdateFollowUpCaseProgressForm({ item }: { item: FollowUpQueueItem }) {
  if (!item.followUpCaseId) {
    return null;
  }

  const statusOptions = item.assignedUserId
    ? FOLLOW_UP_STATUSES
    : FOLLOW_UP_STATUSES.filter((status) => status !== "assigned");

  return (
    <form
      action={updateFollowUpCaseProgress}
      className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 sm:p-4"
    >
      <input type="hidden" name="followUpCaseId" value={item.followUpCaseId} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`follow-up-status-${item.followUpCaseId}`}>
            Status
          </Label>
          <select
            id={`follow-up-status-${item.followUpCaseId}`}
            name="status"
            defaultValue={item.followUpStatus}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {FOLLOW_UP_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`follow-up-date-contacted-${item.followUpCaseId}`}>
            Date contacted
          </Label>
          <input
            id={`follow-up-date-contacted-${item.followUpCaseId}`}
            name="dateContacted"
            type="date"
            defaultValue={item.lastContactDate ?? ""}
            max={getTodayDateInput()}
            className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`follow-up-next-action-update-${item.followUpCaseId}`}>
          Next action
        </Label>
        <Textarea
          id={`follow-up-next-action-update-${item.followUpCaseId}`}
          name="nextAction"
          defaultValue={item.nextAction ?? ""}
          maxLength={500}
          className="min-h-20 bg-background"
          placeholder="Optional next step for this case."
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor={`follow-up-notes-update-${item.followUpCaseId}`}>
          Notes
        </Label>
        <Textarea
          id={`follow-up-notes-update-${item.followUpCaseId}`}
          name="notes"
          defaultValue={item.notes ?? ""}
          maxLength={2000}
          className="min-h-24 bg-background"
          placeholder="Optional private context for follow-up."
        />
      </div>

      <div className="border-t border-border/80 pt-1">
        <Button
          type="submit"
          className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
        >
          Update follow-up
        </Button>
      </div>
    </form>
  );
}

export function FollowUpCard({
  item,
  createOptions,
  canCreateCase = false,
}: FollowUpCardProps) {
  return (
    <Card className="rounded-lg border-primary/15 bg-card shadow-[0_10px_28px_rgba(21,18,23,0.05)]">
      <CardHeader className="gap-3 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
              {item.companyName}
            </p>
            <CardTitle className="mt-1 text-lg font-semibold">
              {item.memberName}
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "h-6 rounded-4xl px-2.5 text-[0.7rem] font-semibold uppercase tracking-normal",
              followUpStatusClasses[item.followUpStatus],
            )}
          >
            {getFollowUpStatusLabel(item.followUpStatus)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <div className="grid gap-3 rounded-lg border border-primary/15 bg-[#F6F1EB] p-3 sm:grid-cols-3 sm:p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              {item.contextDateLabel}
            </p>
            <p className="mt-1 font-medium text-foreground">
              {formatDate(item.absenceDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Reason
            </p>
            <p className="mt-1 font-medium text-foreground">
              {ABSENCE_REASON_LABELS[
                item.reason as keyof typeof ABSENCE_REASON_LABELS
              ] ?? "No reason given"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-muted-foreground">
              Report status
            </p>
            <p className="mt-1 font-medium text-foreground">
              {getReportStatusLabel(item.weeklyReportStatus)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">
            Week {formatDate(item.reportWeekStart)}
          </Badge>
          {item.hasFollowUpCase ? (
            <Badge variant="secondary">Case linked</Badge>
          ) : (
            <Badge variant="outline">No case yet</Badge>
          )}
          {item.assignedUserName ? (
            <Badge variant="outline">{item.assignedUserName}</Badge>
          ) : null}
          {item.lastContactDate ? (
            <Badge variant="outline">
              Last contact {formatDate(item.lastContactDate)}
            </Badge>
          ) : null}
        </div>

        {item.nextAction || item.notes ? (
          <div className="grid gap-3">
            {item.nextAction ? (
              <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
                  Next action
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.nextAction}
                </p>
              </div>
            ) : null}

            {item.notes ? (
              <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
                  Case notes
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.notes}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        {item.reasonNote ? (
          <div className="rounded-lg border border-border/80 bg-white px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-normal text-primary/70">
              Leader note
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {item.reasonNote}
            </p>
          </div>
        ) : null}

        {canCreateCase && !item.hasFollowUpCase && createOptions ? (
          <CreateFollowUpCaseForm
            absenteeRecordId={item.absenteeRecordId}
            options={createOptions}
          />
        ) : null}

        {item.canUpdateCase ? <UpdateFollowUpCaseProgressForm item={item} /> : null}
      </CardContent>
    </Card>
  );
}
