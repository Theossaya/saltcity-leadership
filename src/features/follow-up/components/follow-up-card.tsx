import { Button } from "@/components/v2/primitives/button";
import { Field, Select, TextArea, TextInput } from "@/components/v2/primitives/field";
import { Pill } from "@/components/v2/primitives/pill";
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
  featured?: boolean;
  perspective?: "admin-new" | "admin-assigned" | "leader-assigned";
};

const statusTone: Record<FollowUpStatus, "urgent" | "care" | "ok" | "quiet"> = {
  not_started: "quiet",
  open: "quiet",
  assigned: "care",
  contacted: "care",
  resolved: "ok",
  escalated: "urgent",
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
  if (status === "not_started") {
    return "New from report";
  }

  if (status === "resolved") {
    return "Closed";
  }

  return FOLLOW_UP_STATUS_LABELS[
    status as keyof typeof FOLLOW_UP_STATUS_LABELS
  ];
}

function formatRoleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function DetailBlock({
  label,
  children,
  quiet = false,
}: {
  label: string;
  children: string;
  quiet?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-input px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--rule)]",
        quiet ? "bg-surface-2" : "bg-bg",
      )}
    >
      <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words font-sans text-[13px] leading-[1.55] text-ink-2">
        {children}
      </p>
    </div>
  );
}

function CaseStateSummary({
  item,
  featured = false,
  perspective = "admin-assigned",
}: {
  item: FollowUpQueueItem;
  featured?: boolean;
  perspective?: FollowUpCardProps["perspective"];
}) {
  if (!item.hasFollowUpCase) {
    return null;
  }

  return (
    <div
      className={cn(
        "mt-4 rounded-card p-[18px]",
        featured ? "bg-bg/10" : "bg-surface-2",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p
          className={cn(
            "font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em]",
            featured ? "text-bg/70" : "text-warm",
          )}
        >
          {perspective === "leader-assigned"
            ? "You were asked to follow up"
            : "Office oversight"}
        </p>
        <Pill tone={statusTone[item.followUpStatus]}>
          {getFollowUpStatusLabel(item.followUpStatus)}
        </Pill>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <CareFact
          label="Status"
          value={getFollowUpStatusLabel(item.followUpStatus)}
          featured={featured}
        />
        {item.lastContactDate ? (
          <CareFact
            label="Last contacted"
            value={formatDate(item.lastContactDate)}
            featured={featured}
          />
        ) : (
          <CareFact label="Last contacted" value="Not recorded" featured={featured} />
        )}
      </div>

      {item.nextAction || item.notes ? (
        <div className="mt-3 grid gap-2">
          {item.nextAction ? (
            <DetailBlock label="Next action" quiet={featured}>
              {item.nextAction}
            </DetailBlock>
          ) : null}
          {item.notes ? (
            <DetailBlock label="Notes" quiet={featured}>
              {item.notes}
            </DetailBlock>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function CareFact({
  label,
  value,
  featured = false,
}: {
  label: string;
  value: string;
  featured?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p
        className={cn(
          "font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em]",
          featured ? "text-bg/60" : "text-ink-3",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 break-words font-sans text-[13px] font-semibold leading-[1.35]",
          featured ? "text-bg" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
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
      className="mt-4 grid gap-3 rounded-card bg-warm-soft p-[18px]"
    >
      <input type="hidden" name="absenteeRecordId" value={absenteeRecordId} />

      <div>
        <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em] text-warm">
          Assign follow-up
        </p>
        <h4 className="mt-2 font-serif text-[17px] font-medium leading-[1.22] tracking-[-0.008em] text-ink">
          Choose who should follow up on this absence.
        </h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          htmlFor={`follow-up-assigned-to-${absenteeRecordId}`}
          label="Assigned leader"
        >
          <Select
            id={`follow-up-assigned-to-${absenteeRecordId}`}
            name="assignedTo"
            defaultValue=""
          >
            <option value="">Not assigned yet</option>
            {options.assignees.map((assignee) => (
              <option key={assignee.id} value={assignee.id}>
                {assignee.name} - {formatRoleLabel(assignee.role)}
              </option>
            ))}
          </Select>
        </Field>

        <Field htmlFor={`follow-up-priority-${absenteeRecordId}`} label="Priority">
          <Select
            id={`follow-up-priority-${absenteeRecordId}`}
            name="priority"
            defaultValue="normal"
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {TASK_PRIORITY_LABELS[priority]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        htmlFor={`follow-up-next-action-${absenteeRecordId}`}
        label="Next action"
      >
        <TextArea
          id={`follow-up-next-action-${absenteeRecordId}`}
          name="nextAction"
          maxLength={500}
          className="min-h-24"
          placeholder="Optional next step"
        />
      </Field>

      <Field htmlFor={`follow-up-notes-${absenteeRecordId}`} label="Notes">
        <TextArea
          id={`follow-up-notes-${absenteeRecordId}`}
          name="notes"
          maxLength={2000}
          placeholder="Optional private context for care"
        />
      </Field>

      <Button type="submit" variant="ink" className="w-full sm:w-fit">
        Assign follow-up
      </Button>
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
      className="mt-4 grid gap-3"
    >
      <input type="hidden" name="followUpCaseId" value={item.followUpCaseId} />

      <div>
        <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em] text-warm">
          Contact record
        </p>
        <h4 className="mt-2 font-serif text-[17px] font-medium leading-[1.22] tracking-[-0.008em] text-ink">
          Record the latest contact and next step.
        </h4>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field htmlFor={`follow-up-status-${item.followUpCaseId}`} label="Status">
          <Select
            id={`follow-up-status-${item.followUpCaseId}`}
            name="status"
            defaultValue={item.followUpStatus}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {getFollowUpStatusLabel(status)}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          htmlFor={`follow-up-date-contacted-${item.followUpCaseId}`}
          label="Date contacted"
        >
          <TextInput
            id={`follow-up-date-contacted-${item.followUpCaseId}`}
            name="dateContacted"
            type="date"
            defaultValue={item.lastContactDate ?? ""}
            max={getTodayDateInput()}
          />
        </Field>
      </div>

      <Field
        htmlFor={`follow-up-next-action-update-${item.followUpCaseId}`}
        label="Next action"
      >
        <TextArea
          id={`follow-up-next-action-update-${item.followUpCaseId}`}
          name="nextAction"
          defaultValue={item.nextAction ?? ""}
          maxLength={500}
          className="min-h-24"
          placeholder="Optional next step"
        />
      </Field>

      <Field
        htmlFor={`follow-up-notes-update-${item.followUpCaseId}`}
        label="Notes"
      >
        <TextArea
          id={`follow-up-notes-update-${item.followUpCaseId}`}
          name="notes"
          defaultValue={item.notes ?? ""}
          maxLength={2000}
          placeholder="Optional contact notes"
        />
      </Field>

      <Button type="submit" variant="ink" className="w-full sm:w-fit">
        Record contact
      </Button>
    </form>
  );
}

function UpdateFollowUpCaseDisclosure({ item }: { item: FollowUpQueueItem }) {
  return (
    <details className="mt-4 rounded-card bg-surface-2 p-[18px] shadow-[inset_0_0_0_1px_var(--rule)]">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-input bg-bg px-3.5 py-3 font-sans text-[13.5px] font-semibold leading-none text-ink shadow-[inset_0_0_0_1px_var(--rule-strong)] marker:hidden [&::-webkit-details-marker]:hidden">
        <span>Record contact</span>
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.12em] text-ink-3">
          Open form
        </span>
      </summary>
      <UpdateFollowUpCaseProgressForm item={item} />
    </details>
  );
}

export function FollowUpCard({
  item,
  createOptions,
  canCreateCase = false,
  featured = false,
  perspective = item.hasFollowUpCase ? "admin-assigned" : "admin-new",
}: FollowUpCardProps) {
  const reason =
    ABSENCE_REASON_LABELS[item.reason as keyof typeof ABSENCE_REASON_LABELS] ??
    "No reason given";

  return (
    <section
      className={cn(
        "rounded-card bg-surface p-[18px] text-ink shadow-lift",
        featured && "bg-ink text-bg",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em]",
              featured ? "text-bg/70" : "text-ink-3",
            )}
          >
            {item.companyName}
          </p>
          <h3
            className={cn(
              "mt-2 break-words font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-pretty",
              featured ? "text-bg" : "text-ink",
            )}
          >
            {item.memberName}
          </h3>
          <p
            className={cn(
              "mt-1 font-sans text-xs font-medium leading-snug",
              featured ? "text-bg/70" : "text-ink-3",
            )}
          >
            {item.contextDateLabel} {formatDate(item.absenceDate)}
          </p>
        </div>
        <Pill tone={statusTone[item.followUpStatus]}>
          {getFollowUpStatusLabel(item.followUpStatus)}
        </Pill>
      </div>

      <div
        className={cn(
          "mt-4 grid gap-3 rounded-input p-3 sm:grid-cols-3",
          featured ? "bg-bg/10" : "bg-bg",
        )}
      >
        <CareFact label="Reason" value={reason} featured={featured} />
        <CareFact
          label="Report"
          value={getReportStatusLabel(item.weeklyReportStatus)}
          featured={featured}
        />
        <CareFact
          label="Assigned"
          value={item.assignedUserName ?? "Not assigned yet"}
          featured={featured}
        />
      </div>

      <div
        className={cn(
          "mt-3 flex flex-wrap gap-2 font-sans text-xs font-medium leading-[1.4]",
          featured ? "text-bg/75" : "text-ink-3",
        )}
      >
        <span>Week of {formatDate(item.reportWeekStart)}</span>
        <span aria-hidden="true">/</span>
        <span>
          {item.hasFollowUpCase ? "Follow-up assigned" : "New from report"}
        </span>
        {item.lastContactDate ? (
          <>
            <span aria-hidden="true">/</span>
            <span>Last contacted {formatDate(item.lastContactDate)}</span>
          </>
        ) : null}
      </div>

      <CaseStateSummary
        item={item}
        featured={featured}
        perspective={perspective}
      />

      {item.reasonNote ? (
        <div className="mt-4 grid gap-2">
          <DetailBlock label="Leader note" quiet={featured}>
            {item.reasonNote}
          </DetailBlock>
        </div>
      ) : null}

      {canCreateCase && !item.hasFollowUpCase && createOptions ? (
        <CreateFollowUpCaseForm
          absenteeRecordId={item.absenteeRecordId}
          options={createOptions}
        />
      ) : null}

      {item.canUpdateCase ? <UpdateFollowUpCaseDisclosure item={item} /> : null}
    </section>
  );
}
