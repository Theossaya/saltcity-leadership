import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/ui/page-header";
import { QueryNotice } from "@/components/ui/query-notice";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { CompanyCard } from "@/features/companies/components/company-card";
import { CompanyEmptyState } from "@/features/companies/components/company-empty-state";
import { MemberList } from "@/features/companies/components/member-list";
import {
  getAdminCompaniesOverview,
  getAssignedCompanyDetails,
  getCompanyMembers,
} from "@/features/companies/queries";

export default async function CompaniesPage() {
  const { user, profile, primaryRole, churchId, church } = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const displayName = profile?.full_name || user.email || "Signed-in leader";
  const isAdmin =
    primaryRole === "church_admin" || primaryRole === "super_admin";
  const isCompanyLeader =
    primaryRole === "company_leader" || primaryRole === "assistant_leader";

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
    const companiesResult = await getAdminCompaniesOverview(churchId);

    content = (
      <>
        {companiesResult.error ? (
          <QueryNotice message={companiesResult.error} />
        ) : null}

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

      {content}
    </AppShell>
  );
}
