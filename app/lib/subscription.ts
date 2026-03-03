import { prisma } from "@/lib/prisma";

// ── Plan Limits ──────────────────────────────────────────────────────────────
export const PLAN_LIMITS: Record<string, { maxBarbershops: number; maxTeamMembers: number }> = {
  free:       { maxBarbershops: 1,        maxTeamMembers: 2 },
  pro:        { maxBarbershops: 3,        maxTeamMembers: 10 },
  enterprise: { maxBarbershops: Infinity, maxTeamMembers: Infinity },
};

// ── Types ────────────────────────────────────────────────────────────────────
export type UserSubscription = {
  id: string;
  subscriptionPlan: string;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
};

export type SubscriptionStatus = "active" | "expired" | "free";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Check whether a user's paid subscription is still active. */
export function isSubscriptionActive(user: UserSubscription): boolean {
  if (user.subscriptionPlan === "free") return true;
  if (!user.subscriptionEndDate) return true; // no end date = perpetual
  return new Date() < user.subscriptionEndDate;
}

/** Return a simple status string for display. */
export function getSubscriptionStatus(user: UserSubscription): SubscriptionStatus {
  if (user.subscriptionPlan === "free") return "free";
  return isSubscriptionActive(user) ? "active" : "expired";
}

/** Days remaining on a paid plan. Returns null for free plans. */
export function getRemainingDays(user: UserSubscription): number | null {
  if (user.subscriptionPlan === "free" || !user.subscriptionEndDate) return null;
  const diff = user.subscriptionEndDate.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Compute start/end dates for a given plan. Free → null dates. */
export function computeSubscriptionDates(plan: string): { subscriptionStartDate: Date | null; subscriptionEndDate: Date | null } {
  if (plan === "free") {
    return { subscriptionStartDate: null, subscriptionEndDate: null };
  }
  const start = new Date();
  const end = new Date();
  end.setMonth(end.getMonth() + 1); // 1‑month subscription
  return { subscriptionStartDate: start, subscriptionEndDate: end };
}

// ── Lazy expiration check (auto‑downgrade) ───────────────────────────────────

/**
 * If a user's paid plan has expired, downgrade them to `free` in the DB
 * and return the updated record. Otherwise return the user as-is.
 */
export async function checkAndDowngradeIfExpired<T extends UserSubscription>(user: T): Promise<T> {
  if (user.subscriptionPlan === "free") return user;
  if (!user.subscriptionEndDate) return user;
  if (new Date() < user.subscriptionEndDate) return user;

  // Expired → downgrade
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionPlan: "free",
      subscriptionStartDate: null,
      subscriptionEndDate: null,
    },
  });

  return { ...user, ...updated } as T;
}

// ── Limit checks ─────────────────────────────────────────────────────────────

/**
 * Checks whether an owner can create another barbershop based on their
 * subscription plan.
 *
 * Returns `{ allowed: true }` or `{ allowed: false, message, limit, current }`.
 */
export async function checkBarbershopLimit(ownerId: string) {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { subscriptionPlan: true, subscriptionEndDate: true },
  });

  if (!owner) {
    return { allowed: false as const, message: "Owner not found" };
  }

  // If plan expired, treat as free
  const isActive = owner.subscriptionPlan === "free"
    || (owner.subscriptionEndDate && new Date() < owner.subscriptionEndDate);
  const effectivePlan = isActive ? owner.subscriptionPlan : "free";

  const limit = PLAN_LIMITS[effectivePlan]?.maxBarbershops ?? 1;

  const current = await prisma.barbershop.count({
    where: { ownerId, deletedAt: null },
  });

  if (current >= limit) {
    return { allowed: false as const, message: `Your ${effectivePlan} plan allows a maximum of ${limit} barbershop(s). You currently have ${current}.`, limit, current };
  }

  return { allowed: true as const, limit, current };
}

/**
 * Checks whether a barbershop can accept another team member based on
 * the owner's subscription plan.
 */
export async function checkTeamLimit(barbershopId: string) {
  const barbershop = await prisma.barbershop.findUnique({
    where: { id: barbershopId },
    select: { ownerId: true },
  });

  if (!barbershop) {
    return { allowed: false as const, message: "Barbershop not found" };
  }

  const owner = await prisma.user.findUnique({
    where: { id: barbershop.ownerId },
    select: { subscriptionPlan: true, subscriptionEndDate: true },
  });

  if (!owner) {
    return { allowed: false as const, message: "Owner not found" };
  }

  // If plan expired, treat as free
  const isActive = owner.subscriptionPlan === "free"
    || (owner.subscriptionEndDate && new Date() < owner.subscriptionEndDate);
  const effectivePlan = isActive ? owner.subscriptionPlan : "free";

  const limit = PLAN_LIMITS[effectivePlan]?.maxTeamMembers ?? 2;

  const currentCount = await prisma.team.count({
    where: { barbershopId },
  });

  if (currentCount >= limit) {
    return { allowed: false as const, message: `Your ${effectivePlan} plan allows a maximum of ${limit} team member(s). You currently have ${currentCount}.`, limit, current: currentCount };
  }

  return { allowed: true as const, limit, current: currentCount };
}
