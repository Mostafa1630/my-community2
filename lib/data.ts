import categoriesJson from "@/data/categories.json";
import creatorsJson from "@/data/creators.json";
import coursesJson from "@/data/courses.json";
import studentsJson from "@/data/students.json";
import adminsJson from "@/data/admins.json";
import communitiesJson from "@/data/communities.json";
import postsJson from "@/data/posts.json";
import commentsJson from "@/data/comments.json";
import reactionsJson from "@/data/reactions.json";
import paymentsJson from "@/data/payments.json";
import enrollmentsJson from "@/data/enrollments.json";
import communitySubscriptionsJson from "@/data/community_subscriptions.json";
import reviewsJson from "@/data/reviews.json";
import withdrawalsJson from "@/data/withdrawals.json";
import settingsJson from "@/data/settings.json";
import couponsJson from "@/data/coupons.json";
import favoritesJson from "@/data/favorites.json";
import type {
  Category,
  Course,
  Creator,
  Student,
  Admin,
  AnyUser,
  Community,
  CommunityPost,
  PostComment,
  PostReaction,
  Payment,
  Enrollment,
  CommunitySubscription,
  Review,
  WithdrawalRequest,
  Setting,
  PlatformSettings,
  Coupon,
  Favorite,
  FavoritableType,
  ReviewableType
} from "./types";

export const categories = categoriesJson as Category[];
export const creators = creatorsJson as Creator[];
export const courses = coursesJson as Course[];
export const students = studentsJson as Student[];
export const admins = adminsJson as Admin[];
export const communities = communitiesJson as Community[];
export const posts = postsJson as CommunityPost[];
export const comments = commentsJson as PostComment[];
export const reactions = reactionsJson as PostReaction[];
export const payments = paymentsJson as Payment[];
export const enrollments = enrollmentsJson as Enrollment[];
export const communitySubscriptions = communitySubscriptionsJson as CommunitySubscription[];
export const reviews = reviewsJson as Review[];
export const withdrawals = withdrawalsJson as WithdrawalRequest[];
export const settings = settingsJson as Setting[];
export const coupons = couponsJson as Coupon[];
export const favorites = favoritesJson as Favorite[];

export const publishedCourses = courses.filter((c) => c.status === "published");
export const activeCommunities = communities.filter((c) => c.status === "active");

export function getCategoryById(id: string) {
  return categories.find((c) => c.id === id);
}
export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}
export function getCreatorById(id: string) {
  return creators.find((c) => c.id === id);
}
export function getCreatorBySlug(slug: string) {
  return creators.find((c) => c.slug === slug);
}
export function getCourseById(id: string) {
  return courses.find((c) => c.id === id);
}
export function getCourseBySlug(slug: string) {
  return courses.find((c) => c.slug === slug);
}
export function getCoursesByCreator(creatorId: string) {
  return courses.filter((c) => c.creatorId === creatorId);
}
export function getCoursesByCategory(categoryId: string) {
  return courses.filter((c) => c.categoryId === categoryId);
}
export function getCoursesByCommunity(communityId: string) {
  return courses.filter((c) => c.communityId === communityId);
}
export function getCommunitiesByCategory(categoryId: string) {
  return communities.filter((c) => c.categoryId === categoryId);
}
export function getStudentById(id: string) {
  return students.find((s) => s.id === id);
}
export function getUserById(id: string): AnyUser | undefined {
  return (
    (students.find((s) => s.id === id) as AnyUser | undefined) ??
    (creators.find((c) => c.id === id) as AnyUser | undefined) ??
    (admins.find((a) => a.id === id) as AnyUser | undefined)
  );
}
export function getCommunities() {
  return communities;
}
export function getCommunityBySlug(slug: string) {
  return communities.find((c) => c.slug === slug);
}
export function getCommunityByCreatorId(creatorId: string) {
  return communities.find((c) => c.creatorId === creatorId);
}
export function getCommunityById(id: string) {
  return communities.find((c) => c.id === id);
}
export function getPostsByCommunity(communityId: string) {
  return posts
    .filter((p) => p.communityId === communityId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface CommentNode extends PostComment {
  replies: CommentNode[];
}

export function getCommentsByPost(postId: string): CommentNode[] {
  const postComments = comments.filter((c) => c.postId === postId);
  const buildReplies = (parentId: string): CommentNode[] =>
    postComments
      .filter((c) => c.parentId === parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((c) => ({ ...c, replies: buildReplies(c.id) }));
  return postComments
    .filter((c) => c.parentId === null)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((c) => ({ ...c, replies: buildReplies(c.id) }));
}

export function getReactionsByPost(postId: string) {
  return reactions.filter((r) => r.postId === postId);
}

export function getActiveSubscription(studentId: string, communityId: string) {
  return communitySubscriptions.find(
    (s) =>
      s.studentId === studentId &&
      s.communityId === communityId &&
      s.status === "active" &&
      new Date(s.endsAt).getTime() > Date.now()
  );
}

export function isSubscribed(studentId: string, communityId: string) {
  return !!getActiveSubscription(studentId, communityId);
}

export function ownsCourseStandalone(studentId: string, courseId: string) {
  return enrollments.some((e) => e.studentId === studentId && e.courseId === courseId);
}

export function getSubscriptionsByStudent(studentId: string) {
  return communitySubscriptions.filter((s) => s.studentId === studentId);
}

export function canAccessCourse(studentId: string, course: Course) {
  if (course.communityId) {
    return isSubscribed(studentId, course.communityId);
  }
  return ownsCourseStandalone(studentId, course.id);
}

export function getPaymentsByCreator(creatorId: string) {
  const community = getCommunityByCreatorId(creatorId);
  return payments.filter((p) => {
    if (p.payableType === "community") {
      return community && p.payableId === community.id;
    }
    return getCourseById(p.payableId)?.creatorId === creatorId;
  });
}

export function getWithdrawalsByCreator(creatorId: string) {
  return withdrawals.filter((w) => w.creatorId === creatorId);
}

export function getReviewsFor(reviewableType: ReviewableType, reviewableId: string) {
  return reviews
    .filter((r) => r.reviewableType === reviewableType && r.reviewableId === reviewableId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getReviewsByCourse(courseId: string) {
  return getReviewsFor("course", courseId);
}

export function getRatingAverage(reviewableType: ReviewableType, reviewableId: string) {
  const list = getReviewsFor(reviewableType, reviewableId);
  if (list.length === 0) return 0;
  return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
}

export function getAverageRating(courseId: string) {
  const courseReviews = getReviewsByCourse(courseId);
  if (courseReviews.length === 0) {
    return getCourseById(courseId)?.ratingAverage ?? 0;
  }
  return courseReviews.reduce((sum, r) => sum + r.rating, 0) / courseReviews.length;
}

export function getCouponByCode(code: string) {
  return coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
}

export function isCouponValid(coupon: Coupon | undefined, forCreatorId?: string): coupon is Coupon {
  if (!coupon) return false;
  if (new Date(coupon.expiresAt).getTime() <= Date.now()) return false;
  if (forCreatorId && coupon.userId && coupon.userId !== forCreatorId) return false;
  return true;
}

export function getCouponsByCreator(creatorId: string) {
  return coupons.filter((c) => c.userId === creatorId);
}

export function getCommunityFinalPrice(community: Community) {
  if (community.isFree) return 0;
  const discounted = community.subscriptionPrice * (1 - community.discountPercentage / 100);
  return Math.round(discounted);
}

export interface CommunityPriceQuote {
  amount: number;
  couponApplied: boolean;
  couponInvalid: boolean;
}

export function resolveCommunityPrice(
  community: Community,
  couponCode: string | undefined,
  couponsList: Coupon[]
): CommunityPriceQuote {
  const base = getCommunityFinalPrice(community);
  if (!couponCode?.trim()) return { amount: base, couponApplied: false, couponInvalid: false };
  const coupon = couponsList.find((c) => c.code.toLowerCase() === couponCode.trim().toLowerCase());
  if (!isCouponValid(coupon, community.creatorId)) return { amount: base, couponApplied: false, couponInvalid: true };
  return {
    amount: Math.round(base * (1 - coupon.discountPercentage / 100)),
    couponApplied: true,
    couponInvalid: false
  };
}

export function getFavoritesByUser(userId: string) {
  return favorites.filter((f) => f.userId === userId);
}

export function isFavorited(userId: string, favoritableType: FavoritableType, favoritableId: string) {
  return favorites.some(
    (f) => f.userId === userId && f.favoritableType === favoritableType && f.favoritableId === favoritableId
  );
}

export function getTopCreators(limit = 4) {
  return [...creators].sort((a, b) => b.totalSales - a.totalSales).slice(0, limit);
}
export function getLatestCourses(limit = 8) {
  return [...publishedCourses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
export function getLatestCommunities(limit = 8) {
  return [...activeCommunities]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
export function allUsers() {
  return [...students, ...creators, ...admins];
}

export function flattenSettings(source: Setting[] = settings): PlatformSettings {
  const get = (key: string) => source.find((s) => s.key === key)?.value ?? "";
  return {
    platformNameEn: get("platform_name_en") || "Mujtamaaty",
    platformNameAr: get("platform_name_ar") || "مجتمعاتي",
    logoInitials: get("logo_initials") || "مج",
    commissionRate: Number(get("commission_rate") || 20),
    defaultLang: (get("default_language") as "ar" | "en") || "ar",
    currency: get("default_currency") || "EGP",
    paymentGateway: get("payment_gateway") || "Paymob"
  };
}

export function getSetting(key: string, source: Setting[] = settings) {
  return source.find((s) => s.key === key);
}
