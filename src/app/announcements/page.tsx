import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { QueryNotice } from "@/components/ui/query-notice";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Button as V2Button } from "@/components/v2/primitives/button";
import { Counter } from "@/components/v2/primitives/counter";
import {
  Field,
  Select,
  TextArea,
  TextInput,
} from "@/components/v2/primitives/field";
import { Pill } from "@/components/v2/primitives/pill";
import { createAnnouncement } from "@/features/announcements/actions";
import {
  getAdminAnnouncements,
  getLeaderAnnouncements,
  type AnnouncementListItem,
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function EmptyNotice({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <h2 className="font-serif text-[18px] font-medium leading-tight text-ink text-pretty">
        {title}
      </h2>
      <p className="mt-2 font-sans text-sm leading-6 text-ink-2">{message}</p>
    </section>
  );
}

function RestrictedState() {
  return (
    <>
      <V2Sect>Notice access</V2Sect>
      <EmptyNotice
        title="Announcements are limited to leaders."
        message="Official notices appear for active church leaders and church admins."
      />
    </>
  );
}

function CreateAnnouncementForm() {
  return (
    <>
      <V2Sect>Church office</V2Sect>
      <details className="rounded-card bg-surface p-[18px] shadow-lift">
        <summary className="cursor-pointer list-none font-serif text-[18px] font-medium leading-tight text-ink marker:hidden">
          Publish a notice
        </summary>
        <form action={createAnnouncement} className="mt-4 grid gap-4">
          <Field htmlFor="announcement-title" label="Title">
            <TextInput
              id="announcement-title"
              name="title"
              maxLength={120}
              required
              placeholder="Short leadership update"
            />
          </Field>

          <Field htmlFor="announcement-message" label="Message">
            <TextArea
              id="announcement-message"
              name="message"
              maxLength={3000}
              required
              placeholder="Plain-text instruction or update for leaders."
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="announcement-audience-type" label="Leadership audience">
              <Select
                id="announcement-audience-type"
                name="audienceType"
                defaultValue="all_leaders"
              >
                <option value="all_leaders">All leaders</option>
                <option value="role">Specific role</option>
              </Select>
            </Field>

            <Field
              htmlFor="announcement-audience-role"
              label="Audience role"
              hint="Used when the audience is set to a specific role."
            >
              <Select
                id="announcement-audience-role"
                name="audienceRole"
                defaultValue="company_leader"
              >
                {ANNOUNCEMENT_AUDIENCE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {formatRoleLabel(role)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field htmlFor="announcement-expires-at" label="Expiry date and time">
              <TextInput
                id="announcement-expires-at"
                name="expiresAt"
                type="datetime-local"
              />
            </Field>

            <label className="flex min-h-12 items-center gap-3 rounded-input bg-bg px-3.5 font-sans text-sm font-semibold text-ink shadow-[inset_0_0_0_1px_var(--rule-strong)]">
              <input
                type="checkbox"
                name="isUrgent"
                className="size-4 rounded accent-primary"
              />
              Mark urgent
            </label>
          </div>

          <V2Button type="submit" className="w-full sm:w-fit">
            Publish announcement
          </V2Button>
        </form>
      </details>
    </>
  );
}

function NoticeModule({ announcement }: { announcement: AnnouncementListItem }) {
  const tone = announcement.isExpired
    ? "quiet"
    : announcement.isUrgent
      ? "urgent"
      : "care";

  return (
    <article
      className={
        announcement.isUrgent && !announcement.isExpired
          ? "rounded-card bg-urgent-bg p-[18px] text-ink shadow-lift"
          : "rounded-card bg-surface p-[18px] text-ink shadow-lift"
      }
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.16em] text-ink-3">
            {announcement.audienceLabel}
          </p>
          <h2 className="mt-2 break-words font-serif text-[18px] font-medium leading-[1.22] tracking-[-0.008em] text-ink text-pretty">
            {announcement.title}
          </h2>
        </div>
        <Pill tone={tone}>
          {announcement.isExpired
            ? "Archived"
            : announcement.isUrgent
              ? "Urgent"
              : "General notice"}
        </Pill>
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words font-sans text-[13.5px] leading-[1.6] text-ink-2">
        {announcement.message}
      </p>

      <dl className="mt-4 grid gap-3 rounded-card bg-bg-tint p-3 sm:grid-cols-3">
        <div>
          <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-3">
            Published
          </dt>
          <dd className="mt-1 font-sans text-xs font-semibold leading-[1.4] text-ink-2">
            {formatDateTime(announcement.createdAt)}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-3">
            From
          </dt>
          <dd className="mt-1 break-words font-sans text-xs font-semibold leading-[1.4] text-ink-2">
            {announcement.createdByName ?? "Leadership admin"}
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-ink-3">
            Expires
          </dt>
          <dd className="mt-1 font-sans text-xs font-semibold leading-[1.4] text-ink-2">
            {announcement.expiresAt
              ? formatDateTime(announcement.expiresAt)
              : "No expiry"}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function AnnouncementBoard({ overview }: { overview: AnnouncementOverview }) {
  const urgentNotices = overview.announcements.filter(
    (announcement) => announcement.isUrgent && !announcement.isExpired,
  );
  const activeNotices = overview.announcements.filter(
    (announcement) => !announcement.isUrgent && !announcement.isExpired,
  );
  const archivedNotices = overview.announcements.filter(
    (announcement) => announcement.isExpired,
  );

  if (overview.announcements.length === 0) {
    return (
      <>
        <V2Sect>Active notices</V2Sect>
        <EmptyNotice
          title="The notice board is clear."
          message="Official leadership announcements will be posted here when there is something to carry."
        />
      </>
    );
  }

  return (
    <>
      <section className="mt-[18px] grid grid-cols-3 gap-3 rounded-card bg-surface p-[18px] shadow-lift">
        <Counter value={overview.summary.active} label="Active" />
        <Counter value={urgentNotices.length} label="Urgent" />
        <Counter value={overview.summary.total} label="Total" />
      </section>

      {urgentNotices.length > 0 ? (
        <>
          <V2Sect action={`${urgentNotices.length}`}>Urgent notices</V2Sect>
          <div className="grid gap-3">
            {urgentNotices.map((announcement) => (
              <NoticeModule key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </>
      ) : null}

      <V2Sect action={`${activeNotices.length}`}>Active notices</V2Sect>
      {activeNotices.length > 0 ? (
        <div className="grid gap-3">
          {activeNotices.map((announcement) => (
            <NoticeModule key={announcement.id} announcement={announcement} />
          ))}
        </div>
      ) : (
        <EmptyNotice
          title="No general notices are active."
          message="Urgent or archived notices remain separated so the board stays easy to read."
        />
      )}

      {overview.summary.hasExpiry ? (
        <>
          <V2Sect action={`${archivedNotices.length}`}>Archive</V2Sect>
          {archivedNotices.length > 0 ? (
            <div className="grid gap-3">
              {archivedNotices.map((announcement) => (
                <NoticeModule key={announcement.id} announcement={announcement} />
              ))}
            </div>
          ) : (
            <EmptyNotice
              title="No notices have expired."
              message="Expired notices will settle here after their expiry date."
            />
          )}
        </>
      ) : null}
    </>
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

  let content = <RestrictedState />;

  if (!churchId) {
    content = (
      <>
        <V2Sect>Notice access</V2Sect>
        <EmptyNotice
          title="Active church membership needed."
          message="Announcement visibility depends on an active church membership. Ask an admin to confirm your access."
        />
      </>
    );
  } else if (isAdmin) {
    const announcementsResult = await getAdminAnnouncements(churchId);

    content = (
      <>
        {announcementCreated ? (
          <QueryNotice tone="ok" message="Announcement published to the notice board." />
        ) : null}
        {createError ? (
          <QueryNotice message="Announcement could not be published. Check the title, message, and audience, then try again." />
        ) : null}
        {announcementsResult.error ? (
          <QueryNotice message="We could not load the announcement board. Try again shortly." />
        ) : null}
        <CreateAnnouncementForm />
        <AnnouncementBoard overview={announcementsResult.data} />
      </>
    );
  } else if (isLeader) {
    const announcementsResult = await getLeaderAnnouncements(user.id, churchId);

    content = (
      <>
        {announcementsResult.error ? (
          <QueryNotice message="We could not load leadership announcements. Try again shortly." />
        ) : null}
        <AnnouncementBoard overview={announcementsResult.data} />
      </>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <V2Greeting
        eyebrow="Official notices"
        title={
          <>
            From the <em>desk.</em>
          </>
        }
        subtitle="Leadership announcements are kept here as official notices, not a social feed."
      />

      {content}
    </AppShell>
  );
}
