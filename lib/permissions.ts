export type Role = "owner" | "admin" | "co-owner" | "capster" | "customer";

const PERMISSIONS: Record<string, Role[] | null> = {
  dashboard: ["owner", "admin", "co-owner", "capster"],
  barbershop: ["owner", "co-owner"],
  teams: ["owner", "admin", "co-owner"],
  calendar: ["owner", "capster", "admin", "co-owner"],
  services: ["owner", "co-owner"],
  book: ["owner", "co-owner", "admin", "capster"],
  // null = any authenticated user
  settings: null,
  help: null,
};

export function canAccess(key: string, role?: string | null): boolean {
  const allowed = PERMISSIONS[key];
  if (allowed === undefined) return false; // unknown key => deny
  if (allowed === null) return !!role; // any authenticated user
  return !!role && allowed.includes(role as Role);
}

export { PERMISSIONS };
