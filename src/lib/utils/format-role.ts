export function formatRole(role: string | null | undefined) {
  if (!role) {
    return "No active role";
  }

  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
