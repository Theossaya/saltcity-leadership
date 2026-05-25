import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { QueryNotice } from "@/components/ui/query-notice";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { CompanyHero } from "@/components/v2/modules/company-hero";
import { Button as V2Button } from "@/components/v2/primitives/button";
import {
  Field,
  Select,
  TextInput,
} from "@/components/v2/primitives/field";
import { Pill } from "@/components/v2/primitives/pill";
import { MemberRow } from "@/components/v2/rows/member-row";
import { PersonRow } from "@/components/v2/rows/person-row";
import { getCurrentUser } from "@/features/auth/get-current-user";
import { createCompanyMember } from "@/features/companies/actions";
import {
  getActiveCompaniesForMemberCreate,
  getAdminCompaniesOverview,
  getAssignedCompanyDetails,
  getCompanyMembers,
  type ActiveCompanyOption,
  type AdminCompanyOverview,
  type CompanyLeadership,
  type CompanyMember,
} from "@/features/companies/queries";

type CompaniesPageProps = {
  searchParams?: Promise<{
    created?: string | string[];
    error?: string | string[];
  }>;
};

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Lagos",
  }).format(new Date(value));
}

function EmptyDirectory({ title, message }: { title: string; message: string }) {
  return (
    <section className="rounded-card bg-surface p-[18px] text-center shadow-lift">
      <h2 className="font-serif text-[18px] font-medium leading-tight text-ink text-pretty">
        {title}
      </h2>
      <p className="mt-2 font-sans text-sm leading-6 text-ink-2">{message}</p>
    </section>
  );
}

function CreateCompanyMemberForm({
  companies,
}: {
  companies: ActiveCompanyOption[];
}) {
  const hasCompanies = companies.length > 0;

  return (
    <>
      <V2Sect>Church office</V2Sect>
      <details className="rounded-card bg-surface p-[18px] shadow-lift">
        <summary className="cursor-pointer list-none font-serif text-[18px] font-medium leading-tight text-ink marker:hidden">
          Add company member
        </summary>
        <form action={createCompanyMember} className="mt-4 grid gap-4">
          <Field htmlFor="company-member-company" label="Company">
            <Select
              id="company-member-company"
              name="companyId"
              required
              disabled={!hasCompanies}
            >
              {hasCompanies ? null : (
                <option value="">No active companies available</option>
              )}
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field htmlFor="company-member-full-name" label="Full name">
            <TextInput
              id="company-member-full-name"
              name="fullName"
              maxLength={160}
              required
              placeholder="Member name"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field htmlFor="company-member-phone" label="Phone">
              <TextInput
                id="company-member-phone"
                name="phone"
                maxLength={40}
                placeholder="Optional"
              />
            </Field>

            <Field htmlFor="company-member-email" label="Email">
              <TextInput
                id="company-member-email"
                name="email"
                type="email"
                maxLength={254}
                placeholder="Optional"
              />
            </Field>
          </div>

          <V2Button type="submit" disabled={!hasCompanies} className="w-full sm:w-fit">
            Add member
          </V2Button>
        </form>
      </details>
    </>
  );
}

function LeadershipSection({ company }: { company: CompanyLeadership }) {
  return (
    <>
      <V2Sect>Leadership</V2Sect>
      <section className="rounded-card bg-surface p-[18px] shadow-lift">
        <PersonRow
          name={company.leaderName || "No leader assigned"}
          sub="Company leader"
          pill={company.leaderName ? "Read-only" : "Open"}
          tone={company.leaderName ? "quiet" : "care"}
        />
        <PersonRow
          name={company.assistantLeaderName || "No assistant assigned"}
          sub="Assistant leader"
          pill={company.assistantLeaderName ? "Read-only" : "Open"}
          tone={company.assistantLeaderName ? "quiet" : "care"}
        />
      </section>
    </>
  );
}

function MemberRows({ members }: { members: CompanyMember[] }) {
  if (members.length === 0) {
    return (
      <EmptyDirectory
        title="The member list is empty."
        message="Company members will appear here after an admin adds them."
      />
    );
  }

  return (
    <section className="rounded-card bg-surface p-[18px] shadow-lift">
      {members.map((member) => {
        const contact = [member.phone, member.email].filter(Boolean).join(" · ");

        return (
          <MemberRow
            key={member.id}
            name={member.fullName}
            status={member.status}
            meta={`Added ${formatJoinedDate(member.createdAt)}`}
            detail={contact || "No contact details on record"}
          />
        );
      })}
    </section>
  );
}

function AdminCompanyModule({ company }: { company: AdminCompanyOverview }) {
  return (
    <article className="grid gap-3">
      <CompanyHero
        name={company.name}
        descriptor="Leadership assignment and active member count for reporting."
        status={company.status}
        members={company.memberCount}
        leader={company.leaderName}
        assistant={company.assistantLeaderName}
      />
      <section className="rounded-card bg-surface p-[18px] shadow-lift">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-serif text-[18px] font-medium leading-tight text-ink">
              Directory snapshot
            </h2>
            <p className="mt-1 font-sans text-xs leading-[1.45] text-ink-3">
              {company.leaderName || "No leader assigned"} ·{" "}
              {company.assistantLeaderName || "No assistant assigned"}
            </p>
          </div>
          <Pill tone={company.status === "active" ? "ok" : "quiet"}>
            {company.memberCount} members
          </Pill>
        </div>
      </section>
    </article>
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

  let content = (
    <>
      <V2Sect>Directory access</V2Sect>
      <EmptyDirectory
        title="Company visibility is limited."
        message="Company structure will appear here when your leadership role is assigned to a company."
      />
    </>
  );

  if (!churchId) {
    content = (
      <>
        <V2Sect>Directory access</V2Sect>
        <EmptyDirectory
          title="Active church membership needed."
          message="Company visibility depends on an active church membership. Ask an admin to confirm your access."
        />
      </>
    );
  } else if (isAdmin) {
    const [companiesResult, createOptionsResult] = await Promise.all([
      getAdminCompaniesOverview(churchId),
      getActiveCompaniesForMemberCreate(churchId),
    ]);

    content = (
      <>
        {memberCreated ? (
          <QueryNotice tone="ok" message="Company member added to the directory." />
        ) : null}
        {createMemberError ? (
          <QueryNotice message="Company member could not be added. Check the name and company, then try again." />
        ) : null}
        {companiesResult.error ? (
          <QueryNotice message="We could not load the company directory. Try again shortly." />
        ) : null}
        {createOptionsResult.error ? (
          <QueryNotice message="The member form could not load active companies. Existing directory details remain visible." />
        ) : null}

        <CreateCompanyMemberForm companies={createOptionsResult.data} />

        <V2Sect action={`${companiesResult.data.length}`}>Companies</V2Sect>
        {companiesResult.data.length > 0 ? (
          <div className="grid gap-4">
            {companiesResult.data.map((company) => (
              <AdminCompanyModule key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <EmptyDirectory
            title="The company directory is empty."
            message="Companies will appear here after they are added for this church."
          />
        )}
      </>
    );
  } else if (isCompanyLeader) {
    const companyResult = await getAssignedCompanyDetails(user.id, churchId);
    const membersResult = companyResult.data
      ? await getCompanyMembers(companyResult.data.id, churchId)
      : { data: [], error: null };
    const activeMembers = membersResult.data.filter(
      (member) => member.status === "active",
    );

    content = companyResult.error && !companyResult.data ? (
      <QueryNotice message="We could not load your assigned company. Try again shortly." />
    ) : companyResult.data ? (
      <>
        {companyResult.error ? (
          <QueryNotice message="Some company details could not be refreshed. The available directory is shown below." />
        ) : null}
        {membersResult.error ? (
          <QueryNotice message="We could not load the latest member list. Try again shortly." />
        ) : null}

        <section className="mt-[18px]">
          <CompanyHero
            name={companyResult.data.name}
            descriptor="Read-only company visibility for weekly reporting."
            status={companyResult.data.status}
            members={activeMembers.length}
            leader={companyResult.data.leaderName}
            assistant={companyResult.data.assistantLeaderName}
          />
        </section>

        <LeadershipSection company={companyResult.data} />

        <V2Sect action={`${activeMembers.length} active`}>Members</V2Sect>
        <MemberRows members={membersResult.data} />
      </>
    ) : (
      <>
        <V2Sect>Directory access</V2Sect>
        <EmptyDirectory
          title="Your company assignment is not active yet."
          message="Your company view will appear when an admin assigns you as a company leader or assistant leader."
        />
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
        eyebrow="Company directory"
        title={
          isCompanyLeader ? (
            <>
              Your <em>company.</em>
            </>
          ) : (
            <>
              Companies & <em>leaders.</em>
            </>
          )
        }
        subtitle={
          isCompanyLeader
            ? "A read-only directory for the people connected to your weekly report."
            : "A member and leadership directory for company-based reporting."
        }
      />

      {content}
    </AppShell>
  );
}
