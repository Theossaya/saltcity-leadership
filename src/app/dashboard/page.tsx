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
    text: "Company structure and leadership visibility are now available.",
    href: "/companies",
    linkLabel: "Open companies",
  },
  {
    title: "Pending reports",
    text: "Submitted and missing report status will appear here.",
  },
  {
    title: "Follow-up queue",
    text: "Open absentee and pastoral follow-up cases will appear here.",
  },
];

const generalLeaderCards: SupportingCard[] = [
  {
    title: "Announcements",
    text: "Leadership announcements will appear here.",
  },
  {
    title: "Assigned tasks",
    text: "Personal responsibilities and task status will appear here.",
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
        text: "Review reports, follow-up cases, and assignments from one place.",
        action: "Review dashboard",
      }
    : isCompanyLeader
      ? {
          title: "This week's company report",
          text: "Prepare attendance, absentees, and follow-up notes for your company.",
          action: "Open report",
        }
      : {
          title: "Leadership updates",
          text: "Announcements, tasks, and event responsibilities will appear here.",
          action: null,
        };

  const supportingCards = isAdmin
    ? adminCards
    : isCompanyLeader
      ? [
          {
            title: "My company",
            text: assignedCompany
              ? `${assignedCompany.name} is ready in your company view.`
              : "Your assigned company will appear after admin assignment.",
            href: "/companies",
            linkLabel: "Open my company",
          },
          {
            title: "Report status",
            text: "Draft, submitted, and reviewed states will appear here.",
          },
          {
            title: "Follow-up attention",
            text: "Absentees needing care will appear here after reports are added.",
          },
        ]
      : generalLeaderCards;

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <section className="grid gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Welcome, {displayName}
        </p>
        <div className="grid gap-2">
          <h1 className="text-3xl font-semibold text-foreground">
            What needs attention?
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-primary-foreground">
              {formatRole(primaryRole)}
            </Badge>
            {church ? <Badge variant="outline">{church.name}</Badge> : null}
            {isCompanyLeader && assignedCompany ? (
              <Badge variant="secondary">{assignedCompany.name}</Badge>
            ) : null}
          </div>
        </div>
      </section>

      <Card className="rounded-lg border-border/80 bg-card shadow-sm">
        <CardHeader className="gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Primary attention
          </p>
          <CardTitle className="text-2xl font-semibold">
            {attention.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
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
          {attention.action ? (
            <Button
              type="button"
              disabled
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
            >
              {attention.action}
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <section className="grid gap-3">
        {supportingCards.map((card) => (
          <Card
            key={card.title}
            className="rounded-lg border-border/80 bg-card shadow-sm"
            size="sm"
          >
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent>
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
