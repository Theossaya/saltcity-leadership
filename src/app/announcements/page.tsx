import { redirect } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { Textarea } from "@/components/ui/textarea";
import { createAnnouncement } from "@/features/announcements/actions";
import { AnnouncementCard } from "@/features/announcements/components/announcement-card";
import { AnnouncementEmptyState } from "@/features/announcements/components/announcement-empty-state";
import { AnnouncementSummaryCard } from "@/features/announcements/components/announcement-summary-card";
import {
  getAdminAnnouncements,
  getLeaderAnnouncements,
  type AnnouncementOverview,
} from "@/features/announcements/queries";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { ANNOUNCEMENT_AUDIENCE_ROLES } from "@/lib/validation/announcements";

type AnnouncementsPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
    error?: string | string[];
  }>;
};

function formatRoleLabel(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

function CreateAnnouncementForm() {
  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Create announcement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createAnnouncement} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="announcement-title">Title</Label>
            <Input
              id="announcement-title"
              name="title"
              maxLength={120}
              required
              className="h-12 bg-background"
              placeholder="Short leadership update"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="announcement-message">Message</Label>
            <Textarea
              id="announcement-message"
              name="message"
              maxLength={3000}
              required
              className="min-h-28 bg-background"
              placeholder="Plain-text instruction or update for leaders."
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="announcement-audience-type">
                Leadership audience
              </Label>
              <select
                id="announcement-audience-type"
                name="audienceType"
                defaultValue="all_leaders"
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                <option value="all_leaders">All leaders</option>
                <option value="role">Specific role</option>
              </select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="announcement-audience-role">Audience role</Label>
              <select
                id="announcement-audience-role"
                name="audienceRole"
                defaultValue="company_leader"
                className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm"
              >
                {ANNOUNCEMENT_AUDIENCE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatRoleLabel(role)}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-muted-foreground">
                Used when the audience is set to a specific role.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="grid gap-2">
              <Label htmlFor="announcement-expires-at">Expiry date and time</Label>
              <Input
                id="announcement-expires-at"
                name="expiresAt"
                type="datetime-local"
                className="h-12 bg-background"
              />
            </div>

            <label className="flex min-h-12 items-center gap-3 rounded-lg border border-border/80 bg-background px-3 text-sm font-medium text-foreground">
              <input
                type="checkbox"
                name="isUrgent"
                className="size-4 rounded border-border accent-primary"
              />
              Mark urgent
            </label>
          </div>

          <div className="border-t border-border/80 pt-1">
            <Button
              type="submit"
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
            >
              Publish announcement
            </Button>
          </div>
        </form>
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

export default async function AnnouncementsPage({
  searchParams,
}: AnnouncementsPageProps) {
  const resolvedSearchParams = await searchParams;
  const createdParam = resolvedSearchParams?.created;
  const errorParam = resolvedSearchParams?.error;
  const announcementCreated =
    (Array.isArray(createdParam) ? createdParam[0] : createdParam) ===
    "announcement";
  const createError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-create-announcement";
  const { user, profile, primaryRole, churchId, church } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isLeader = Boolean(primaryRole);
  const actionNotice = (
    <>
      {announcementCreated ? (
        <Alert className="border-[#C8BDAF] bg-[#FBFAF8]">
          <AlertDescription>Announcement published.</AlertDescription>
        </Alert>
      ) : null}

      {createError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Announcement could not be published.
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  );

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

        <CreateAnnouncementForm />

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-4">
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

        <section className="grid grid-cols-2 gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-3">
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
      <PageHeader title={title} subtitle={subtitle} />

      {actionNotice}

      {content}
    </AppShell>
  );
}
