import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { formatRole } from "@/lib/utils/format-role";

type SupportingCard = {
  title: string;
  text: string;
  href?: string;
  linkLabel?: string;
};

const adminCards: SupportingCard[] = [
  {
    title: "Companies overview",
    text: "Review company assignments, leaders, and current member counts.",
    href: "/companies",
    linkLabel: "Open companies",
  },
  {
    title: "Pending reports",
    text: "See which companies have submitted and which still need attention.",
    href: "/reports",
    linkLabel: "Open reports",
  },
  {
    title: "Follow-up queue",
    text: "Scan absentee records that need a careful leadership response.",
    href: "/follow-up",
    linkLabel: "Open follow-up",
  },
  {
    title: "Assigned tasks",
    text: "Track visible leadership assignments and their current status.",
    href: "/tasks",
    linkLabel: "Open tasks",
  },
  {
    title: "Announcements",
    text: "Check active leadership notices and urgent updates.",
    href: "/announcements",
    linkLabel: "Open announcements",
  },
  {
    title: "Events",
    text: "Review regular services and visible leadership events.",
    href: "/events",
    linkLabel: "Open events",
  },
];

const generalLeaderCards: SupportingCard[] = [
  {
    title: "Announcements",
    text: "Check active leadership notices and urgent updates.",
    href: "/announcements",
    linkLabel: "Open announcements",
  },
  {
    title: "Assigned tasks",
    text: "Review assignments that have been shared with you.",
    href: "/tasks",
    linkLabel: "Open tasks",
  },
  {
    title: "Events",
    text: "Review regular services and visible leadership events.",
    href: "/events",
    linkLabel: "Open events",
  },
];

export default async function DashboardPage() {
  const { user, profile, primaryRole, church, assignedCompany } =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";

  const attention = isAdmin
    ? {
        title: "Leadership status",
        text: "Start with reports, follow-up, and open assignments before reviewing the wider company structure.",
        action: "Open reports",
        href: "/reports",
      }
    : isCompanyLeader
      ? {
          title: "This week's company report",
          text: "Prepare attendance, absentees, and follow-up notes for your company before submission.",
          action: "Open report",
          href: "/reports",
        }
      : {
          title: "Leadership updates",
          text: "Announcements, tasks, and event responsibilities will appear here.",
          action: null,
          href: null,
        };

  const supportingCards = isAdmin
    ? adminCards
    : isCompanyLeader
      ? [
          {
            title: "My company",
            text: assignedCompany
              ? `${assignedCompany.name} is ready for member visibility.`
              : "Your assigned company will appear after admin assignment.",
            href: "/companies",
            linkLabel: "Open my company",
          },
          {
            title: "Report status",
            text: "Open your weekly workspace for counts, notes, and absentees.",
            href: "/reports",
            linkLabel: "Open reports",
          },
          {
            title: "Follow-up attention",
            text: "Review absentee records that may need personal follow-up.",
            href: "/follow-up",
            linkLabel: "Open follow-up",
          },
          {
            title: "Assigned tasks",
            text: "Check assignments that need action or monitoring.",
            href: "/tasks",
            linkLabel: "Open tasks",
          },
          {
            title: "Announcements",
            text: "Read active leadership notices and urgent updates.",
            href: "/announcements",
            linkLabel: "Open announcements",
          },
          {
            title: "Events",
            text: "Review regular services and visible leadership events.",
            href: "/events",
            linkLabel: "Open events",
          },
        ]
      : generalLeaderCards;

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <PageHeader
        eyebrow={`Welcome, ${displayName}`}
        title="What needs attention?"
        subtitle="A focused view of the reporting, follow-up, and leadership work that needs a calm next step."
        meta={
          <>
            <Badge className="bg-primary text-primary-foreground">
              {formatRole(primaryRole)}
            </Badge>
            {church ? <Badge variant="outline">{church.name}</Badge> : null}
            {isCompanyLeader && assignedCompany ? (
              <Badge variant="secondary">{assignedCompany.name}</Badge>
            ) : null}
          </>
        }
      />

      <Card className="relative rounded-lg border-primary/15 bg-[#F1ECE6] shadow-[0_18px_46px_rgba(36,17,38,0.1)]">
        <div className="absolute inset-y-4 left-0 w-1 rounded-r-full bg-primary/55" />
        <CardHeader className="gap-2 pb-2">
          <p className="text-xs font-semibold text-primary/75 uppercase">
            Primary attention
          </p>
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            {attention.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2 rounded-lg border border-primary/10 bg-[#FBFAF8]/75 p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              {attention.text}
            </p>
            {isCompanyLeader ? (
              <p className="text-sm font-medium text-foreground">
                {assignedCompany
                  ? `Assigned company: ${assignedCompany.name}`
                  : "No assigned company found."}
              </p>
            ) : null}
          </div>
          {attention.action && attention.href ? (
            <Button
              asChild
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
            >
              <Link href={attention.href}>
                {attention.action}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-3 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-3 sm:grid-cols-2 sm:p-4">
        {supportingCards.map((card) => (
          <Card
            key={card.title}
            className="rounded-lg border-border/80 bg-[#FBFAF8] shadow-[0_8px_22px_rgba(21,18,23,0.04)]"
            size="sm"
          >
            <CardHeader className="pb-1">
              <CardTitle className="text-base">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="text-sm leading-6 text-muted-foreground">
                {card.text}
              </p>
              {card.href ? (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="mt-3 h-9 px-0 text-primary hover:bg-transparent hover:text-primary/80"
                >
                  <Link href={card.href}>
                    {card.linkLabel}
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </AppShell>
  );
}
