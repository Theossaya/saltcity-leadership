import { Pill } from "@/components/v2/primitives/pill";

type CompanyHeroProps = {
  name: string;
  descriptor: string;
  status: "active" | "inactive";
  members?: number;
  leader?: string | null;
  assistant?: string | null;
};

export function CompanyHero({
  name,
  descriptor,
  status,
  members,
  leader,
  assistant,
}: CompanyHeroProps) {
  return (
    <section className="rounded-card bg-primary p-[18px] text-primary-ink shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] font-bold uppercase leading-none tracking-[0.16em] text-primary-soft">
            Company directory
          </p>
          <h2 className="mt-2 break-words font-serif text-[24px] font-medium leading-[1.08] tracking-[-0.015em] text-primary-ink text-pretty">
            {name}
          </h2>
        </div>
        <Pill tone={status === "active" ? "ok" : "quiet"}>{status}</Pill>
      </div>
      <p className="mt-3 font-serif text-[14px] italic leading-[1.45] text-primary-soft text-pretty">
        {descriptor}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 rounded-card bg-bg/10 p-3">
        <div className="min-w-0">
          <div className="font-serif text-[28px] font-medium leading-none tracking-[-0.015em] text-primary-ink">
            {typeof members === "number" ? members : "Read"}
          </div>
          <div className="mt-1 font-sans text-[11.5px] font-medium leading-snug text-primary-soft">
            Active members
          </div>
        </div>
        <div className="min-w-0">
          <div className="font-serif text-[28px] font-medium leading-none tracking-[-0.015em] text-primary-ink">
            {leader ? "Set" : "Open"}
          </div>
          <div className="mt-1 font-sans text-[11.5px] font-medium leading-snug text-primary-soft">
            Leader
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-2 font-sans text-xs leading-[1.45] text-primary-soft">
        <p>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em]">
            Leader
          </span>{" "}
          {leader || "No leader assigned"}
        </p>
        <p>
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em]">
            Assistant
          </span>{" "}
          {assistant || "No assistant assigned"}
        </p>
      </div>
    </section>
  );
}
