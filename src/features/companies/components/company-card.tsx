import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  AdminCompanyOverview,
  CompanyLeadership,
} from "@/features/companies/queries";
import { cn } from "@/lib/utils";

type CompanyCardProps = {
  company: CompanyLeadership | AdminCompanyOverview;
  memberCount?: number;
  emphasis?: boolean;
};

function StatusBadge({ status }: { status: CompanyLeadership["status"] }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-border bg-[#FBFAF8] text-[0.68rem] font-semibold uppercase tracking-normal",
        status === "active"
          ? "border-[#D9CEC4] text-[#241126]"
          : "border-border text-muted-foreground",
      )}
    >
      {status}
    </Badge>
  );
}

export function CompanyCard({
  company,
  memberCount,
  emphasis = false,
}: CompanyCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border-border/80 bg-card shadow-[0_10px_28px_rgba(21,18,23,0.045)]",
        emphasis ? "border-primary/25 shadow-[0_14px_36px_rgba(36,17,38,0.08)]" : null,
      )}
    >
      <CardHeader className="gap-2 pb-1">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            {company.name}
          </CardTitle>
          <StatusBadge status={company.status} />
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-3 rounded-lg border border-border/80 bg-[#FBFAF8] p-3 text-sm sm:grid-cols-2">
          <div className="grid gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Leader
            </p>
            <p className="font-medium text-foreground">
              {company.leaderName || "No leader assigned"}
            </p>
          </div>
          <div className="grid gap-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Assistant leader
            </p>
            <p className="font-medium text-foreground">
              {company.assistantLeaderName || "No assistant assigned"}
            </p>
          </div>
        </div>

        {typeof memberCount === "number" ? (
          <div className="rounded-lg border border-primary/15 bg-white px-3 py-3 shadow-xs">
            <p className="text-xs font-semibold text-muted-foreground uppercase">
              Members
            </p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {memberCount}
            </p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { StatusBadge };
