import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/features/auth/get-current-user";

const futureSections = [
  { label: "Companies", href: "/companies" },
  { label: "Announcements", href: "#" },
  { label: "Events", href: "#" },
  { label: "Documents", href: "#" },
  { label: "Units", href: "#" },
  { label: "Settings", href: "#" },
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
      <Card className="rounded-lg border-border/80 bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">More</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border/80">
            {futureSections.map((section) => (
              <Link
                key={section.label}
                href={section.href}
                className="flex min-h-12 items-center justify-between px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                aria-disabled={section.href === "#" ? "true" : undefined}
              >
                {section.label}
                <span className="text-xs text-muted-foreground">Future</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
