export type Role = "student" | "creator" | "admin";
export type AccountStatus = "active" | "suspended";
export type AccentKey =
  | "teal"
  | "gold"
  | "clay"
  | "ink"
  | "moss"
  | "plum"
  | "sand"
  | "rust";

export interface BaseUser {
  id: string;
  name: string;
  email: string;
  avatarAccent: AccentKey;
  role: Role;
  status: AccountStatus;
  phoneNumber?: string;
  profileImage?: string;
  preferredLanguage: "ar" | "en";
  createdAt: string;
}

export interface Student extends BaseUser {
  role: "student";
}

export interface Creator extends BaseUser {
  role: "creator";
  slug: string;
  bioEn: string;
  bioAr: string;
  coverAccent: AccentKey;
  coverImage?: string;
  verified: boolean;
  balance: number;
  totalSales: number;
  commissionRate: number;
}

export interface Admin extends BaseUser {
  role: "admin";
}

export type AnyUser = Student | Creator | Admin;

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  status: "active" | "inactive";
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  order: number;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  youtubeUrl: string;
  durationMinutes: number;
  isFree: boolean;
}

export type CourseStatus = "published" | "draft";

export interface Course {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  categoryId: string;
  creatorId: string;
  communityId: string | null;
  price: number;
  discountPercentage: number;
  accent: AccentKey;
  image?: string;
  introVideoUrl: string;
  status: CourseStatus;
  studentsCount: number;
  ratingAverage: number;
  createdAt: string;
  updatedAt: string;
  lessons: Lesson[];
}

export type ReviewableType = "course" | "community";

export interface Review {
  id: string;
  studentId: string;
  reviewableType: ReviewableType;
  reviewableId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  communityId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  removed?: boolean;
}

export interface PostComment {
  id: string;
  postId: string;
  userId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
}

export type ReactionType = "like";

export interface PostReaction {
  id: string;
  postId: string;
  userId: string;
  type: ReactionType;
  createdAt: string;
}

export type CommunityType = "public" | "private";
export type CommunityStatus = "active" | "inactive";

export interface Community {
  id: string;
  slug: string;
  creatorId: string;
  categoryId: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  coverImage?: string | null;
  type: CommunityType;
  status: CommunityStatus;
  isFree: boolean;
  subscriptionPrice: number;
  discountPercentage: number;
  subscriptionDurationDays: number;
  createdAt: string;
}

export type PayableType = "course" | "community";
export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentMethod = "card" | "wallet";

export interface Payment {
  id: string;
  studentId: string;
  payableType: PayableType;
  payableId: string;
  amount: number;
  currency: string;
  paymobOrderId: string;
  paymobTransactionId: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  paidAt?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  paymentId: string;
  pricePaid: number;
  platformCommission: number;
  creatorEarning: number;
  enrolledAt: string;
}

export type SubscriptionStatus = "active" | "expired" | "cancelled";

export interface CommunitySubscription {
  id: string;
  studentId: string;
  communityId: string;
  paymentId: string;
  pricePaid: number;
  platformCommission: number;
  creatorEarning: number;
  startsAt: string;
  endsAt: string;
  status: SubscriptionStatus;
  createdAt: string;
}

export type PayoutMethod = "vodafone_cash" | "instapay";
export type WithdrawalStatus = "pending" | "approved" | "rejected";

export interface WithdrawalRequest {
  id: string;
  creatorId: string;
  amount: number;
  payoutMethod: PayoutMethod;
  payoutAccountNumber: string;
  status: WithdrawalStatus;
  adminPaymentProof?: string;
  requestedAt: string;
  processedAt?: string;
}

export interface Coupon {
  id: string;
  userId: string | null;
  code: string;
  discountPercentage: number;
  expiresAt: string;
  createdAt: string;
}

export type FavoritableType = "course" | "community";

export interface Favorite {
  id: string;
  userId: string;
  favoritableType: FavoritableType;
  favoritableId: string;
  createdAt: string;
}

export type MediableType = "post";

export interface Media {
  id: string;
  mediableType: MediableType;
  mediableId: string;
  collectionName: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export type SettingType = "string" | "number" | "boolean" | "json";

export interface Setting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  group: string;
  isPublic: boolean;
}

export interface PlatformSettings {
  platformNameEn: string;
  platformNameAr: string;
  logoInitials: string;
  commissionRate: number;
  defaultLang: "ar" | "en";
  currency: string;
  paymentGateway: string;
}
