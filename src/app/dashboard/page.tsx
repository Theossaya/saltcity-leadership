import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/get-current-user";

function formatRole(role: string | null) {
  if (!role) {
    return "No active role";
  }

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <section className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">Signed in as</p>
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {displayName}
            </h1>
          </div>
          <form action={logout}>
            <Button type="submit" variant="outline">
              Log out
            </Button>
          </form>
        </section>

        <Card className="rounded-lg">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Authentication, session persistence, and role detection proof.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{formatRole(primaryRole)}</Badge>
              {church ? <Badge variant="outline">{church.name}</Badge> : null}
            </div>

            {isAdmin ? (
              <p className="text-sm">Admin dashboard placeholder</p>
            ) : null}

            {isCompanyLeader ? (
              <div className="grid gap-1 text-sm">
                {assignedCompany ? (
                  <p className="font-medium">{assignedCompany.name}</p>
                ) : (
                  <p className="text-muted-foreground">
                    No assigned company found.
                  </p>
                )}
                <p>Company leader dashboard placeholder</p>
              </div>
            ) : null}

            {!isAdmin && !isCompanyLeader ? (
              <p className="text-sm">Leader dashboard placeholder</p>
            ) : null}
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              Product modules will be added after the auth proof is verified.
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
