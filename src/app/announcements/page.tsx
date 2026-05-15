import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementCard } from "@/features/announcements/components/announcement-card";
import { AnnouncementEmptyState } from "@/features/announcements/components/announcement-empty-state";
import { AnnouncementSummaryCard } from "@/features/announcements/components/announcement-summary-card";
import {
  getAdminAnnouncements,
  getLeaderAnnouncements,
  type AnnouncementOverview,
} from "@/features/announcements/queries";
import { getCurrentUser } from "@/features/auth/get-current-user";

function QueryNotice({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-border/80 bg-[#FBFAF8] px-4 py-3 text-sm leading-6 text-muted-foreground">
      {message}
    </div>
  );
}

function RestrictedState() {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Announcement access
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          Announcement visibility is limited to active church leaders and
          church admins.
        </p>
      </CardContent>
    </Card>
  );
}

function AnnouncementList({ overview }: { overview: AnnouncementOverview }) {
  if (overview.announcements.length === 0) {
    return <AnnouncementEmptyState />;
  }

  return (
    <section className="grid gap-3">
      {overview.announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
        />
      ))}
    </section>
  );
}

export default async function AnnouncementsPage() {
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isLeader = Boolean(primaryRole);

  let title = "Announcements";
  let subtitle = "Leadership updates and notices.";
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
            Announcement visibility depends on an active church membership. Ask
            an admin to confirm your access.
          </p>
        </CardContent>
      </Card>
    );
  } else if (isAdmin) {
    title = "Announcements";
    subtitle = "Leadership announcements across the church.";

    const announcementsResult = await getAdminAnnouncements(churchId);
    const overview = announcementsResult.data;

    content = (
      <>
        {announcementsResult.error ? (
          <QueryNotice message={announcementsResult.error} />
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <AnnouncementSummaryCard
            label="Total"
            value={overview.summary.total}
          />
          <AnnouncementSummaryCard
            label="Active"
            value={overview.summary.active}
          />
          <AnnouncementSummaryCard
            label="Urgent"
            value={overview.summary.urgent}
          />
          {overview.summary.hasExpiry ? (
            <AnnouncementSummaryCard
              label="Expired"
              value={overview.summary.expired}
            />
          ) : null}
        </section>

        <AnnouncementList overview={overview} />
      </>
    );
  } else if (isLeader) {
    const announcementsResult = await getLeaderAnnouncements(user.id, churchId);
    const overview = announcementsResult.data;

    content = (
      <>
        {announcementsResult.error ? (
          <QueryNotice message={announcementsResult.error} />
        ) : null}

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <AnnouncementSummaryCard
            label="Visible"
            value={overview.summary.total}
          />
          <AnnouncementSummaryCard
            label="Active"
            value={overview.summary.active}
          />
          <AnnouncementSummaryCard
            label="Urgent"
            value={overview.summary.urgent}
          />
        </section>

        <AnnouncementList overview={overview} />
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <section className="grid gap-2">
        <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm leading-6 text-muted-foreground">{subtitle}</p>
      </section>

      {content}
    </AppShell>
  );
}
