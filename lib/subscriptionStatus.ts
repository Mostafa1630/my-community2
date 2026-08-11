export type SubscriptionZone = "green" | "yellow" | "red";

const DAY_MS = 24 * 60 * 60 * 1000;

// Splits a subscription's total window into three equal thirds and reports
// which one "now" falls into — green (first third, plenty of time left),
// yellow (middle third), red (final third or already expired). Used to give
// students an at-a-glance urgency signal on their subscribed community/course
// cards, matching the same red = "about to run out" convention as the rest
// of the app's status badges.
export function getSubscriptionZone(
  startAt: string,
  endAt: string
): { zone: SubscriptionZone; daysRemaining: number; percentRemaining: number; expired: boolean } {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const total = Math.max(end - start, 1);
  const remaining = end - now;
  const percentRemaining = Math.max(0, Math.min(1, remaining / total));
  const daysRemaining = Math.max(0, Math.ceil(remaining / DAY_MS));
  const expired = remaining <= 0;
  const zone: SubscriptionZone = expired
    ? "red"
    : percentRemaining > 2 / 3
      ? "green"
      : percentRemaining > 1 / 3
        ? "yellow"
        : "red";
  return { zone, daysRemaining, percentRemaining, expired };
}
