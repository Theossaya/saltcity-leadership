import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Counter } from "@/components/v2/primitives/counter";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { FollowUpCard } from "@/features/follow-up/components/follow-up-card";
import { FollowUpHistoryCard } from "@/features/follow-up/components/follow-up-history-card";
import {
  getAdminFollowUpQueue,
  getAdminResolvedFollowUpQueue,
  getAssignedFollowUpQueue,
  getAssignedResolvedFollowUpQueue,
  getFollowUpCreateOptions,
  type FollowUpCreateOptions,
  type FollowUpQueue,
  type FollowUpQueueItem,
} from "@/features/follow-up/queries";

type FollowUpPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
    updated?: string | string[];
    error?: string | string[];
  }>;
};

const createErrorMessages: Record<string, string> = {
  "duplicate-case": "Active follow-up already exists for this absence.",
  "invalid-absentee": "That absentee record could not be found for this church.",
  "invalid-assignee": "That assigned leader is not active in this church.",
  "permission-denied": "You do not have permission to assign this follow-up.",
  "unable-to-create-case": "Follow-up could not be assigned.",
};

function EmptyModule({ children }: { children: string }) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <p className="font-serif text-[13.5px] italic leading-[1.45] text-ink-2">
        {children}
      </p>
    </section>
  );
}

function CareNotice({
  tone = "ok",
  message,
}: {
  tone?: "ok" | "urgent";
  message: string;
}) {
  return (
    <div
      className={
        tone === "urgent"
          ? "mt-4 rounded-card bg-urgent-bg px-4 py-3 font-sans text-sm font-semibold leading-6 text-urgent"
          : "mt-4 rounded-card bg-ok-bg px-4 py-3 font-sans text-sm font-semibold leading-6 text-ok"
      }
    >
      {message}
    </div>
  );
}

function RestrictedState({ message }: { message: string }) {
  return (
    <>
      <V2Sect>Care access</V2Sect>
      <EmptyModule>{message}</EmptyModule>
    </>
  );
}

function getFollowUpItemKey(item: FollowUpQueueItem) {
  return item.followUpCaseId ?? item.absenteeRecordId;
}

function isUrgentCase(item: FollowUpQueueItem) {
  return item.followUpStatus === "escalated" || item.priority === "urgent";
}

function sortCareItems(items: FollowUpQueueItem[]) {
  return [...items].sort((first, second) => {
    const firstUrgent = isUrgentCase(first);
    const secondUrgent = isUrgentCase(second);

    if (firstUrgent !== secondUrgent) {
      return firstUrgent ? -1 : 1;
    }

    if (first.isCurrentWeek !== second.isCurrentWeek) {
      return first.isCurrentWeek ? -1 : 1;
    }

    return second.absenceDate.localeCompare(first.absenceDate);
  });
}

function CareSummaryStrip({
  active,
  newFromReports,
  urgent,
  resolved,
}: {
  active: number;
  newFromReports: number;
  urgent: number;
  resolved: number;
}) {
  return (
    <section className="mt-[18px] grid grid-cols-2 gap-3 rounded-card bg-surface p-[18px] shadow-lift sm:grid-cols-4">
      <Counter value={newFromReports} label="New from reports" />
      <Counter value={active} label="Assigned" />
      <Counter value={urgent} label="Needs pastor" />
      <Counter value={resolved} label="Recently closed" />
    </section>
  );
}

function CareQueueList({
  items,
  createOptions,
  canCreateCase = false,
  featuredKey,
  emptyMessage = "No follow-up is listed here right now.",
  perspective,
}: {
  items: FollowUpQueueItem[];
  createOptions?: FollowUpCreateOptions;
  canCreateCase?: boolean;
  featuredKey?: string;
  emptyMessage?: string;
  perspective?: "admin-new" | "admin-assigned" | "leader-assigned";
}) {
  if (items.length === 0) {
    return <EmptyModule>{emptyMessage}</EmptyModule>;
  }

  return (
    <div className="grid gap-2.5">
      {items.map((item) => (
        <FollowUpCard
          key={getFollowUpItemKey(item)}
          item={item}
          createOptions={createOptions}
          canCreateCase={canCreateCase}
          featured={getFollowUpItemKey(item) === featuredKey}
          perspective={perspective}
        />
      ))}
    </div>
  );
}

function ResolvedHistoryList({ queue }: { queue: FollowUpQueue }) {
  return (
    <>
      <V2Sect action={`${queue.items.length} recent`}>Recently closed</V2Sect>
      {queue.items.length > 0 ? (
        <div className="grid gap-2.5">
          {queue.items.map((item) => (
            <FollowUpHistoryCard
              key={item.followUpCaseId ?? item.absenteeRecordId}
              item={item}
            />
          ))}
        </div>
      ) : (
        <EmptyModule>Closed follow-up will rest here.</EmptyModule>
      )}
    </>
  );
}

function AdminCareLayout({
  queue,
  resolvedQueue,
  createOptions,
}: {
  queue: FollowUpQueue;
  resolvedQueue: FollowUpQueue;
  createOptions?: FollowUpCreateOptions;
}) {
  const sortedItems = sortCareItems(queue.items);
  const newItems = sortedItems.filter((item) => !item.hasFollowUpCase);
  const urgentItems = sortedItems.filter(
    (item) => item.hasFollowUpCase && isUrgentCase(item),
  );
  const assignedItems = sortedItems.filter(
    (item) => item.hasFollowUpCase && !isUrgentCase(item),
  );

  return (
    <>
      <CareSummaryStrip
        active={assignedItems.length}
        newFromReports={newItems.length}
        urgent={urgentItems.length}
        resolved={resolvedQueue.summary.totalItems}
      />

      <V2Sect action={`${newItems.length} new`}>New from reports</V2Sect>
      <CareQueueList
        items={newItems}
        createOptions={createOptions}
        canCreateCase
        emptyMessage="No new absentee records are waiting for office review."
        perspective="admin-new"
      />

      <V2Sect action={`${assignedItems.length} assigned`}>
        Assigned follow-up
      </V2Sect>
      <CareQueueList
        items={assignedItems}
        createOptions={createOptions}
        emptyMessage="No assigned follow-up is active right now."
        perspective="admin-assigned"
      />

      <V2Sect action={`${urgentItems.length} urgent`}>Needs pastor / urgent</V2Sect>
      <CareQueueList
        items={urgentItems}
        createOptions={createOptions}
        emptyMessage="No urgent follow-up is marked right now."
        perspective="admin-assigned"
      />

      <ResolvedHistoryList queue={resolvedQueue} />
    </>
  );
}

function LeaderCareLayout({
  queue,
  resolvedQueue,
}: {
  queue: FollowUpQueue;
  resolvedQueue: FollowUpQueue;
}) {
  const sortedItems = sortCareItems(queue.items);

  return (
    <>
      <section className="mt-[18px] grid grid-cols-2 gap-3 rounded-card bg-surface p-[18px] shadow-lift">
        <Counter value={queue.summary.totalItems} label="Assigned to you" />
        <Counter value={resolvedQueue.summary.totalItems} label="Recently closed" />
      </section>

      <V2Sect action={`${sortedItems.length} assigned`}>Assigned to you</V2Sect>
      <CareQueueList
        items={sortedItems}
        emptyMessage="No follow-up has been assigned to you yet. Your absentee notes remain saved with the weekly report."
        perspective="leader-assigned"
      />

      <ResolvedHistoryList queue={resolvedQueue} />
    </>
  );
}

function getAdminSubtitle(queue: FollowUpQueue, resolvedQueue: FollowUpQueue) {
  const newItems = queue.items.filter((item) => !item.hasFollowUpCase).length;
  const assigned = queue.items.filter((item) => item.hasFollowUpCase).length;
  const urgent = queue.items.filter(isUrgentCase).length;

  return `${newItems} new from reports. ${assigned} assigned. ${urgent} urgent. ${resolvedQueue.summary.totalItems} recently closed.`;
}

function getLeaderSubtitle(queue: FollowUpQueue, resolvedQueue: FollowUpQueue) {
  const assigned = queue.summary.totalItems;
  const closed = resolvedQueue.summary.totalItems;

  return assigned > 0
    ? `${assigned} assigned to you. ${closed} recently closed.`
    : "No follow-up has been assigned to you yet.";
}

export default async function FollowUpPage({ searchParams }: FollowUpPageProps) {
  const resolvedSearchParams = await searchParams;
  const createdParam = resolvedSearchParams?.created;
  const updatedParam = resolvedSearchParams?.updated;
  const errorParam = resolvedSearchParams?.error;
  const caseCreated =
    (Array.isArray(createdParam) ? createdParam[0] : createdParam) === "case";
  const caseUpdated =
    (Array.isArray(updatedParam) ? updatedParam[0] : updatedParam) === "case";
  const errorValue = Array.isArray(errorParam) ? errorParam[0] : errorParam;
  const createErrorMessage = errorValue ? createErrorMessages[errorValue] : null;
  const updateError =
    errorValue === "unable-to-update-case";
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";
  let title = <>Care for your <em>absent members.</em></>;
  let subtitle = "Follow-up will appear here when the church office assigns it.";
  let content = (
    <RestrictedState message="Follow-up visibility is limited to church admins and assigned company leaders." />
  );

  if (!churchId) {
    subtitle = "Ask an admin to confirm your active church membership.";
    content = (
      <RestrictedState message="Care visibility depends on an active church membership." />
    );
  } else if (isAdmin) {
    const [queueResult, resolvedQueueResult, createOptionsResult] = await Promise.all([
      getAdminFollowUpQueue(churchId, user.id),
      getAdminResolvedFollowUpQueue(churchId, user.id),
      getFollowUpCreateOptions(churchId),
    ]);
    const queue = queueResult.data;
    const resolvedQueue = resolvedQueueResult.data;

    title = <>Care across <em>the church.</em></>;
    subtitle = getAdminSubtitle(queue, resolvedQueue);
    content = (
      <>
        {queueResult.error ? <QueryNotice message={queueResult.error} /> : null}
        {resolvedQueueResult.error ? (
          <QueryNotice message={resolvedQueueResult.error} />
        ) : null}
        {createOptionsResult.error ? (
          <QueryNotice message={createOptionsResult.error} />
        ) : null}
        <AdminCareLayout
          queue={queue}
          resolvedQueue={resolvedQueue}
          createOptions={createOptionsResult.data}
        />
      </>
    );
  } else if (isCompanyLeader) {
    const [assignedQueueResult, assignedResolvedQueueResult] = await Promise.all([
      getAssignedFollowUpQueue(user.id, churchId),
      getAssignedResolvedFollowUpQueue(user.id, churchId),
    ]);
    const queue = assignedQueueResult.data;
    const resolvedQueue = assignedResolvedQueueResult.data;

    subtitle = getLeaderSubtitle(queue, resolvedQueue);
    content = (
      <>
        {assignedQueueResult.error ? (
          <QueryNotice message={assignedQueueResult.error} />
        ) : null}
        {assignedResolvedQueueResult.error ? (
          <QueryNotice message={assignedResolvedQueueResult.error} />
        ) : null}
        <LeaderCareLayout
          queue={queue}
          resolvedQueue={resolvedQueue}
        />
      </>
    );
  } else {
    const [queueResult, resolvedQueueResult] = await Promise.all([
      getAssignedFollowUpQueue(user.id, churchId),
      getAssignedResolvedFollowUpQueue(user.id, churchId),
    ]);
    const queue = queueResult.data;
    const resolvedQueue = resolvedQueueResult.data;

    subtitle = getLeaderSubtitle(queue, resolvedQueue);
    content = (
      <>
        {queueResult.error ? <QueryNotice message={queueResult.error} /> : null}
        {resolvedQueueResult.error ? (
          <QueryNotice message={resolvedQueueResult.error} />
        ) : null}
        <LeaderCareLayout
          queue={queue}
          resolvedQueue={resolvedQueue}
        />
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <V2Greeting eyebrow="Pastoral care" title={title} subtitle={subtitle} />

      {caseCreated ? <CareNotice message="Follow-up assigned." /> : null}
      {caseUpdated ? <CareNotice message="Contact record saved." /> : null}
      {createErrorMessage ? (
        <CareNotice tone="urgent" message={createErrorMessage} />
      ) : null}
      {updateError ? (
        <CareNotice tone="urgent" message="Contact record could not be saved." />
      ) : null}

      {content}
    </AppShell>
  );
}
