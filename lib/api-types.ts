import type { AnyUser, AccentKey, Category } from "./types";

export interface ApiCreatorProfile {

  bio: string | null;
  cover_image: string | null;
  balance: string;
  total_sales: number;
}

export interface ApiUser {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  profile_image: string | null;
  type: "student" | "creator";
  status: string;
  created_at: string;
  updated_at: string;
  creator_profile: ApiCreatorProfile | null;
}


export interface ApiAuthResult {
  id: number;
  name: string;
  email: string;
  type: "student" | "creator";
  token: string;
}

const DEFAULT_ACCENT: AccentKey = "teal";
const ACCENTS: AccentKey[] = ["teal", "gold", "clay", "ink", "moss", "plum", "sand", "rust"];

function slugify(name: string, id: number) {
  return `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${id}`;
}


function accentForId(id: number): AccentKey {
  return ACCENTS[id % ACCENTS.length];
}


export function mapApiUserToLocal(apiUser: ApiUser): AnyUser {
  const base = {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    avatarAccent: DEFAULT_ACCENT,
    status: (apiUser.status === "suspended" ? "suspended" : "active") as "active" | "suspended",
    phoneNumber: apiUser.phone_number ?? undefined,
    profileImage: apiUser.profile_image ?? undefined,
    preferredLanguage: "en" as const,
    createdAt: apiUser.created_at
  };

  if (apiUser.type === "creator") {
    const profile = apiUser.creator_profile;
    return {
      ...base,
      role: "creator",
      slug: slugify(apiUser.name, apiUser.id),
 
      bioEn: profile?.bio ?? "",
      bioAr: profile?.bio ?? "",
      coverAccent: DEFAULT_ACCENT,
      coverImage: profile?.cover_image ?? undefined,
      verified: false,
      balance: profile ? Number(profile.balance) : 0,
      totalSales: profile?.total_sales ?? 0,
      commissionRate: 20
    };
  }

  return { ...base, role: "student" };
}


export interface ApiCategory {
  id: number;
  name: string;
}

export function mapApiCategoryToLocal(apiCategory: ApiCategory): Category {
  return {
    id: String(apiCategory.id),
    slug: String(apiCategory.id),
    nameEn: apiCategory.name,
    nameAr: apiCategory.name,
    icon: "",
    image: undefined,
    status: "active",
    createdAt: new Date().toISOString()
  };
}


export interface ApiCreatorSummary {
  id: number;
  name: string;
  bio: string | null;
  profile_image: string | null;
  cover_image: string | null;
}

export interface CreatorSummary {
  id: string;
  name: string;
  bio: string;
  profileImage?: string;
  coverImage?: string;
  accent: AccentKey;
}

export function mapApiCreatorSummary(c: ApiCreatorSummary): CreatorSummary {
  return {
    id: String(c.id),
    name: c.name,
    bio: c.bio ?? "",
    profileImage: c.profile_image ?? undefined,
    coverImage: c.cover_image ?? undefined,
    accent: accentForId(c.id)
  };
}

export interface ApiCreatorCourseSummary {
  id: number;
  title: string;
  description: string;
  image: string | null;
  lessons_count: number;
  created_at: string;
}

export interface ApiCreatorDetails extends ApiCreatorSummary {
  community: { community_id: number; community_name: string } | null;
  courses: ApiCreatorCourseSummary[];
}

export interface CreatorDetails extends CreatorSummary {
  community: { id: string; name: string } | null;
  courses: { id: string; title: string; description: string; image?: string; lessonsCount: number; createdAt: string }[];
}

export function mapApiCreatorDetails(c: ApiCreatorDetails): CreatorDetails {
  return {
    ...mapApiCreatorSummary(c),
    community: c.community ? { id: String(c.community.community_id), name: c.community.community_name } : null,
    courses: c.courses.map((course) => ({
      id: String(course.id),
      title: course.title,
      description: course.description,
      image: course.image ?? undefined,
      lessonsCount: course.lessons_count,
      createdAt: course.created_at
    }))
  };
}


export interface ApiCommunityCreatorRef {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface ApiCommunitySummary {
  id: number;
  name: string;
  cover_image: string | null;
  type: "public" | "private";
  is_free: boolean;
  subscription_price: number;
  discount_percentage: number;
  final_price: number;
 
  subscription_duration_days: number;
  category_name: string;
  creator: ApiCommunityCreatorRef;
  reviews_count: number | null;
  rating_avg: number | null;
  courses_count: number;
  subscriptions_count: number;
 
  is_favorite?: boolean;

  subscription_start_at?: string;
  subscription_end_at?: string;
}

export interface CommunitySummary {
  id: string;
  name: string;
  coverImage?: string;
  type: "public" | "private";
  isFree: boolean;
  subscriptionPrice: number;
  discountPercentage: number;
  finalPrice: number;
  subscriptionDurationDays: number;
  categoryName: string;
  creator: { id: string; name: string; profileImage?: string };
  reviewsCount: number;
  ratingAvg: number;
  coursesCount: number;
  subscriptionsCount: number;
  subscriptionStartAt?: string;
  subscriptionEndAt?: string;
  isFavorite?: boolean;
  accent: AccentKey;
}

export function mapApiCommunitySummary(c: ApiCommunitySummary): CommunitySummary {
  return {
    id: String(c.id),
    name: c.name,
    coverImage: c.cover_image ?? undefined,
    type: c.type,
    isFree: c.is_free,
    subscriptionPrice: c.subscription_price,
    discountPercentage: c.discount_percentage,
    finalPrice: c.final_price,
    subscriptionDurationDays: c.subscription_duration_days ?? 30,
    categoryName: c.category_name,
    creator: {
      id: String(c.creator.id),
      name: c.creator.name,
      profileImage: c.creator.profile_image ?? undefined
    },
    reviewsCount: c.reviews_count ?? 0,
    ratingAvg: c.rating_avg ?? 0,
    coursesCount: c.courses_count,
    subscriptionsCount: c.subscriptions_count,
    subscriptionStartAt: c.subscription_start_at ?? undefined,
    subscriptionEndAt: c.subscription_end_at ?? undefined,
    isFavorite: c.is_favorite !== undefined ? Boolean(c.is_favorite) : undefined,
    accent: accentForId(c.id)
  };
}

// GET /courses/my-courses — the enrolled-standalone-courses list shown on
// the student's own "My Courses" page. The real backend hadn't returned any
// populated items to confirm the exact item shape against at the time this
// was written (only ever an empty list, no real enrollment to inspect), so
// every field is read defensively (optional chaining / fallbacks) rather
// than assumed present — modeled on the closest sibling shape that IS
// confirmed (GET /courses/details/{id}) plus the community-summary
// pattern's own field-naming conventions, so this degrades gracefully
// (blank/zero values, never a crash) if the real shape differs slightly.
export interface ApiCourseSummary {
  id: number;
  slug?: string | null;
  title: string;
  description?: string | null;
  image?: string | null;
  price?: number;
  discount_percentage?: number;
  final_price?: number;
  is_free?: boolean | number;
  lessons_count?: number;
  students_count?: number;
  creator?: { id: number; name: string; profile_image?: string | null } | null;
  community?: { community_id?: number; id?: number; name: string } | null;
  is_favorite?: boolean;
}

export interface CourseSummary {
  id: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  isFree: boolean;
  lessonsCount: number;
  studentsCount: number;
  creator?: { id: string; name: string; profileImage?: string };
  communityId?: string;
  communityName?: string;
  isFavorite?: boolean;
  accent: AccentKey;
}

export function mapApiCourseSummary(c: ApiCourseSummary): CourseSummary {
  return {
    id: String(c.id),
    title: c.title,
    description: c.description ?? "",
    image: c.image ?? undefined,
    price: c.price ?? 0,
    discountPercentage: c.discount_percentage ?? 0,
    finalPrice: c.final_price ?? c.price ?? 0,
    isFree: Boolean(c.is_free),
    lessonsCount: c.lessons_count ?? 0,
    studentsCount: c.students_count ?? 0,
    creator: c.creator
      ? { id: String(c.creator.id), name: c.creator.name, profileImage: c.creator.profile_image ?? undefined }
      : undefined,
    communityId: c.community ? String(c.community.community_id ?? c.community.id ?? "") : undefined,
    communityName: c.community?.name,
    isFavorite: c.is_favorite !== undefined ? Boolean(c.is_favorite) : undefined,
    accent: accentForId(c.id)
  };
}

export interface ApiCommunityCourse {
  id: number;
  title: string;
  description: string;
  image: string | null;
  lessons_count: number;
  created_at: string;
}

// The reviews embedded in GET /communities/details/{id} are only the
// approved ones (confirmed via a live example the client sent — round 14)
// — no separate "pending" entries show up here, unlike the creator-side
// moderation list, which sees everything regardless of approval state. The
// rating field is named `rate` here specifically, not `rating` like the
// POST /reviews create request or the creator-moderation list's `rating` —
// three different names for the same concept across this API, each kept as
// its own type rather than assumed consistent.
export interface ApiCommunityReviewUser {
  name: string;
  profile_image: string | null;
}

export interface ApiCommunityReview {
  id: number;
  rate: number;
  comment: string | null;
  created_at: string;
  user: ApiCommunityReviewUser;
}

export interface CommunityReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; profileImage?: string };
}

export interface ApiCommunityDetails extends ApiCommunitySummary {
  // Confirmed live on GET /communities/details/{id} — always present, but
  // only true when the request carried the student's Bearer token. SSR
  // fetches (getCommunityDetails in api-content.ts) run without auth, so
  // this reads false there; client components refetch with auth via
  // useCommunitySubscription().
  // Live API sometimes sends 0/1 instead of strict booleans — Boolean() in mapper.
  is_subscribed: boolean | number;
  reviews: ApiCommunityReview[];
  courses: ApiCommunityCourse[];
}

export interface CommunityDetails extends CommunitySummary {
  isSubscribed: boolean;
  reviews: CommunityReview[];
  courses: { id: string; title: string; description: string; image?: string; lessonsCount: number; createdAt: string }[];
}

export function mapApiCommunityDetails(c: ApiCommunityDetails): CommunityDetails {
  return {
    ...mapApiCommunitySummary(c),
    isSubscribed: Boolean(c.is_subscribed),
    reviews: c.reviews.map((r) => ({
      id: String(r.id),
      rating: r.rate,
      comment: r.comment ?? "",
      createdAt: r.created_at,
      user: { name: r.user.name, profileImage: r.user.profile_image ?? undefined }
    })),
    courses: c.courses.map((course) => ({
      id: String(course.id),
      title: course.title,
      description: course.description,
      image: course.image ?? undefined,
      lessonsCount: course.lessons_count,
      createdAt: course.created_at
    }))
  };
}

// GET /courses/details/{course_id} — a public endpoint (no Authentication
// section documented, unlike reviews/coupons), so the backend doesn't gate
// anything itself: every lesson's real video `url` comes back regardless of
// who's asking, `is_free` per lesson is the only server-provided signal for
// what's actually watchable. Access control is therefore entirely a frontend
// concern here — same shape as the old local-mock CourseCurriculum's
// `unlocked || lesson.isFree` gate, just driven by real per-lesson flags now.
// Note `is_free` on the course itself comes back as a 0/1 number in the
// example (`"is_free": 0`) while each lesson's `is_free` is a real boolean —
// coerced with Boolean() either way rather than trusting the type.
export interface ApiCourseLesson {
  id: number;
  slug: string | null;
  title: string;
  description: string;
  url: string;
  is_free: boolean;
  order: number;
  status: string;
  created_at: string;
}

export interface ApiCourseCommunityRef {
  community_id: number;
  name: string;
  description: string;
}

export interface ApiCourseCreatorRef {
  creator_id: number;
  name: string;
  profile_image: string | null;
}

export interface ApiCourseDetails {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  final_price: number;
  image: string | null;
  intro_video: string | null;
  is_free: boolean | number;
  status: string;
  lessons_count: number;
  students_count: number;
  reviews_count: number | null;
  rating_avg: number | null;
  created_at: string;
  // True only when GET /courses/details/{id} is called with Bearer auth.
  // Some backends expose is_enrolled, others is_subscribed — mapper accepts both.
  is_enrolled?: boolean;
  is_subscribed?: boolean;
  is_favorite?: boolean;
  community: ApiCourseCommunityRef;
  creator: ApiCourseCreatorRef;
  lessons: ApiCourseLesson[];
}

// Deliberately no `url` field — the public course-details endpoint this maps
// from does return one, but it's the real (unlocked-or-not) video link, and
// this type flows straight into a Client Component's props, which Next.js
// serializes into the page's own HTML/flight payload. Dropping it here means
// it never reaches the browser for this page at all; the real url is only
// ever fetched by the dedicated per-lesson watch page, from the authenticated
// GET /lessons/{id} — see LessonWatchView.
export interface CourseLesson {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  order: number;
  status: string;
}

export interface CourseDetails {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  image?: string;
  introVideo?: string;
  isFree: boolean;
  isEnrolled: boolean;
  isFavorite?: boolean;
  status: string;
  lessonsCount: number;
  studentsCount: number;
  reviewsCount: number;
  ratingAvg: number;
  community: { id: string; name: string; description: string };
  creator: { id: string; name: string; profileImage?: string };
  lessons: CourseLesson[];
  accent: AccentKey;
}

export function mapApiCourseDetails(c: ApiCourseDetails): CourseDetails {
  return {
    id: String(c.id),
    slug: c.slug,
    title: c.title,
    description: c.description,
    price: c.price,
    discountPercentage: c.discount_percentage,
    finalPrice: c.final_price,
    image: c.image ?? undefined,
    introVideo: c.intro_video ?? undefined,
    isFree: Boolean(c.is_free),
    isEnrolled: Boolean(c.is_enrolled ?? c.is_subscribed ?? false),
    isFavorite: c.is_favorite !== undefined ? Boolean(c.is_favorite) : undefined,
    status: c.status,
    lessonsCount: c.lessons_count,
    studentsCount: c.students_count,
    reviewsCount: c.reviews_count ?? 0,
    ratingAvg: c.rating_avg ?? 0,
    community: {
      id: String(c.community.community_id),
      name: c.community.name,
      description: c.community.description
    },
    creator: {
      id: String(c.creator.creator_id),
      name: c.creator.name,
      profileImage: c.creator.profile_image ?? undefined
    },
    lessons: [...c.lessons]
      .sort((a, b) => a.order - b.order)
      .map((l) => ({
        id: String(l.id),
        title: l.title,
        description: l.description,
        isFree: Boolean(l.is_free),
        order: l.order,
        status: l.status
      })),
    accent: accentForId(c.id)
  };
}

// GET /lessons/{id} — authenticated (unlike the public course-details
// endpoint above, which leaks every lesson's real video url to anyone,
// locked or not). This is the endpoint the actual "watch this lesson" page
// calls, fetched client-side on demand rather than embedded in any
// server-rendered page, so the real url never sits in a page's static HTML.
export interface ApiLessonAttachment {
  media_path: string;
  media_name: string;
  media_type: string;
  media_size: string;
}

export interface ApiLessonVideo {
  id: number;
  slug: string | null;
  title: string;
  description: string;
  is_free: boolean;
  video_url: string;
  attachments: ApiLessonAttachment[];
}

export interface LessonAttachment {
  path: string;
  name: string;
  type: string;
  size: string;
}

export interface LessonVideo {
  id: string;
  title: string;
  description: string;
  isFree: boolean;
  videoUrl: string;
  attachments: LessonAttachment[];
}

export function mapApiLessonVideo(l: ApiLessonVideo): LessonVideo {
  return {
    id: String(l.id),
    title: l.title,
    description: l.description,
    isFree: l.is_free,
    videoUrl: l.video_url,
    attachments: l.attachments.map((a) => ({
      path: a.media_path,
      name: a.media_name,
      type: a.media_type,
      size: a.media_size
    }))
  };
}

// GET /favorites (list) and POST /favorites/toggle share the "favorites"
// domain but the list endpoint's item shapes are trimmed versions of the
// community/course summaries used elsewhere — a favorited community's item
// has no `courses_count`/`subscriptions_count`, and a favorited course's item
// has no community reference at all (not even the id), unlike
// GET /courses/details/{id}. That last gap is why course pages live at the
// flat /courses/{id} route rather than nested under a community — a favorite
// alone can never supply a community id for the URL.
export interface ApiFavoriteCommunityItem {
  id: number;
  name: string;
  cover_image: string | null;
  type: "public" | "private";
  is_free: boolean;
  subscription_price: number;
  discount_percentage: number;
  final_price: number;
  category_name: string;
  creator: ApiCommunityCreatorRef;
  reviews_count: number | null;
  rating_avg: number | null;
}

export interface ApiFavoriteCourseItem {
  id: number;
  title: string;
  description: string;
  image: string | null;
  lessons_count: number | null;
  created_at: string;
}

export interface ApiFavoriteEntry {
  id: number;
  type: "community" | "course";
  item: ApiFavoriteCommunityItem | ApiFavoriteCourseItem;
}

export interface FavoriteCommunityItem {
  favoriteId: string;
  type: "community";
  id: string;
  name: string;
  coverImage?: string;
  categoryName: string;
  creator: { id: string; name: string; profileImage?: string };
  isFree: boolean;
  finalPrice: number;
  discountPercentage: number;
  ratingAvg: number;
  reviewsCount: number;
  accent: AccentKey;
}

export interface FavoriteCourseItem {
  favoriteId: string;
  type: "course";
  id: string;
  title: string;
  description: string;
  image?: string;
  lessonsCount: number;
  createdAt: string;
  accent: AccentKey;
}

export type FavoriteItem = FavoriteCommunityItem | FavoriteCourseItem;

export function mapApiFavoriteEntry(entry: ApiFavoriteEntry): FavoriteItem {
  if (entry.type === "community") {
    const c = entry.item as ApiFavoriteCommunityItem;
    return {
      favoriteId: String(entry.id),
      type: "community",
      id: String(c.id),
      name: c.name,
      coverImage: c.cover_image ?? undefined,
      categoryName: c.category_name,
      creator: {
        id: String(c.creator.id),
        name: c.creator.name,
        profileImage: c.creator.profile_image ?? undefined
      },
      isFree: c.is_free,
      finalPrice: c.final_price,
      discountPercentage: c.discount_percentage,
      ratingAvg: c.rating_avg ?? 0,
      reviewsCount: c.reviews_count ?? 0,
      accent: accentForId(c.id)
    };
  }
  const course = entry.item as ApiFavoriteCourseItem;
  return {
    favoriteId: String(entry.id),
    type: "course",
    id: String(course.id),
    title: course.title,
    description: course.description,
    image: course.image ?? undefined,
    lessonsCount: course.lessons_count ?? 0,
    createdAt: course.created_at,
    accent: accentForId(course.id)
  };
}

// POST /creators/communities (create), POST /creators/communities/{id}
// (update), and GET /creators/communities (list — added round 12, closing
// the "no way to know if a creator already has a community" gap from round
// 9) all share this exact response shape — the only place in the whole API
// that returns a community's real bilingual name/description pair (every
// public community endpoint only ever returns one already-localized string
// per the `lang` header). The category id's own type is inconsistent
// between the create/update examples (a string "1" vs a bare number 1) —
// coerced with String() either way rather than trusting it.
export interface ApiCreatorCommunity {
  id: number;
  name: string;
  description: string | null;
  cover_image: string | null;
  type: "public" | "private";
  is_free: boolean;
  subscription_price: number;
  discount_percentage: number;
  final_price: number;
  subscription_duration_days?: number;
  category: { id: number | string; name: string };
}

export interface CreatorCommunity {
  id: string;
  name: string;
  description: string;
  coverImage?: string;
  type: "public" | "private";
  isFree: boolean;
  subscriptionPrice: number;
  discountPercentage: number;
  finalPrice: number;
  subscriptionDurationDays?: number;
  categoryId: string;
  categoryName: string;
}

export function mapApiCreatorCommunity(c: ApiCreatorCommunity): CreatorCommunity {
  return {
    id: String(c.id),
    name: c.name,
    description: c.description ?? "",
    coverImage: c.cover_image ?? undefined,
    type: c.type,
    isFree: c.is_free,
    subscriptionPrice: c.subscription_price,
    discountPercentage: c.discount_percentage,
    finalPrice: c.final_price,
    subscriptionDurationDays: c.subscription_duration_days,
    categoryId: String(c.category.id),
    categoryName: c.category.name
  };
}

// POST /creators/courses (create), POST /creators/courses/{id} (update),
// GET /creators/courses (list), and GET /creators/courses/{id} (get one) —
// added round 12 — all share this exact response/item shape. Always a single
// already-localized title/description string (never an {en, ar} pair) — the
// backend later dropped the ar/en split on the request side too (create/
// update now take one `title`/`description`, no more bracket-notation
// fields). No endpoint in this family (list, get, create, or update) ever
// returns a category, so a course's current category can never be recovered
// on edit — see EditCourseView's own note.
// The prose "Request Body" table and the worked curl example disagree
// again on both create and update: the table lists
// title/description/category_id/cover_image/price/is_free, but the actual
// formdata example additionally sends `discount_percentage` and
// `intro_video_url`, and names the image field `image`, not `cover_image` —
// went with the example's field names, same rule as every prior mismatch.
export interface ApiCreatorCourseUpdate {
  id: number;
  title: string;
  description: string;
  price: number;
  discount_percentage: number;
  final_price: number;
  image: string | null;
  intro_video: string | null;
  is_free: boolean | number;
  status: string;
  created_at: string;
  category?: { id: number | string; name: string } | null;
  category_id?: number | string | null;
}

export interface CreatorCourseUpdateResult {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  image?: string;
  introVideo?: string;
  isFree: boolean;
  status: string;
  createdAt: string;
  categoryId?: string;
  categoryName?: string;
}

export function mapApiCreatorCourseUpdate(c: ApiCreatorCourseUpdate): CreatorCourseUpdateResult {
  return {
    id: String(c.id),
    title: c.title,
    description: c.description,
    price: c.price,
    discountPercentage: c.discount_percentage,
    finalPrice: c.final_price,
    image: c.image ?? undefined,
    introVideo: c.intro_video ?? undefined,
    isFree: Boolean(c.is_free),
    status: c.status,
    createdAt: c.created_at,
    categoryId: c.category ? String(c.category.id) : c.category_id != null ? String(c.category_id) : undefined,
    categoryName: c.category?.name
  };
}

// POST /creators/courses/lessons/{id} (update), POST /creators/courses/{id}/lessons
// (create), GET /creators/courses/{id}/lessons (list), and
// GET /creators/courses/lessons/{id} (get one) — the last three added round
// 12, closing the "no way to list/create/fetch a single lesson" gaps from
// round 11. Same shape across all four, except `order` is only ever present
// on the list and update responses — the single-lesson GET and the create
// response both omit it entirely (server-assigned, apparently not
// considered part of "this lesson's own data" on those two) — kept optional
// here rather than assumed present. Like the course endpoints, only one
// already-localized title/description comes back per request, and the
// create/update request side is likewise single-field now (no more ar/en
// split). The prose "Request Body" table doesn't list `status` as an
// updatable field at all, but the worked curl example sends
// `status: "active"` and the response echoes it back — same
// table-vs-example mismatch this project keeps hitting; treated as real and
// updatable, following the example over the table.
export interface ApiCreatorLessonUpdate {
  id: number;
  slug: string | null;
  title: string;
  description: string;
  video_url: string;
  is_free: boolean;
  order?: number;
  status: string;
  created_at: string;
  // Not confirmed present on every one of the four endpoints sharing this
  // shape (a 500 on the live backend blocked confirming the create/single-GET
  // response body) — kept optional/defensive, same rule as everywhere else
  // this project hits an unconfirmed field. The *request* side (uploading
  // attachments on create/update as attachments[0], attachments[1], ...) is
  // confirmed live: the backend validates each indexed file field and
  // rejects unsupported types, so the field-naming convention itself is real.
  attachments?: ApiLessonAttachment[];
}

export interface CreatorLessonUpdateResult {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  order?: number;
  status: string;
  attachments: LessonAttachment[];
}

export function mapApiCreatorLessonUpdate(l: ApiCreatorLessonUpdate): CreatorLessonUpdateResult {
  return {
    id: String(l.id),
    title: l.title,
    description: l.description,
    videoUrl: l.video_url,
    isFree: Boolean(l.is_free),
    order: l.order,
    status: l.status,
    attachments: (l.attachments ?? []).map((a) => ({
      path: a.media_path,
      name: a.media_name,
      type: a.media_type,
      size: a.media_size
    }))
  };
}

// GET /creators/courses/{id}/lessons wraps its array as { items: [...] },
// unlike GET /creators/communities and GET /creators/courses which return a
// flat array directly under `data` — kept as its own response type rather
// than assumed consistent with the other two list endpoints.
export interface ApiCreatorLessonListResponse {
  items: ApiCreatorLessonUpdate[];
}

// GET /creators/coupons (list, paginated), GET/POST /creators/coupons/{id}
// (get one / create / update), DELETE /creators/coupons/{id}. Unlike every
// other creator-CRUD endpoint this project has connected, the create and
// update field tables actually agree with their worked curl examples —
// no table-vs-example mismatch here. The one real quirk: `expired_at` comes
// back from every GET in a human-display format ("2026-09-19 12:00 AM",
// 12-hour with AM/PM) but the create/update request expects a plain
// "Y-m-d H:i:s" 24-hour string ("2026-07-28 7:00:00") — two different
// formats for the same field depending on direction. Converted explicitly
// (see couponExpiryToInputValue/couponExpiryToApiValue below) rather than
// trusting either side to round-trip through a native Date parse.
export interface ApiCreatorCoupon {
  id: number;
  code: string;
  discount_percentage: number;
  limit_uses: number | null;
  expired_at: string | null;
  created_at: string;
}

export interface CreatorCoupon {
  id: string;
  code: string;
  discountPercentage: number;
  limitUses?: number;
  expiredAt?: string;
  createdAt: string;
}

export function mapApiCreatorCoupon(c: ApiCreatorCoupon): CreatorCoupon {
  return {
    id: String(c.id),
    code: c.code,
    discountPercentage: c.discount_percentage,
    limitUses: c.limit_uses ?? undefined,
    expiredAt: c.expired_at ?? undefined,
    createdAt: c.created_at
  };
}

export interface CreatorCouponsPage {
  items: CreatorCoupon[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

// "2026-09-19 12:00 AM" -> "2026-09-19T00:00" for <input type="datetime-local">.
// Returns "" (leave the field blank) on anything that doesn't match this
// exact shape rather than guessing via a native Date parse, which isn't
// reliable for this non-ISO, space-separated, 12-hour string.
export function couponExpiryToInputValue(apiValue: string): string {
  const match = apiValue.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{1,2}):(\d{2}) (AM|PM)$/);
  if (!match) return "";
  const [, y, mo, d, h, mi, meridiem] = match;
  let hour = Number(h) % 12;
  if (meridiem === "PM") hour += 12;
  return `${y}-${mo}-${d}T${String(hour).padStart(2, "0")}:${mi}`;
}

// "2026-07-28T19:00" (from <input type="datetime-local">) -> "2026-07-28 19:00:00"
export function couponExpiryToApiValue(inputValue: string): string {
  return `${inputValue.replace("T", " ")}:00`;
}

// GET /creators/reviews (list), GET /creators/reviews/{id} (get one) — same
// shape either way. `reviewable` is a trimmed {id, name} ref to whichever
// course or community the review is on, disambiguated by `type`. `comment`
// is nullable (a rating-only review has none). Moderation is a bare
// approved/rejected boolean (`is_approved`) — there's no third "pending"
// state in the data itself, just whatever `is_approved` currently is; a
// freshly submitted review's example showed `is_approved: false`, so
// "not yet approved" and "explicitly rejected" are indistinguishable from
// the API's own shape, both are just `false`.
export interface ApiCreatorReviewUser {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface ApiCreatorReviewReviewable {
  id: number;
  name: string;
}

export interface ApiCreatorReview {
  id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  user: ApiCreatorReviewUser;
  type: "community" | "course";
  reviewable: ApiCreatorReviewReviewable;
  created_at: string;
}

export interface CreatorReview {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  user: { id: string; name: string; profileImage?: string };
  type: "community" | "course";
  reviewable: { id: string; name: string };
  createdAt: string;
}

export function mapApiCreatorReview(r: ApiCreatorReview): CreatorReview {
  return {
    id: String(r.id),
    rating: r.rating,
    comment: r.comment ?? "",
    isApproved: r.is_approved,
    user: {
      id: String(r.user.id),
      name: r.user.name,
      profileImage: r.user.profile_image ?? undefined
    },
    type: r.type,
    reviewable: { id: String(r.reviewable.id), name: r.reviewable.name },
    createdAt: r.created_at
  };
}

// GET /creators/reviews wraps its array as { items: [...] }, same pattern
// as GET /creators/courses/{id}/lessons — kept as its own response type
// rather than assumed consistent with the flat-array communities/courses
// list endpoints.
export interface ApiCreatorReviewListResponse {
  items: ApiCreatorReview[];
}

export function mapApiAuthResultToLocal(result: ApiAuthResult): AnyUser {
  return mapApiUserToLocal({
    id: result.id,
    name: result.name,
    email: result.email,
    phone_number: null,
    profile_image: null,
    type: result.type,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    creator_profile: result.type === "creator" ? { bio: null, cover_image: null, balance: "0", total_sales: 0 } : null
  });
}

// ---- Community feed: posts / comments / reactions ----
// Named Feed* rather than reusing lib/types.ts's CommunityPost/PostComment,
// which belong to the old local-mock feed (CommunityFeed.tsx/platform-store)
// this real integration replaces — same name, different shape, would be
// confusing to share.

export type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export interface ApiFeedUserRef {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface ApiPostMedia {
  id?: number;
  url?: string;
  file_path?: string;
  media_path?: string;
  media_name?: string;
  media_type?: string;
  media_size?: string;
  type?: string;
}

export type PostMediaItem = {
  url: string;
  name?: string;
  mimeType?: string;
  size?: string;
};

export function resolvePostMediaUrl(m: ApiPostMedia): string {
  return (m.url ?? m.media_path ?? m.file_path ?? "").trim();
}

export function postMediaKind(item: PostMediaItem): "image" | "video" | "file" {
  const mime = item.mimeType?.toLowerCase() ?? "";
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  const url = item.url.toLowerCase();
  if (/\.(jpg|jpeg|png|gif|webp|avif|bmp|svg)(\?.*)?$/i.test(url)) return "image";
  if (/\.(mp4|mov|webm|m4v|avi)(\?.*)?$/i.test(url)) return "video";
  return "file";
}

export function mapApiPostMedia(m: ApiPostMedia): PostMediaItem | null {
  const url = resolvePostMediaUrl(m);
  if (!url) return null;
  return {
    url,
    name: m.media_name,
    mimeType: m.media_type ?? m.type,
    size: m.media_size,
  };
}

export interface FeedUserRef {
  id: string;
  name: string;
  profileImage?: string;
}

function mapApiFeedUserRef(u: ApiFeedUserRef): FeedUserRef {
  return { id: String(u.id), name: u.name, profileImage: u.profile_image ?? undefined };
}

export interface ApiFeedPost {
  id: number;
  content: string;
  is_pinned: boolean;
  is_owner: boolean;
  with_media: boolean;
  comments_count: number | null;
  reactions_count: number | null;
  my_reaction: ReactionType | null;
  created_at: string;
  user: ApiFeedUserRef;
  media: ApiPostMedia[];
  // GET /communities/{id}/posts embeds up to two latest top-level comments
  // per item — full thread still lives on GET /posts/{id}/comments.
  comments?: ApiFeedCommentListItem[];
}

export interface FeedPost {
  id: string;
  content: string;
  isPinned: boolean;
  isOwner: boolean;
  withMedia: boolean;
  commentsCount: number;
  reactionsCount: number;
  myReaction: ReactionType | null;
  createdAt: string;
  user: FeedUserRef;
  media: PostMediaItem[];
  comments: FeedComment[];
}

export function mapApiFeedPost(p: ApiFeedPost): FeedPost {
  return {
    id: String(p.id),
    content: p.content,
    isPinned: p.is_pinned,
    isOwner: p.is_owner,
    withMedia: p.with_media,
    // A freshly-created post with no comments/reactions yet comes back with
    // these as null rather than 0 — coerced here so the UI never has to
    // special-case a missing count.
    commentsCount: p.comments_count ?? 0,
    reactionsCount: p.reactions_count ?? 0,
    myReaction: p.my_reaction,
    createdAt: p.created_at,
    user: mapApiFeedUserRef(p.user),
    media: (p.media ?? []).map(mapApiPostMedia).filter((m): m is PostMediaItem => m !== null),
    comments: (p.comments ?? []).map(mapApiFeedComment),
  };
}

// GET /posts/{id}/comments list items — replies aren't nested here, only
// counted (repliesCount); fetch GET /comments/{id}/replies to load them.
export interface ApiFeedCommentListItem {
  id: number;
  content: string;
  is_owner: boolean;
  created_at: string;
  replies_count: number | null;
  user: ApiFeedUserRef;
  replies?: ApiFeedCommentListItem[];
}

export interface FeedComment {
  id: string;
  content: string;
  isOwner: boolean;
  createdAt: string;
  repliesCount: number;
  user: FeedUserRef;
}

export function mapApiFeedComment(c: ApiFeedCommentListItem): FeedComment {
  return {
    id: String(c.id),
    content: c.content ?? "",
    isOwner: Boolean(c.is_owner),
    createdAt: c.created_at ?? "",
    repliesCount: c.replies_count ?? 0,
    user: c.user
      ? mapApiFeedUserRef(c.user)
      : { id: "0", name: "—", profileImage: undefined },
  };
}

// GET /comments/{id}/replies — unlike the comments list, this returns the
// parent comment's own data at the top level plus its replies nested inside.
export interface ApiFeedCommentRepliesResponse {
  id: number;
  content: string;
  is_owner: boolean;
  created_at: string;
  replies_count: number | null;
  replies: ApiFeedCommentListItem[];
}

export interface ApiFeedReaction {
  id: number;
  type: ReactionType;
  created_at: string;
  user: ApiFeedUserRef;
}

export interface FeedReaction {
  id: string;
  type: ReactionType;
  createdAt: string;
  user: FeedUserRef;
}

export function mapApiFeedReaction(r: ApiFeedReaction): FeedReaction {
  return {
    id: String(r.id),
    type: r.type,
    createdAt: r.created_at,
    user: mapApiFeedUserRef(r.user)
  };
}

// ---- Creator dashboard / earnings / withdrawals / community subscribers ----

export interface ApiCreatorDashboard {
  published_courses: number;
  free_courses: number;
  paid_courses: number;
  community_subscribers: number;
  free_subscribers: number;
  paid_subscribers: number;
  course_students: number;
  total_students: number;
  total_balance?: number;
  total_withdrawn?: number;
  current_balance: number;
  pending_balance: number;
}

export interface CreatorDashboardSummary {
  publishedCourses: number;
  freeCourses: number;
  paidCourses: number;
  communitySubscribers: number;
  freeSubscribers: number;
  paidSubscribers: number;
  courseStudents: number;
  totalStudents: number;
  totalWithdrawn: number;
  currentBalance: number;
  pendingBalance: number;
}

export function mapApiCreatorDashboard(d: ApiCreatorDashboard): CreatorDashboardSummary {
  return {
    publishedCourses: d.published_courses,
    freeCourses: d.free_courses,
    paidCourses: d.paid_courses,
    communitySubscribers: d.community_subscribers,
    freeSubscribers: d.free_subscribers,
    paidSubscribers: d.paid_subscribers,
    courseStudents: d.course_students,
    totalStudents: d.total_students,
    totalWithdrawn: d.total_withdrawn ?? d.total_balance ?? 0,
    currentBalance: d.current_balance,
    pendingBalance: d.pending_balance
  };
}

export interface ApiCreatorEarningsSummary {
  total_sales: number;
  platform_commission: number;
  net_profit: number;
  current_balance: number;
  pending_balance: number;
}

export interface CreatorEarningsSummary {
  totalSales: number;
  platformCommission: number;
  netProfit: number;
  currentBalance: number;
  pendingBalance: number;
}

export function mapApiCreatorEarningsSummary(e: ApiCreatorEarningsSummary): CreatorEarningsSummary {
  return {
    totalSales: e.total_sales,
    platformCommission: e.platform_commission,
    netProfit: e.net_profit,
    currentBalance: e.current_balance,
    pendingBalance: e.pending_balance
  };
}

export interface ApiCreatorSale {
  user: ApiFeedUserRef;
  type: "course" | "community";
  amount: number;
  platform_commission: number;
  net_profit: number;
  created_at: string;
}

export interface CreatorSale {
  user: FeedUserRef;
  type: "course" | "community";
  amount: number;
  platformCommission: number;
  netProfit: number;
  createdAt: string;
}

export function mapApiCreatorSale(s: ApiCreatorSale): CreatorSale {
  return {
    user: mapApiFeedUserRef(s.user),
    type: s.type,
    amount: s.amount,
    platformCommission: s.platform_commission,
    netProfit: s.net_profit,
    createdAt: s.created_at
  };
}

// "wallet" is the current payout method (what the create-request form
// sends); "vodafone_cash" is kept only because older withdrawal records
// returned by GET /creators/withdraws can still carry that value — both
// display as the same "Wallet" / "المحفظة" label.
export type PayoutMethod = "wallet" | "vodafone_cash" | "instapay" | "bank_account";

export interface ApiCreatorWithdrawal {
  id: number;
  amount: number | string;
  payout_method: string;
  payout_account_number: string;
  status: string;
  has_proof: boolean;
  requested_at: string;
  approved_at: string | null;
  created_at: string;
}

export interface CreatorWithdrawal {
  id: string;
  amount: number;
  // Normalized to lowercase — confirmed live that different endpoints
  // return this with different casing ("wallet" from the list, "Wallet"
  // from the create/details response), so comparisons against the literal
  // PayoutMethod values need a consistent case to be reliable.
  payoutMethod: PayoutMethod;
  payoutAccountNumber: string;
  status: string;
  hasProof: boolean;
  requestedAt: string;
  approvedAt: string | null;
  createdAt: string;
}

export function mapApiCreatorWithdrawal(w: ApiCreatorWithdrawal): CreatorWithdrawal {
  return {
    id: String(w.id),
    amount: Number(w.amount),
  payoutMethod: String(w.payout_method ?? "").toLowerCase() as PayoutMethod,
    payoutAccountNumber: w.payout_account_number,
   status: String(w.status ?? "").toLowerCase(),
    hasProof: w.has_proof,
    requestedAt: w.requested_at,
    approvedAt: w.approved_at,
    createdAt: w.created_at
  };
}

export interface ApiCreatorWithdrawalDetails extends ApiCreatorWithdrawal {
  admin_payment_proof?: string | null;
}

export interface CreatorWithdrawalDetails extends CreatorWithdrawal {
  adminPaymentProof?: string;
}

export function mapApiCreatorWithdrawalDetails(w: ApiCreatorWithdrawalDetails): CreatorWithdrawalDetails {
  return {
    ...mapApiCreatorWithdrawal(w),
    adminPaymentProof: w.admin_payment_proof ?? undefined
  };
}

export interface ApiCommunitySubscriber {
  id: number;
  name: string;
  profile_image: string | null;
}

export interface CommunitySubscriber {
  id: string;
  name: string;
  profileImage?: string;
}

export function mapApiCommunitySubscriber(s: ApiCommunitySubscriber): CommunitySubscriber {
  return { id: String(s.id), name: s.name, profileImage: s.profile_image ?? undefined };
}

// ---- Public settings ----

// The raw response also carries site_name/site_logo/site_favicon/
// site_description — intentionally not declared here, since the client
// asked for only currency + the social links to ever be read out of this
// endpoint (mapApiSettings below narrows to exactly that).
export interface ApiSettings {
  site_name?: string;
  site_logo?: string | null;
  site_favicon?: string | null;
  currency: string;
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  linkedin_url: string | null;
  tiktok_url: string | null;
  whatsapp_number: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  // The live backend currently returns one flat `site_description` (same
  // text regardless of the `lang` header) rather than the locale-split
  // `site_description_en`/`site_description_ar` pair described separately —
  // both shapes are read, split preferred when present, so this keeps
  // working either way once/if the backend switches.
  site_description?: string | null;
  site_description_en?: string | null;
  site_description_ar?: string | null;
  last_updated?: string;
}

export interface PlatformSettings {
  siteName?: string;
  siteLogo?: string;
  siteFavicon?: string;
  currency: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  lastUpdated?: string;
}

export function mapApiSettings(s: ApiSettings): PlatformSettings {
  return {
    siteName: s.site_name || undefined,
    siteLogo: s.site_logo ?? undefined,
    siteFavicon: s.site_favicon ?? undefined,
    currency: s.currency,
    facebookUrl: s.facebook_url ?? undefined,
    instagramUrl: s.instagram_url ?? undefined,
    twitterUrl: s.twitter_url ?? undefined,
    youtubeUrl: s.youtube_url ?? undefined,
    linkedinUrl: s.linkedin_url ?? undefined,
    tiktokUrl: s.tiktok_url ?? undefined,
    whatsappNumber: s.whatsapp_number ?? undefined,
    contactEmail: s.contact_email ?? undefined,
    contactPhone: s.contact_phone ?? undefined,
    contactAddress: s.contact_address ?? undefined,
    descriptionEn: s.site_description_en ?? s.site_description ?? undefined,
    descriptionAr: s.site_description_ar ?? s.site_description ?? undefined,
    lastUpdated: s.last_updated ?? undefined
  };
}

/** Keep SSR / prior branding when a stale client cache omits optional fields. */
export function mergePlatformSettings(
  base: PlatformSettings | null | undefined,
  incoming: PlatformSettings
): PlatformSettings {
  if (!base) return incoming;
  return {
    ...incoming,
    siteName: incoming.siteName ?? base.siteName,
    siteLogo: incoming.siteLogo ?? base.siteLogo,
    siteFavicon: incoming.siteFavicon ?? base.siteFavicon,
    descriptionEn: incoming.descriptionEn ?? base.descriptionEn,
    descriptionAr: incoming.descriptionAr ?? base.descriptionAr,
    contactEmail: incoming.contactEmail ?? base.contactEmail,
    contactPhone: incoming.contactPhone ?? base.contactPhone,
    contactAddress: incoming.contactAddress ?? base.contactAddress,
    facebookUrl: incoming.facebookUrl ?? base.facebookUrl,
    instagramUrl: incoming.instagramUrl ?? base.instagramUrl,
    twitterUrl: incoming.twitterUrl ?? base.twitterUrl,
    youtubeUrl: incoming.youtubeUrl ?? base.youtubeUrl,
    linkedinUrl: incoming.linkedinUrl ?? base.linkedinUrl,
    tiktokUrl: incoming.tiktokUrl ?? base.tiktokUrl,
    whatsappNumber: incoming.whatsappNumber ?? base.whatsappNumber,
    lastUpdated: incoming.lastUpdated ?? base.lastUpdated,
    currency: incoming.currency || base.currency
  };
}

// ---- Payments ----

// POST /communities/{id}/subscribe and POST /courses/{id}/enroll share this
// exact response shape — a Kashier-hosted checkout session, not an
// immediately-completed purchase. A 201 here only means "the session was
// created", not "paid"; the actual subscription/enrollment only exists once
// the student completes payment on `payment_url` (Kashier's own hosted
// page), which is why the frontend's only job on success is to redirect
// there — there's nothing to unlock locally yet.
export interface ApiPaymentSession {
  payment_id: number;
  order_id: string;
  amount: number;
  currency: string;
  payment_url: string;
}

export interface PaymentSession {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  paymentUrl: string;
}

export function mapApiPaymentSession(p: ApiPaymentSession): PaymentSession {
  return {
    paymentId: String(p.payment_id),
    orderId: p.order_id,
    amount: p.amount,
    currency: p.currency,
    paymentUrl: p.payment_url
  };
}

// ---- Notifications ----

export type NotificationType = string;

export interface ApiNotificationData {
  course_id?: number;
  community_id?: number;
  lesson_id?: number;
}

// `message`/`title` aren't nailed down to one exact field name in the spec's
// list example, so both are read defensively (mapApiNotification falls back
// to a locally-generated sentence per `type` if neither comes back).
export interface ApiNotification {
  id: number;
  type: NotificationType;
  message?: string | null;
  title?: string | null;
  icon?: string | null;
  data: ApiNotificationData;
  read_at: string | null;
  created_at: string;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string | null;
  icon?: string;
  courseId?: string;
  communityId?: string;
  lessonId?: string;
  read: boolean;
  createdAt: string;
}

export function mapApiNotification(n: ApiNotification): AppNotification {
  return {
    id: String(n.id),
    type: n.type,
    message: n.message ?? n.title ?? null,
    icon: n.icon ?? undefined,
    courseId: n.data?.course_id != null ? String(n.data.course_id) : undefined,
    communityId: n.data?.community_id != null ? String(n.data.community_id) : undefined,
    lessonId: n.data?.lesson_id != null ? String(n.data.lesson_id) : undefined,
    read: n.read_at !== null,
    createdAt: n.created_at
  };
}
