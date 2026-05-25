import { Pill } from "@/components/v2/primitives/pill";
import type { FollowUpQueueItem } from "@/features/follow-up/queries";
import {
  ABSENCE_REASON_LABELS,
  REPORT_STATUS_LABELS,
} from "@/lib/constants/statuses";

type FollowUpHistoryCardProps = {
  item: FollowUpQueueItem;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeZone: "Africa/Lagos",
  }).format(new Date(`${value}T00:00:00+01:00`));
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function getReportStatusLabel(status: string) {
  return (
    REPORT_STATUS_LABELS[status as keyof typeof REPORT_STATUS_LABELS] ??
    "Unknown"
  );
}

function NoteBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-input bg-bg px-3 py-2.5 shadow-[inset_0_0_0_1px_var(--rule)]">
      <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words font-sans text-[13px] leading-[1.55] text-ink-2">
        {value}
      </p>
    </div>
  );
}

export function FollowUpHistoryCard({ item }: FollowUpHistoryCardProps) {
  const reason =
    ABSENCE_REASON_LABELS[item.reason as keyof typeof ABSENCE_REASON_LABELS] ??
    "No reason given";

  return (
    <section className="rounded-card bg-surface p-[18px] text-ink shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.18em] text-ink-3">
            {item.companyName}
          </p>
          <h3 className="mt-2 break-words font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
            {item.memberName}
          </h3>
          <p className="mt-1 font-sans text-xs font-medium leading-snug text-ink-3">
            Closed {item.resolvedAt ? formatDateTime(item.resolvedAt) : "recently"}
          </p>
        </div>
        <Pill tone="ok">Closed</Pill>
      </div>

      <div className="mt-4 grid gap-3 rounded-input bg-bg p-3 sm:grid-cols-3">
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
            Absence
          </p>
          <p className="mt-1.5 break-words font-sans text-[13px] font-semibold leading-[1.35] text-ink">
            {formatDate(item.absenceDate)}
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
            Reason
          </p>
          <p className="mt-1.5 break-words font-sans text-[13px] font-semibold leading-[1.35] text-ink">
            {reason}
          </p>
        </div>
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] font-semibold uppercase leading-none tracking-[0.14em] text-ink-3">
            Report
          </p>
          <p className="mt-1.5 break-words font-sans text-[13px] font-semibold leading-[1.35] text-ink">
            {getReportStatusLabel(item.weeklyReportStatus)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 font-sans text-xs font-medium leading-[1.4] text-ink-3">
        {item.assignedUserName ? <span>{item.assignedUserName}</span> : null}
        {item.lastContactDate ? (
          <>
            {item.assignedUserName ? <span aria-hidden="true">/</span> : null}
            <span>Contacted {formatDate(item.lastContactDate)}</span>
          </>
        ) : null}
        <span aria-hidden="true">/</span>
        <span>Week of {formatDate(item.reportWeekStart)}</span>
      </div>

      {item.nextAction || item.notes || item.reasonNote ? (
        <div className="mt-4 grid gap-2">
          <NoteBlock label="Final next action" value={item.nextAction} />
          <NoteBlock label="Final notes" value={item.notes} />
          <NoteBlock label="Original leader note" value={item.reasonNote} />
        </div>
      ) : null}
    </section>
  );
}
