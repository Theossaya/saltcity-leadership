import { V2Head } from "@/components/v2/chrome/v2-head";
import type { LeadershipRole } from "@/features/auth/get-current-user";

type AppHeaderProps = {
  displayName: string;
  role: LeadershipRole | null;
  churchName?: string | null;
};

export function AppHeader({ displayName, role, churchName }: AppHeaderProps) {
  return <V2Head displayName={displayName} role={role} churchName={churchName} />;
}
