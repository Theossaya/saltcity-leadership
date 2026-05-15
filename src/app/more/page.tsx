import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronRight,
  FileArchive,
  Megaphone,
  Settings,
  UsersRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/features/auth/get-current-user";

const futureSections = [
  { label: "Companies", href: "/companies", icon: Building2 },
  { label: "Announcements", href: "/announcements", icon: Megaphone },
  { label: "Events", href: "#", icon: CalendarDays },
  { label: "Documents", href: "#", icon: FileArchive },
  { label: "Units", href: "#", icon: UsersRound },
  { label: "Settings", href: "#", icon: Settings },
];

export default async function MorePage() {
  const { user, profile, primaryRole, church } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <PageHeader
        title="More"
        subtitle="Church leadership tools and app sections in one place."
      />

      <Card className="rounded-lg border-primary/15 bg-[#FBFAF8] shadow-[0_14px_36px_rgba(21,18,23,0.06)]">
        <CardHeader className="pb-1">
          <CardTitle className="text-base font-semibold">App sections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 rounded-lg border border-border/70 bg-[#EDE7DF]/55 p-2">
            {futureSections.map((section) => {
              const Icon = section.icon;
              const isFuture = section.href === "#";

              return (
                <Link
                  key={section.label}
                  href={section.href}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-lg border border-border/70 bg-white px-3 text-sm font-medium text-foreground shadow-xs transition-colors hover:bg-[#FBFAF8]"
                  aria-disabled={isFuture ? "true" : undefined}
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/80 bg-white text-primary">
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <span className="truncate">{section.label}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    {isFuture ? "Future" : "Open"}
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
