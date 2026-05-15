import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { FollowUpCard } from "@/features/follow-up/components/follow-up-card";
import { FollowUpEmptyState } from "@/features/follow-up/components/follow-up-empty-state";
import { FollowUpSummaryCard } from "@/features/follow-up/components/follow-up-summary-card";
import {
  getAdminFollowUpQueue,
  getCompanyFollowUpQueue,
  type FollowUpQueue,
} from "@/features/follow-up/queries";

function RestrictedState() {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Follow-up access</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Follow-up visibility is limited to church admins and assigned company
          leaders.
        </p>
      </CardContent>
    </Card>
  );
}

function FollowUpQueueList({ queue }: { queue: FollowUpQueue }) {
  if (queue.items.length === 0) {
    return <FollowUpEmptyState />;
  }

  return (
    <section className="grid gap-3">
      {queue.items.map((item) => (
        <FollowUpCard key={item.absenteeRecordId} item={item} />
      ))}
    </section>
  );
}

export default async function FollowUpPage() {
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

  let title = "Follow-up";
  let subtitle = "Absentee follow-up visibility will appear when assigned.";
  let content = <RestrictedState />;

  if (!churchId) {
    content = (
      <Card className="rounded-lg border-border/80 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            No active church membership found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-muted-foreground">
            Follow-up visibility depends on an active church membership. Ask an
            admin to confirm your access.
          </p>
        </CardContent>
      </Card>
    );
  } else if (isAdmin) {
    title = "Follow-up";
    subtitle = "Absentee follow-up visibility across companies.";

    const queueResult = await getAdminFollowUpQueue(churchId);
    const queue = queueResult.data;

    content = (
      <>
        {queueResult.error ? <QueryNotice message={queueResult.error} /> : null}

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-4">
          <FollowUpSummaryCard
            label="Total items"
            value={queue.summary.totalItems}
          />
          <FollowUpSummaryCard
            label="Not started"
            value={queue.summary.notStarted}
          />
          <FollowUpSummaryCard
            label="With case"
            value={queue.summary.withCase}
          />
          <FollowUpSummaryCard
            label="Current week"
            value={queue.summary.currentWeek}
          />
        </section>

        <FollowUpQueueList queue={queue} />
      </>
    );
  } else if (isCompanyLeader) {
    title = "Follow-up";
    subtitle = "Absentee follow-up for your assigned company.";

    const queueResult = await getCompanyFollowUpQueue(user.id, churchId);
    const queue = queueResult.data;

    content = (
      <>
        {queueResult.error ? <QueryNotice message={queueResult.error} /> : null}

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-3">
          <FollowUpSummaryCard
            label="Total items"
            value={queue.summary.totalItems}
          />
          <FollowUpSummaryCard
            label="Current week"
            value={queue.summary.currentWeek}
          />
          <FollowUpSummaryCard
            label="Not started"
            value={queue.summary.notStarted}
          />
        </section>

        <FollowUpQueueList queue={queue} />
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <PageHeader title={title} subtitle={subtitle} />

      {content}
    </AppShell>
  );
}
