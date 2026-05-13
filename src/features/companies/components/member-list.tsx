import { Badge } from "@/components/ui/badge";
import type { CompanyMember } from "@/features/companies/queries";
import { cn } from "@/lib/utils";

type MemberListProps = {
  members: CompanyMember[];
};

function formatJoinedDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function MemberList({ members }: MemberListProps) {
  return (
    <div className="grid gap-3">
      {members.map((member) => (
        <article
          key={member.id}
          className="rounded-lg border border-border/80 bg-[#FBFAF8] p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">
                {member.fullName}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Added {formatJoinedDate(member.createdAt)}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "border-border bg-white text-[0.68rem] font-semibold uppercase tracking-normal",
                member.status === "active"
                  ? "text-[#241126]"
                  : "text-muted-foreground",
              )}
            >
              {member.status}
            </Badge>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <p>{member.phone || "No phone on record"}</p>
            <p>{member.email || "No email on record"}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
