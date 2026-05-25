import { redirect } from "next/navigation";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  FileArchive,
  LogOut,
  Megaphone,
  Palette,
  Settings,
  Shield,
  UsersRound,
} from "lucide-react";

import { AppShell } from "@/components/layout/app-shell";
import { V2Greeting } from "@/components/v2/chrome/v2-greeting";
import { V2Sect } from "@/components/v2/chrome/v2-sect";
import { Button as V2Button } from "@/components/v2/primitives/button";
import { IndexRow } from "@/components/v2/rows/index-row";
import { logout } from "@/features/auth/actions";
import { getCurrentUser } from "@/features/auth/get-current-user";

const availableSections = [
  {
    title: "Announcements",
    description: "Official notices from the church office.",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Events",
    description: "Services and leadership calendar.",
    href: "/events",
    icon: CalendarDays,
  },
  {
    title: "Companies",
    description: "Member and leadership directory.",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "Care",
    description: "Assigned follow-up and recently closed care.",
    href: "/follow-up",
    icon: Shield,
  },
  {
    title: "Reports",
    description: "Weekly company report workspace.",
    href: "/reports",
    icon: BookOpen,
  },
];

const comingSoonSections = [
  {
    title: "Documents",
    description: "Leadership resources and internal files.",
    icon: FileArchive,
  },
  {
    title: "Units",
    description: "Unit-level planning will come after the MVP core.",
    icon: UsersRound,
  },
];

const settingsSections = [
  {
    title: "Notifications",
    description: "Leadership alerts and reminders.",
    icon: Bell,
  },
  {
    title: "Display & language",
    description: "Theme and language preferences.",
    icon: Palette,
  },
  {
    title: "Account & access",
    description: "Your role, church access, and session.",
    icon: Settings,
  },
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
      <V2Greeting
        eyebrow="Index"
        title={
          <>
            Everything <em>else.</em>
          </>
        }
        subtitle="The supporting leadership tools are grouped here so the main tabs can stay focused."
      />

      <V2Sect>Available</V2Sect>
      <section className="rounded-card bg-surface px-5 py-1 shadow-lift">
        {availableSections.map((section, index) => {
          const Icon = section.icon;

          return (
            <IndexRow
              key={section.href}
              index={String(index + 1).padStart(2, "0")}
              title={section.title}
              description={section.description}
              href={section.href}
              label="Open"
              tone="care"
              icon={<Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />}
            />
          );
        })}
      </section>

      <V2Sect action="Not yet available">Coming soon</V2Sect>
      <section className="rounded-card bg-surface-2 px-5 py-1 shadow-lift">
        {comingSoonSections.map((section, index) => {
          const Icon = section.icon;

          return (
            <IndexRow
              key={section.title}
              index={String(index + 1).padStart(2, "0")}
              title={section.title}
              description={section.description}
              label="Soon"
              tone="quiet"
              disabled
              icon={<Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />}
            />
          );
        })}
      </section>

      <V2Sect>Settings</V2Sect>
      <section className="rounded-card bg-surface px-5 py-1 shadow-lift">
        {settingsSections.map((section, index) => {
          const Icon = section.icon;

          return (
            <IndexRow
              key={section.title}
              index={String(index + 1).padStart(2, "0")}
              title={section.title}
              description={section.description}
              label="Soon"
              tone="quiet"
              disabled
              icon={<Icon className="size-4" strokeWidth={1.75} aria-hidden="true" />}
            />
          );
        })}
      </section>

      <V2Sect>Session</V2Sect>
      <section className="rounded-card bg-surface p-[18px] shadow-lift">
        <form action={logout}>
          <V2Button type="submit" variant="soft" className="w-full">
            <LogOut className="size-4" strokeWidth={1.75} aria-hidden="true" />
            Sign out
          </V2Button>
        </form>
      </section>

      <footer className="py-8 text-center font-serif text-[13.5px] italic leading-[1.45] text-ink-3">
        SaltCity leadership, ordered with care.
      </footer>
    </AppShell>
  );
}
