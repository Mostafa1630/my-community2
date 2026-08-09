import { z } from "zod";

// Mirrors each spec's own "Required" column where one is documented, plus
// the domain-obvious type/range constraints (percentages 0-100,
// durations/positions positive integers, URLs must look like URLs) that
// would otherwise trigger a real 422 from the backend. A few fields are
// optional on the wire but required here anyway as a product-level UX
// safeguard (an empty course/lesson title being submitted would be a bug,
// not a valid "leave unchanged" — that gap is category, handled by an
// explicit placeholder instead) — noted at each call site, not invented
// silently.

// description is documented optional ("No") on both create and update, but
// live-testing (round 13) confirmed POST /creators/communities (create)
// actually 422s without it — "The description field is required."
// Confirmed separately that POST /creators/communities/{id} (update)
// genuinely doesn't need it (omitting it on update leaves the existing
// description untouched, verified live) — but by the time this form is ever
// in "update" mode, description is already prefilled with the real current
// value from getMyCommunity() (round 12), so requiring it unconditionally
// here costs nothing on edit and protects create.
export function communityFormSchema(messages: { required: string; positive: string; percentRange: string }) {
  return z
    .object({
      name: z.string().min(1, messages.required),
      description: z.string().min(1, messages.required),
      categoryId: z.string().min(1, messages.required),
      type: z.enum(["public", "private"]),
      isFree: z.boolean(),
      subscriptionPrice: z.number(),
      discountPercentage: z.number().min(0, messages.percentRange).max(100, messages.percentRange),
      subscriptionDurationDays: z.number().int(messages.positive).positive(messages.positive).optional()
    })
    .refine((data) => data.isFree || data.subscriptionPrice > 0, {
      message: messages.positive,
      path: ["subscriptionPrice"]
    });
}

export type CommunityFormInput = z.infer<ReturnType<typeof communityFormSchema>>;

export function courseFormSchema(messages: {
  required: string;
  positive: string;
  percentRange: string;
  invalidUrl: string;
}) {
  return z
    .object({
      title: z.string().min(1, messages.required),
      isFree: z.boolean(),
      price: z.number(),
      discountPercentage: z.number().min(0, messages.percentRange).max(100, messages.percentRange),
      introVideoUrl: z.union([z.string().url(messages.invalidUrl), z.literal("")])
    })
    .refine((data) => data.isFree || data.price > 0, {
      message: messages.positive,
      path: ["price"]
    });
}

export type CourseFormInput = z.infer<ReturnType<typeof courseFormSchema>>;

// Create-only variant: category_id is genuinely required by POST
// /creators/courses (the table marks it "Yes"), unlike update where it's
// optional and left out of courseFormSchema entirely because there's no way
// to know a course's current category to safely default it. On create
// there's no "current value" to protect — the creator is picking one fresh.
export function courseCreateFormSchema(messages: {
  required: string;
  positive: string;
  percentRange: string;
  invalidUrl: string;
}) {
  return z
    .object({
      title: z.string().min(1, messages.required),
      categoryId: z.string().min(1, messages.required),
      isFree: z.boolean(),
      price: z.number(),
      discountPercentage: z.number().min(0, messages.percentRange).max(100, messages.percentRange),
      introVideoUrl: z.union([z.string().url(messages.invalidUrl), z.literal("")])
    })
    .refine((data) => data.isFree || data.price > 0, {
      message: messages.positive,
      path: ["price"]
    });
}

export function lessonFormSchema(messages: { required: string; positive: string; invalidUrl: string }) {
  return z.object({
    title: z.string().min(1, messages.required),
    videoUrl: z.string().min(1, messages.required).url(messages.invalidUrl),
    duration: z.number().int(messages.positive).positive(messages.positive).optional(),
    order: z.number().int(messages.positive).positive(messages.positive).optional()
  });
}

export type LessonFormInput = z.infer<ReturnType<typeof lessonFormSchema>>;

// Both limitUses and expiredAt are documented as optional ("No") on create
// and update, but live-testing against the real backend (round 13)
// contradicted the docs on both, differently:
// - Omitting limit_uses: a clean 422 "The limit uses field is required."
//   — the table was just wrong, so it's marked required here.
// - Omitting expired_at: not a validation error at all — the request
//   crashes with a bare 500 "An error occurred" (confirmed via direct curl,
//   isolating it from anything frontend-side). That's a real backend bug,
//   not a documented rule to mirror. Since there's no clean error to show
//   the creator if this trips (a 500 has no useful field-level message),
//   expiredAt is required here too, purely as a defensive workaround —
//   flagged to the client as a backend issue worth an actual server fix.
export function couponFormSchema(messages: { required: string; positive: string; percentRange: string }) {
  return z.object({
    code: z.string().min(1, messages.required),
    discountPercentage: z.number().min(0, messages.percentRange).max(100, messages.percentRange),
    limitUses: z.number().int(messages.positive).positive(messages.positive),
    expiredAt: z.string().min(1, messages.required)
  });
}

export type CouponFormInput = z.infer<ReturnType<typeof couponFormSchema>>;

export function collectIssues(issues: { path: PropertyKey[]; message: string }[]) {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

// Client-side zod validation (collectIssues, above) only catches what it
// knows to check for — a 422 the backend rejects for a reason the schema
// doesn't model (a duplicate value, a cross-field rule, ...) was previously
// only ever shown as one generic banner message, with no indication of
// *which* field it was actually about. This distributes Laravel's
// {field: [messages]} error shape onto the same fieldErrors state collectIssues
// already populates, keyed by the LOCAL (camelCase form-state) field name via
// `fieldMap`, so a backend-side rejection lights up the same inline field
// error as a client-side one would. Laravel returns nested fields
// (`title[en]` on the wire) as dotted keys ("title.en") in `errors`.
export function apiFieldErrors(fieldErrors: Record<string, string[]>, fieldMap: Record<string, string>) {
  const errors: Record<string, string> = {};
  for (const [backendKey, messages] of Object.entries(fieldErrors)) {
    const localKey = fieldMap[backendKey];
    if (localKey && messages[0]) errors[localKey] = messages[0];
  }
  return errors;
}
