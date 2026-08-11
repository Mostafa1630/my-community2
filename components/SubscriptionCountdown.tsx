import type { Dictionary } from "@/lib/i18n/getDictionary";
import { t } from "@/lib/i18n/t";
import { getSubscriptionZone } from "@/lib/subscriptionStatus";

const ZONE_CLASSES = {
  green: { bar: "bg-success", text: "text-success", track: "bg-success/15" },
  yellow: { bar: "bg-accent-500", text: "text-accent-700", track: "bg-accent-500/15" },
  red: { bar: "bg-danger", text: "text-danger", track: "bg-danger/15" }
} as const;

// A subscription's total window split into thirds — green while more than
// two thirds of it remain, yellow through the middle third, red for the
// final third or once it's actually expired — used on "my communities"
// cards so a student sees at a glance how urgent renewing is, without
// needing to read the exact date.
export default function SubscriptionCountdown({
  startAt,
  endAt,
  dict
}: {
  startAt: string;
  endAt: string;
  dict: Dictionary;
}) {
  const { zone, daysRemaining, percentRemaining, expired } = getSubscriptionZone(startAt, endAt);
  const classes = ZONE_CLASSES[zone];

  return (
    <div>
      <div className={`h-1.5 w-full overflow-hidden rounded-full ${classes.track}`}>
        <div
          className={`h-full rounded-full transition-all ${classes.bar}`}
          style={{ width: `${percentRemaining * 100}%` }}
        />
      </div>
      <p className={`mt-1.5 text-[11px] font-semibold ${classes.text}`}>
        {expired ? dict.communityDetails.subscriptionExpired : t(dict.student.daysRemaining, { days: daysRemaining })}
      </p>
    </div>
  );
}
