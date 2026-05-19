import { redirect } from "next/navigation";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { createCompanyMember } from "@/features/companies/actions";
import { CompanyCard } from "@/features/companies/components/company-card";
import { CompanyEmptyState } from "@/features/companies/components/company-empty-state";
import { MemberList } from "@/features/companies/components/member-list";
import {
  getActiveCompaniesForMemberCreate,
  getAdminCompaniesOverview,
  getAssignedCompanyDetails,
  getCompanyMembers,
  type ActiveCompanyOption,
} from "@/features/companies/queries";

type CompaniesPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
    error?: string | string[];
  }>;
};

function CreateCompanyMemberForm({
  companies,
}: {
  companies: ActiveCompanyOption[];
}) {
  const hasCompanies = companies.length > 0;

  return (
    <Card className="rounded-lg border-border/80 bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Add company member
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={createCompanyMember} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="company-member-company">Company</Label>
            <select
              id="company-member-company"
              name="companyId"
              required
              disabled={!hasCompanies}
              className="h-12 w-full rounded-lg border border-input bg-background px-3 text-base text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60 md:text-sm"
            >
              {hasCompanies ? null : (
                <option value="">No active companies available</option>
              )}
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="company-member-full-name">Full name</Label>
            <Input
              id="company-member-full-name"
              name="fullName"
              maxLength={160}
              required
              className="h-12 bg-background"
              placeholder="Member name"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="company-member-phone">Phone</Label>
              <Input
                id="company-member-phone"
                name="phone"
                maxLength={40}
                className="h-12 bg-background"
                placeholder="Optional"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="company-member-email">Email</Label>
              <Input
                id="company-member-email"
                name="email"
                type="email"
                maxLength={254}
                className="h-12 bg-background"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="border-t border-border/80 pt-1">
            <Button
              type="submit"
              disabled={!hasCompanies}
              className="h-12 w-full bg-primary text-primary-foreground sm:w-fit sm:px-5"
            >
              Add member
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const resolvedSearchParams = await searchParams;
  const createdParam = resolvedSearchParams?.created;
  const errorParam = resolvedSearchParams?.error;
  const memberCreated =
    (Array.isArray(createdParam) ? createdParam[0] : createdParam) === "member";
  const createMemberError =
    (Array.isArray(errorParam) ? errorParam[0] : errorParam) ===
    "unable-to-create-member";
  const { user, profile, primaryRole, churchId, church } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";
  const actionNotice = (
    <>
      {memberCreated ? (
        <Alert className="border-[#C8BDAF] bg-[#FBFAF8]">
          <AlertDescription>Company member added.</AlertDescription>
        </Alert>
      ) : null}

      {createMemberError ? (
        <Alert variant="destructive">
          <AlertDescription>
            Company member could not be added.
          </AlertDescription>
        </Alert>
      ) : null}
    </>
  );

  let content = (
    <CompanyEmptyState title="Company visibility is limited">
      <p>
        Company structure will appear here when your leadership role is assigned
        to a company.
      </p>
    </CompanyEmptyState>
  );

  if (!churchId) {
    content = (
      <CompanyEmptyState title="No active church membership found">
        <p>
          Company visibility depends on an active church membership. Ask an
          admin to confirm your access.
        </p>
      </CompanyEmptyState>
    );
  } else if (isAdmin) {
    const [companiesResult, createOptionsResult] = await Promise.all([
      getAdminCompaniesOverview(churchId),
      getActiveCompaniesForMemberCreate(churchId),
    ]);

    content = (
      <>
        {companiesResult.error ? (
          <QueryNotice message={companiesResult.error} />
        ) : null}
        {createOptionsResult.error ? (
          <QueryNotice message={createOptionsResult.error} />
        ) : null}

        <CreateCompanyMemberForm companies={createOptionsResult.data} />

        {companiesResult.data.length > 0 ? (
          <section className="grid gap-3">
            {companiesResult.data.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                memberCount={company.memberCount}
              />
            ))}
          </section>
        ) : (
          <CompanyEmptyState title="No companies found">
            <p>
              Company structure will appear here after companies are added for
              this church.
            </p>
          </CompanyEmptyState>
        )}
      </>
    );
  } else if (isCompanyLeader) {
    const companyResult = await getAssignedCompanyDetails(user.id, churchId);
    const membersResult = companyResult.data
      ? await getCompanyMembers(companyResult.data.id, churchId)
      : { data: [], error: null };

    content = companyResult.error && !companyResult.data ? (
      <QueryNotice message={companyResult.error} />
    ) : companyResult.data ? (
      <>
        {companyResult.error ? <QueryNotice message={companyResult.error} /> : null}
        {membersResult.error ? <QueryNotice message={membersResult.error} /> : null}

        <CompanyCard company={companyResult.data} emphasis />

        <section className="grid gap-3">
          <div className="grid gap-1">
            <h2 className="text-xl font-semibold text-foreground">Members</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Read-only member visibility for weekly reporting.
            </p>
          </div>

          {membersResult.data.length > 0 ? (
            <MemberList members={membersResult.data} />
          ) : (
            <CompanyEmptyState title="No members found">
              <p>
                Company members will appear here when they are added by an
                admin.
              </p>
            </CompanyEmptyState>
          )}
        </section>
      </>
    ) : (
      <CompanyEmptyState title="No assigned company found">
        <p>
          Your company view will appear when an admin assigns you as a company
          leader or assistant leader.
        </p>
      </CompanyEmptyState>
    );
  }

  return (
    <AppShell
      displayName={displayName}
      role={primaryRole}
      churchName={church?.name}
    >
      <PageHeader
        title={isCompanyLeader ? "My Company" : "Companies"}
        subtitle={
          isCompanyLeader
            ? "Assigned company structure and member visibility for reporting."
            : "Company structure, leadership assignments, and member counts."
        }
      />

      {actionNotice}

      {content}
    </AppShell>
  );
}
