"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AnyUser, Role } from "./types";
import type { Locale } from "./i18n/config";
import {
  apiFetch,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  getCachedUser,
  setCachedUser,
  clearCachedUser,
  getCachedSettings,
  setCachedSettings,
  getCachedMyAccess,
  setCachedMyAccess,
  clearCachedMyAccess,
  type CachedMyAccess,
  type ReactionResult,
  ApiError,
  readApiMessage,
} from "./api-client";
import type {
  ApiUser,
  ApiCreatorCommunity,
  CreatorCommunity,
  ApiCreatorCourseUpdate,
  CreatorCourseUpdateResult,
  ApiCreatorLessonUpdate,
  CreatorLessonUpdateResult,
  ApiCreatorLessonListResponse,
  ApiCreatorCoupon,
  CreatorCoupon,
  CreatorCouponsPage,
  ApiCreatorReview,
  CreatorReview,
  ApiCreatorReviewListResponse,
  ApiFeedPost,
  FeedPost,
  ApiFeedCommentListItem,
  FeedComment,
  ApiFeedCommentRepliesResponse,
  ApiFeedReaction,
  FeedReaction,
  ReactionType,
  ApiCreatorDashboard,
  CreatorDashboardSummary,
  ApiCreatorEarningsSummary,
  CreatorEarningsSummary,
  ApiCreatorSale,
  CreatorSale,
  ApiCreatorWithdrawal,
  CreatorWithdrawal,
  ApiCreatorWithdrawalDetails,
  CreatorWithdrawalDetails,
  PayoutMethod,
  ApiCommunitySubscriber,
  CommunitySubscriber,
  ApiSettings,
  PlatformSettings,
  ApiNotification,
  AppNotification,
  LessonVideo,
  ApiPaymentSession,
  PaymentSession,
  ApiCommunitySummary,
  CommunitySummary,
  ApiCourseSummary,
  CourseSummary,
  ApiCommunityDetails,
  CommunityDetails,
  ApiCourseDetails,
  CourseDetails,
} from "./api-types";
import {
  mapApiUserToLocal,
  mapApiCreatorCommunity,
  mapApiCreatorCourseUpdate,
  mapApiCreatorLessonUpdate,
  mapApiCreatorCoupon,
  mapApiCreatorReview,
  mapApiFeedPost,
  mapApiFeedComment,
  mapApiFeedReaction,
  mapApiCreatorDashboard,
  mapApiCreatorEarningsSummary,
  mapApiCreatorSale,
  mapApiCreatorWithdrawal,
  mapApiCreatorWithdrawalDetails,
  mapApiCommunitySubscriber,
  mapApiSettings,
  mergePlatformSettings,
  mapApiNotification,
  mapApiPaymentSession,
  mapApiCommunitySummary,
  mapApiCourseSummary,
  mapApiCommunityDetails,
  mapApiCourseDetails,
} from "./api-types";

interface RegisterApiInput {
  name: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  type: "student" | "creator";
}

interface AuthContextValue {
  user: AnyUser | null;
  apiUser: ApiUser | null;
  role: Role | "guest";
  hydrated: boolean;
  // False until the mount effect has synced token (localStorage ↔ cookie) and
  // reconciled apiUser against it — feed/comments/reactions must wait for this
  // on refresh, otherwise child effects can fire before the Bearer is ready.
  sessionReady: boolean;
  login: (email: string, password: string, locale: Locale) => Promise<AnyUser>;
  register: (input: RegisterApiInput, locale: Locale) => Promise<AnyUser>;
  logout: (locale: Locale) => void;
  forgotPassword: (email: string, locale: Locale) => Promise<void>;
  verifyResetCode: (email: string, code: string, locale: Locale) => Promise<void>;
  resetPassword: (
    input: {
      email: string;
      code: string;
      password: string;
      passwordConfirmation: string;
    },
    locale: Locale,
  ) => Promise<void>;
  changePassword: (
    input: {
      oldPassword: string;
      newPassword: string;
      newPasswordConfirmation: string;
    },
    locale: Locale,
  ) => Promise<void>;
  updateProfile: (
    input: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      image?: File;
      bio?: string;
      coverImage?: File;
    },
    locale: Locale,
  ) => Promise<void>;
  submitContactUs: (
    input: { name: string; email: string; phone?: string; message: string },
    locale: Locale,
  ) => Promise<string>;
  checkCoupon: (
    input: { creatorId: string; code: string },
    locale: Locale,
  ) => Promise<{ id: string; discountPercentage: number }>;
  createCommunitySubscription: (
    communityId: string,
    couponCode: string | undefined,
    locale: Locale,
  ) => Promise<PaymentSession>;
  createCourseEnrollment: (
    courseId: string,
    couponCode: string | undefined,
    locale: Locale,
  ) => Promise<PaymentSession>;
  getMySubscriptions: (
    locale: Locale,
    page?: number,
  ) => Promise<{ items: CommunitySummary[]; total: number; currentPage: number; lastPage: number; perPage: number }>;
  getMyEnrolledCourses: (
    locale: Locale,
    page?: number,
  ) => Promise<{ items: CourseSummary[]; total: number; currentPage: number; lastPage: number; perPage: number }>;
  createReview: (
    input: {
      id: string;
      type: "community" | "course";
      rating: number;
      comment?: string;
    },
    locale: Locale,
  ) => Promise<void>;
  saveCommunity: (
    input: {
      categoryId: string;
      name: string;
      description?: string;
      coverImage?: File;
      type: "public" | "private";
      isFree: boolean;
      subscriptionPrice?: number;
      discountPercentage?: number;
      subscriptionDurationDays?: number;
    },
    existingId: string | null,
    locale: Locale,
  ) => Promise<CreatorCommunity>;
  getMyCommunity: (locale: Locale) => Promise<CreatorCommunity | null>;
  getMyCommunities: (locale: Locale) => Promise<CreatorCommunity[]>;
  getMyCourses: (locale: Locale) => Promise<CreatorCourseUpdateResult[]>;
  getCourseByCreator: (
    courseId: string,
    locale: Locale,
  ) => Promise<CreatorCourseUpdateResult | null>;
  createCourse: (
    input: {
      categoryId: string;
      title: string;
      description?: string;
      image?: File;
      price?: number;
      discountPercentage?: number;
      introVideoUrl?: string;
      isFree?: boolean;
    },
    locale: Locale,
  ) => Promise<CreatorCourseUpdateResult>;
  updateCourseByCreator: (
    courseId: string,
    input: {
      categoryId?: string;
      title?: string;
      description?: string;
      image?: File;
      price?: number;
      discountPercentage?: number;
      introVideoUrl?: string;
      isFree?: boolean;
    },
    locale: Locale,
  ) => Promise<CreatorCourseUpdateResult>;
  deleteCourseByCreator: (courseId: string, locale: Locale) => Promise<void>;
  getLessonsByCourse: (
    courseId: string,
    locale: Locale,
  ) => Promise<CreatorLessonUpdateResult[]>;
  getLessonByCreator: (
    lessonId: string,
    locale: Locale,
  ) => Promise<CreatorLessonUpdateResult | null>;
  getLessonVideo: (
    lessonId: string,
    locale: Locale,
  ) => Promise<LessonVideo | null>;
  createLesson: (
    courseId: string,
    input: {
      title: string;
      description?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
      attachments?: File[];
    },
    locale: Locale,
  ) => Promise<CreatorLessonUpdateResult>;
  updateLessonByCreator: (
    lessonId: string,
    input: {
      title?: string;
      description?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
      status?: "active" | "inactive";
      attachments?: File[];
    },
    locale: Locale,
  ) => Promise<CreatorLessonUpdateResult>;
  deleteLessonByCreator: (lessonId: string, locale: Locale) => Promise<void>;
  getMyCoupons: (locale: Locale, page?: number) => Promise<CreatorCouponsPage>;
  getCouponByCreator: (
    couponId: string,
    locale: Locale,
  ) => Promise<CreatorCoupon | null>;
  saveCreatorCoupon: (
    input: {
      code: string;
      discountPercentage: number;
      limitUses?: number;
      expiredAt?: string;
    },
    existingId: string | null,
    locale: Locale,
  ) => Promise<CreatorCoupon>;
  deleteCouponByCreator: (couponId: string, locale: Locale) => Promise<void>;
  getMyReviews: (locale: Locale) => Promise<CreatorReview[]>;
  getReviewByCreator: (
    reviewId: string,
    locale: Locale,
  ) => Promise<CreatorReview | null>;
  moderateReview: (
    reviewId: string,
    approved: boolean,
    locale: Locale,
  ) => Promise<void>;
  deleteReviewByCreator: (reviewId: string, locale: Locale) => Promise<void>;
  getCommunityPosts: (
    communityId: string,
    locale: Locale,
    page?: number,
  ) => Promise<{
    items: FeedPost[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  }>;
  createCommunityPost: (
    communityId: string,
    input: { content: string; media?: File[] },
    locale: Locale,
  ) => Promise<string>;
  getPost: (postId: string, locale: Locale) => Promise<FeedPost>;
  updatePost: (
    postId: string,
    input: { content: string; media?: File[]; removedMediaUrls?: string[] },
    locale: Locale,
  ) => Promise<string>;
  deletePost: (postId: string, locale: Locale) => Promise<void>;
  togglePinPost: (postId: string, locale: Locale) => Promise<boolean>;
  getPostComments: (
    postId: string,
    locale: Locale,
    page?: number,
  ) => Promise<{
    items: FeedComment[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  }>;
  addComment: (postId: string, content: string, locale: Locale) => Promise<string>;
  updateComment: (commentId: string, content: string, locale: Locale) => Promise<string>;
  deleteComment: (commentId: string, locale: Locale) => Promise<string>;
  getCommentReplies: (commentId: string, locale: Locale) => Promise<FeedComment[]>;
  addReply: (commentId: string, content: string, locale: Locale) => Promise<string>;
  getPostReactions: (
    postId: string,
    locale: Locale,
    page?: number,
  ) => Promise<{
    items: FeedReaction[];
    total: number;
    currentPage: number;
    lastPage: number;
    perPage: number;
  }>;
  addReaction: (postId: string, type: ReactionType, locale: Locale) => Promise<ReactionResult>;
  removeReaction: (postId: string, locale: Locale) => Promise<ReactionResult>;
  getCreatorDashboard: (locale: Locale) => Promise<CreatorDashboardSummary>;
  getEarningsSummary: (locale: Locale) => Promise<CreatorEarningsSummary>;
  getEarningsSales: (
    locale: Locale,
    page?: number,
  ) => Promise<{ items: CreatorSale[]; total: number; currentPage: number; lastPage: number; perPage: number }>;
  getWithdrawBalance: (locale: Locale) => Promise<number>;
  getWithdrawals: (
    locale: Locale,
    page?: number,
  ) => Promise<{ items: CreatorWithdrawal[]; total: number; currentPage: number; lastPage: number; perPage: number }>;
  createWithdrawal: (
    input: { amount: number; payoutMethod: PayoutMethod; payoutAccountNumber: string },
    locale: Locale,
  ) => Promise<void>;
  getWithdrawalDetails: (withdrawId: string, locale: Locale) => Promise<CreatorWithdrawalDetails | null>;
  deleteWithdrawal: (withdrawId: string, locale: Locale) => Promise<void>;
  getCommunitySubscribers: (
    communityId: string,
    locale: Locale,
    page?: number,
  ) => Promise<{ items: CommunitySubscriber[]; total: number; currentPage: number; lastPage: number; perPage: number }>;
  fetchCommunityDetails: (communityId: string, locale: Locale) => Promise<CommunityDetails | null>;
  fetchCourseDetails: (courseId: string, locale: Locale) => Promise<CourseDetails | null>;
  isSubscribed: (communityId: string) => boolean;
  ownsCourseStandalone: (courseId: string) => boolean;
  getCommunitySubscriptionDates: (communityId: string) => { startAt: string; endAt: string } | null;
  myAccessResolved: boolean;
  myAccessLoaded: boolean;
  toggleFavorite: (
    favoritableType: "course" | "community",
    favoritableId: string,
    locale: Locale,
  ) => Promise<boolean>;
  settings: PlatformSettings | null;
  unreadNotificationsCount: number;
  refreshUnreadNotificationsCount: (locale: Locale) => Promise<void>;
  getNotifications: (
    locale: Locale,
    page?: number,
  ) => Promise<{ items: AppNotification[]; total: number; currentPage: number; lastPage: number; perPage: number }>;
  markNotificationRead: (id: string, locale: Locale) => Promise<void>;
  markAllNotificationsRead: (locale: Locale) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  locale = "en",
  initialUser = null,
  initialMyAccess = null,
  initialSettings = null,
}: {
  children: ReactNode;
  locale?: Locale;
  // Resolved server-side (see app/[locale]/layout.tsx) from the cached-user
  // cookie, so the very first HTML sent to the browser already reflects the
  // signed-in state instead of guest — this is what actually removes the
  // refresh flash rather than just racing to hide it after the fact.
  initialUser?: ApiUser | null;
  // Same idea, one level down: the last-known subscribed-communities/
  // enrolled-courses set, resolved server-side from its own cookie (see
  // MY_ACCESS_CACHE_COOKIE) rather than only ever being available client-side
  // via localStorage — reading localStorage from a useState initializer still
  // renders "not loaded yet" in the server HTML (no window during SSR), then
  // flips once the client hydrates and finds the real cache, which is its own
  // visible flicker distinct from the network-fetch one. Sourcing the very
  // first render from a cookie instead means server and client agree from
  // the start, so there's nothing to flip.
  initialMyAccess?: CachedMyAccess | null;
  // Platform branding (logo, name, currency…) resolved server-side so the
  // navbar/footer logo is correct on first paint instead of flashing the
  // text fallback while a client-side /settings fetch is in flight.
  initialSettings?: PlatformSettings | null;
}) {
  const [apiUser, setApiUser] = useState<ApiUser | null>(initialUser);
  // A non-null initialUser means the server already made a definitive call
  // from the cookie — nothing left to resolve before first paint. A null
  // initialUser is ambiguous (genuine guest, or a stale/missing cookie
  // while localStorage still has a live session) and still needs the mount
  // effect below to check localStorage before anything gates on it.
  const [hydrated, setHydrated] = useState(initialUser !== null);
  // Must start false on server and client alike — initializing from getAuthToken()
  // on the client only made the feed render <section> while SSR still showed
  // PageLoader, triggering a hydration mismatch on refresh.
  const [sessionReady, setSessionReady] = useState(initialUser !== null);
  const [settings, setSettings] = useState<PlatformSettings | null>(initialSettings);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // On mount, hydrate synchronously from the cached profile first (no network
  // wait) so a page refresh renders the logged-in UI immediately instead of
  // flashing "guest" for the round-trip time of a GET /auth/profile call —
  // that flash-then-flip was the actual bug being fixed here. The cached
  // profile is still re-verified against the real backend right after, in
  // the background, since a token can outlive the session it belongs to
  // (e.g. after it's revoked elsewhere) — but that check no longer gates
  // what the user sees on first paint, only whether it might quietly correct
  // itself a moment later.
  useEffect(() => {
    const token = getAuthToken();

    // A cached "logged in" snapshot (from the SSR cookie or localStorage)
    // is only ever meaningful alongside a real token — without one, there's
    // nothing to actually authenticate any request with, so the UI must not
    // keep showing someone as signed in. This was the actual bug behind
    // "the navbar shows me logged in, but every real action says I need to
    // log in": initialUser (from the cookie) could be non-null while the
    // token was missing/cleared, and since verify() below used to bail out
    // silently whenever there was no token, that stale cached apiUser was
    // never corrected — it just stuck around indefinitely (the cookie
    // lives for a year) with nothing to back it up.
    if (!token && apiUser) {
      setApiUser(null);
    }

    if (!hydrated) {
      const cached = token ? getCachedUser<ApiUser>() : null;
      if (cached) setApiUser(cached);
      setHydrated(true);
    }

    setSessionReady(true);

    let cancelled = false;
    async function verify() {
      if (!token) return;
      try {
        const res = await apiFetch<{ data: ApiUser }>("/auth/profile", {
          method: "GET",
          locale,
          auth: true,
        });
        if (!cancelled) setApiUser(res.data);
      } catch (err) {
        if (cancelled) return;
        // Only a confirmed 401 means the token itself is actually invalid —
        // anything else (a network blip, a slow/timed-out request, a 5xx from
        // the backend) is a transient failure that says nothing about whether
        // the session is still good, and clearing the token on every refresh
        // that happens to hit one of those was logging real, still-valid
        // sessions out for no reason. The cached user (already showing) is
        // simply left in place until the next successful check confirms it.
        if (err instanceof ApiError && err.status === 401) {
          clearAuthToken();
          setApiUser(null);
        }
      }
    }
    verify();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keeps the cache in lockstep with every place apiUser changes (hydrate,
  // login, register, profile update, logout) without needing to touch each
  // of those call sites individually.
  useEffect(() => {
    if (apiUser) setCachedUser(apiUser);
    else clearCachedUser();
  }, [apiUser]);

  // Public, unauthenticated — cached in localStorage for SETTINGS_CACHE_TTL_MS
  // (see api-client.ts) so a fresh page load reuses the last fetch instead of
  // re-requesting every single time; once that window passes, the cache is
  // treated as a miss and this refetches, keeping settings eventually in
  // sync with anything an admin changes.
  useEffect(() => {
    let cancelled = false;
    const applySettings = (raw: ApiSettings) => {
      if (cancelled) return;
      setSettings((prev) =>
        mergePlatformSettings(prev ?? initialSettings, mapApiSettings(raw))
      );
    };
    const cached = getCachedSettings<ApiSettings>();
    if (cached) {
      applySettings(cached);
      return;
    }
    apiFetch<{ data: ApiSettings }>("/settings", { method: "GET", locale, auth: false })
      .then((res) => {
        if (!cancelled) {
          applySettings(res.data);
          setCachedSettings(res.data);
        }
      })
      .catch(() => {
        // Settings are cosmetic (currency label, footer social icons, about
        // page) — silently keep the defaults rather than surfacing an error.
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getUnreadNotificationsCount = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: { unread_count: number } }>(
      "/notifications/unread-count",
      { method: "GET", locale: requestLocale },
    );
    return res.data.unread_count;
  }, []);

  const refreshUnreadNotificationsCount = useCallback(
    async (requestLocale: Locale) => {
      if (!apiUser) {
        setUnreadNotificationsCount(0);
        return;
      }
      try {
        setUnreadNotificationsCount(await getUnreadNotificationsCount(requestLocale));
      } catch {
        // Badge just doesn't update this cycle — not worth surfacing.
      }
    },
    [apiUser, getUnreadNotificationsCount],
  );

  // Polls the unread badge while someone's logged in, on top of the
  // immediate refreshes triggered by opening the bell / marking things read
  // — a "professional" notifications bell reacting to a lesson/course
  // published elsewhere without needing a manual page refresh.
  useEffect(() => {
    if (!hydrated || !apiUser) {
      setUnreadNotificationsCount(0);
      return;
    }
    refreshUnreadNotificationsCount(locale);
    const interval = setInterval(() => refreshUnreadNotificationsCount(locale), 60000);
    return () => clearInterval(interval);
  }, [hydrated, apiUser, locale, refreshUnreadNotificationsCount]);

  const getNotifications = useCallback(async (requestLocale: Locale, page = 1) => {
    const res = await apiFetch<{
      data: { items: ApiNotification[]; total: number; currentPage: number; lastPage: number; perPage: number };
    }>(`/notifications?page=${page}`, { method: "GET", locale: requestLocale });
    return { ...res.data, items: res.data.items.map(mapApiNotification) };
  }, []);

  const markNotificationRead = useCallback(async (id: string, requestLocale: Locale) => {
    await apiFetch(`/notifications/${id}/read`, { method: "PUT", locale: requestLocale });
    setUnreadNotificationsCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllNotificationsRead = useCallback(async (requestLocale: Locale) => {
    await apiFetch("/notifications/mark-all-read", { method: "PUT", locale: requestLocale });
    setUnreadNotificationsCount(0);
  }, []);

  const login = useCallback(
    async (email: string, password: string, requestLocale: Locale) => {
      const form = new FormData();
      form.set("email", email);
      form.set("password", password);
      const res = await apiFetch<{ data: ApiUser & { token: string } }>(
        "/auth/login",
        {
          method: "POST",
          body: form,
          locale: requestLocale,
          auth: false,
        },
      );
      setAuthToken(res.data.token);
      setApiUser(res.data);
      return mapApiUserToLocal(res.data);
    },
    [],
  );

  // Auto-authenticates on successful registration, using the token the
  // register response already includes — same shape and handling as login's
  // own response. (An earlier round deliberately kept these as two separate
  // steps per the client's own instruction at the time; this round reverses
  // that explicitly — a freshly-registered account now lands signed in.)
  const register = useCallback(
    async (input: RegisterApiInput, requestLocale: Locale) => {
      const form = new FormData();
      form.set("name", input.name);
      form.set("email", input.email);
      form.set("password", input.password);
      form.set("password_confirmation", input.passwordConfirmation);
      form.set("type", input.type);
      const res = await apiFetch<{ data: ApiUser & { token: string } }>(
        "/auth/register",
        {
          method: "POST",
          body: form,
          locale: requestLocale,
          auth: false,
        },
      );
      setAuthToken(res.data.token);
      setApiUser(res.data);
      return mapApiUserToLocal(res.data);
    },
    [],
  );

  const logout = useCallback((requestLocale: Locale) => {
    // Best-effort — the token might already be gone server-side; either way
    // we clear local state regardless of whether this call succeeds.
    apiFetch("/auth/logout", { method: "POST", locale: requestLocale }).catch(
      () => {},
    );
    clearAuthToken();
    setApiUser(null);
  }, []);

  const changePassword = useCallback(
    async (
      input: {
        oldPassword: string;
        newPassword: string;
        newPasswordConfirmation: string;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("old_password", input.oldPassword);
      form.set("new_password", input.newPassword);
      form.set("new_password_confirmation", input.newPasswordConfirmation);
      await apiFetch("/auth/change-password", {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
    },
    [],
  );

  const updateProfile = useCallback(
    async (
      input: {
        name?: string;
        email?: string;
        phoneNumber?: string;
        image?: File;
        bio?: string;
        coverImage?: File;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (input.name) form.set("name", input.name);
      if (input.email) form.set("email", input.email);
      if (input.phoneNumber) form.set("phone_number", input.phoneNumber);
      if (input.image) form.set("image", input.image);
      if (input.bio) form.set("bio", input.bio);
      if (input.coverImage) form.set("cover_image", input.coverImage);
      const res = await apiFetch<{ data: ApiUser }>("/auth/profile", {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      setApiUser(res.data);
    },
    [],
  );

  // Code-based reset flow: forgot-password emails a 5-digit code (not a
  // link+token), verify-reset-code is an optional pre-check the UI uses to
  // validate the code before revealing the new-password fields, and
  // reset-password itself takes the code directly rather than a token.
  const forgotPassword = useCallback(
    async (email: string, requestLocale: Locale) => {
      const form = new FormData();
      form.set("email", email);
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        body: form,
        locale: requestLocale,
        auth: false,
      });
    },
    [],
  );

  const verifyResetCode = useCallback(
    async (email: string, code: string, requestLocale: Locale) => {
      const form = new FormData();
      form.set("email", email);
      form.set("code", code);
      await apiFetch("/auth/verify-reset-code", {
        method: "POST",
        body: form,
        locale: requestLocale,
        auth: false,
      });
    },
    [],
  );

  const resetPassword = useCallback(
    async (
      input: {
        email: string;
        code: string;
        password: string;
        passwordConfirmation: string;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("email", input.email);
      form.set("code", input.code);
      form.set("password", input.password);
      form.set("password_confirmation", input.passwordConfirmation);
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: form,
        locale: requestLocale,
        auth: false,
      });
    },
    [],
  );

  // POST /contact-us — no Authentication section in the spec, so this is
  // callable while logged out (matches how it's actually used, from the
  // public home page). Returns the backend's own success message, which
  // the caller shows verbatim in a confirmation popup rather than a
  // client-authored one.
  const submitContactUs = useCallback(
    async (
      input: { name: string; email: string; phone?: string; message: string },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("name", input.name);
      form.set("email", input.email);
      if (input.phone) form.set("phone", input.phone);
      form.set("message", input.message);
      const res = await apiFetch<{ message: string }>("/contact-us", {
        method: "POST",
        body: form,
        locale: requestLocale,
        auth: false,
      });
      return res.message;
    },
    [],
  );

  // Coupons/check requires auth (Bearer) per the spec, and its "Request Body"
  // table names one field (`code`) while the actual configured form-data keys
  // (the only concrete detail given — no worked curl example this time) list
  // two: `creator_id` and `coupon_code`. Went with the concrete form-data
  // fields over the prose table, same call made for every other endpoint in
  // this project — flagged back to the client either way.
  const checkCoupon = useCallback(
    async (
      input: { creatorId: string; code: string },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("creator_id", input.creatorId);
      form.set("coupon_code", input.code);
      const res = await apiFetch<{
        data: { id: number; discount_percentage: number };
      }>("/coupons/check", {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      return {
        id: String(res.data.id),
        discountPercentage: res.data.discount_percentage,
      };
    },
    [],
  );

  // POST /communities/{id}/subscribe and POST /courses/{id}/enroll both
  // create a Kashier-hosted checkout session rather than completing a
  // purchase directly — the caller's only job on a 201 is to redirect the
  // browser to the returned payment_url, same coupon_code convention as
  // /coupons/check (only sent at all once the checkout page's own coupon
  // check already confirmed it's valid).
  const createCommunitySubscription = useCallback(
    async (
      communityId: string,
      couponCode: string | undefined,
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (couponCode) form.set("coupon_code", couponCode);
      const res = await apiFetch<{ data: ApiPaymentSession }>(
        `/communities/${communityId}/subscribe`,
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return mapApiPaymentSession(res.data);
    },
    [],
  );

  const createCourseEnrollment = useCallback(
    async (
      courseId: string,
      couponCode: string | undefined,
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (couponCode) form.set("coupon_code", couponCode);
      const res = await apiFetch<{ data: ApiPaymentSession }>(
        `/courses/${courseId}/enroll`,
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return mapApiPaymentSession(res.data);
    },
    [],
  );

  // GET /communities/my-subscriptions — the student's own subscribed
  // communities, same item shape as the public GET /communities list (per
  // the client's own note), just scoped to "mine" and requiring auth.
  const getMySubscriptions = useCallback(
    async (requestLocale: Locale, page = 1) => {
      const res = await apiFetch<{
        data: { items: ApiCommunitySummary[]; total: number; currentPage: number; lastPage: number; perPage: number };
      }>(`/communities/my-subscriptions?page=${page}`, { method: "GET", locale: requestLocale });
      return { ...res.data, items: res.data.items.map(mapApiCommunitySummary) };
    },
    [],
  );

  // GET /courses/my-courses — the student's own individually-enrolled
  // standalone courses (bought via POST /courses/{id}/enroll, not through a
  // community subscription).
  const getMyEnrolledCourses = useCallback(
    async (requestLocale: Locale, page = 1) => {
      const res = await apiFetch<{
        data: { items: ApiCourseSummary[]; total: number; currentPage: number; lastPage: number; perPage: number };
      }>(`/courses/my-courses?page=${page}`, { method: "GET", locale: requestLocale });
      return { ...res.data, items: res.data.items.map(mapApiCourseSummary) };
    },
    [],
  );

  // GET /communities/details/{id} and GET /courses/details/{id} with Bearer
  // auth — is_subscribed / is_enrolled are only true on these responses when
  // the token is present. Used by useCommunitySubscription / useCourseEnrollment
  // instead of scanning my-subscriptions / my-courses lists for gate decisions.
  const fetchCommunityDetails = useCallback(async (communityId: string, requestLocale: Locale) => {
    try {
      const res = await apiFetch<{ data: ApiCommunityDetails }>(`/communities/details/${communityId}`, {
        method: "GET",
        locale: requestLocale,
      });
      return mapApiCommunityDetails(res.data);
    } catch {
      return null;
    }
  }, []);

  const fetchCourseDetails = useCallback(async (courseId: string, requestLocale: Locale) => {
    try {
      const res = await apiFetch<{ data: ApiCourseDetails }>(`/courses/details/${courseId}`, {
        method: "GET",
        locale: requestLocale,
      });
      return mapApiCourseDetails(res.data);
    } catch {
      return null;
    }
  }, []);

  // POST /reviews — same table-vs-formdata mismatch this project keeps hitting:
  // the prose "Request Body" table names reviewable_type/reviewable_id, but the
  // concrete "Body formdata" example (id/type/rating/comment) disagrees. Went
  // with the concrete formdata fields, same call made for coupons/check and
  // every other endpoint that's had this mismatch — flagged back to the client.
  const createReview = useCallback(
    async (
      input: {
        id: string;
        type: "community" | "course";
        rating: number;
        comment?: string;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("id", input.id);
      form.set("type", input.type);
      form.set("rating", String(input.rating));
      if (input.comment) form.set("comment", input.comment);
      await apiFetch("/reviews", {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
    },
    [],
  );

  // POST /creators/communities (create) and POST /creators/communities/{id}
  // (update) — same form, different URL depending on whether the creator
  // already has a community. Always sends the full form state rather than
  // diffing against what changed; every field on update is documented
  // optional, so this is equivalent to a partial update as long as the
  // caller only fills in fields it actually knows the current value of
  // (see CreatorCommunityForm's own comment on the description/category gap
  // — the public community-details endpoint doesn't return description or
  // category_id, so those are left out of the request entirely when unknown
  // rather than sent as blank/guessed values that could overwrite real data).
  const saveCommunity = useCallback(
    async (
      input: {
        categoryId: string;
        name: string;
        description?: string;
        coverImage?: File;
        type: "public" | "private";
        isFree: boolean;
        subscriptionPrice?: number;
        discountPercentage?: number;
        subscriptionDurationDays?: number;
      },
      existingId: string | null,
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (input.categoryId) form.set("category_id", input.categoryId);
      form.set("name", input.name);
      if (input.description) form.set("description", input.description);
      if (input.coverImage) form.set("cover_image", input.coverImage);
      form.set("type", input.type);
      form.set("is_free", input.isFree ? "1" : "0");
      if (!input.isFree && input.subscriptionPrice != null) {
        form.set("subscription_price", String(input.subscriptionPrice));
      }
      if (input.discountPercentage != null)
        form.set("discount_percentage", String(input.discountPercentage));
      if (input.subscriptionDurationDays != null) {
        form.set(
          "subscription_duration_days",
          String(input.subscriptionDurationDays),
        );
      }
      const path = existingId
        ? `/creators/communities/${existingId}`
        : "/creators/communities";
      const res = await apiFetch<{ data: ApiCreatorCommunity }>(path, {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      return mapApiCreatorCommunity(res.data);
    },
    [],
  );

  // GET /creators/communities — "each creator can only have one community"
  // per the create endpoint's own description, so this always returns at
  // most one item; takes the first if present. Added round 12, replacing
  // the getCreatorDetails+double-locale-getCommunityDetails workaround
  // CreatorCommunityForm used before this endpoint existed — this one
  // returns the real name/description (single, already-localized string —
  // no more ar/en split, backend collapsed it) and the real category_id
  // directly, closing every gap that workaround had.
  const getMyCommunity = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: ApiCreatorCommunity[] }>(
      "/creators/communities",
      {
        method: "GET",
        locale: requestLocale,
      },
    );
    return res.data[0] ? mapApiCreatorCommunity(res.data[0]) : null;
  }, []);

  // Same endpoint as getMyCommunity above, but returns the full list rather
  // than just the first item — the "My community" dashboard page now lists
  // every community a creator has (rather than assuming exactly one) with
  // its own create/edit pages, matching the same list+create+edit shape
  // already used for courses/coupons/lessons.
  const getMyCommunities = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: ApiCreatorCommunity[] }>(
      "/creators/communities",
      {
        method: "GET",
        locale: requestLocale,
      },
    );
    return res.data.map(mapApiCreatorCommunity);
  }, []);

  // GET /creators/courses — replaces the getCreatorDetails+per-course
  // getCourseDetails N+1 workaround CreatorCoursesView used before this
  // endpoint existed (round 10). Still no category anywhere in this shape.
  const getMyCourses = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: ApiCreatorCourseUpdate[] }>(
      "/creators/courses",
      {
        method: "GET",
        locale: requestLocale,
      },
    );
    return res.data.map(mapApiCreatorCourseUpdate);
  }, []);

  // GET /creators/courses/{id} — creator-scoped equivalent of the public
  // GET /courses/details/{id} used for prefill before this endpoint
  // existed (round 10). Being creator-scoped, the backend itself enforces
  // ownership (a course that isn't this creator's own 404s), so callers no
  // longer need their own manual creator-id comparison. Fails soft to null
  // on any error (404 included) — same "not found" outcome either way from
  // the caller's point of view.
  const getCourseByCreator = useCallback(
    async (courseId: string, requestLocale: Locale) => {
      try {
        const res = await apiFetch<{ data: ApiCreatorCourseUpdate }>(
          `/creators/courses/${courseId}`,
          {
            method: "GET",
            locale: requestLocale,
          },
        );
        return mapApiCreatorCourseUpdate(res.data);
      } catch {
        return null;
      }
    },
    [],
  );

  // POST /creators/courses — create, added round 12 (previously
  // NewCourseView just showed a "not connected" notice). Required fields
  // per the spec's own table: title, category_id — same table-vs-formdata
  // mismatch as the update endpoint (discount_percentage/intro_video_url/
  // `image` not `cover_image`), resolved the same way.
  const createCourse = useCallback(
    async (
      input: {
        categoryId: string;
        title: string;
        description?: string;
        image?: File;
        price?: number;
        discountPercentage?: number;
        introVideoUrl?: string;
        isFree?: boolean;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("category_id", input.categoryId);
      form.set("title", input.title);
      if (input.description) form.set("description", input.description);
      if (input.image) form.set("image", input.image);
      if (input.price != null) form.set("price", String(input.price));
      if (input.discountPercentage != null)
        form.set("discount_percentage", String(input.discountPercentage));
      if (input.introVideoUrl) form.set("intro_video_url", input.introVideoUrl);
      form.set("is_free", input.isFree ? "1" : "0");
      const res = await apiFetch<{ data: ApiCreatorCourseUpdate }>(
        "/creators/courses",
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return mapApiCreatorCourseUpdate(res.data);
    },
    [],
  );

  // POST /creators/courses/{id} — every field is optional and only sent when
  // actually provided, same partial-update safety as saveCommunity: a field
  // the caller doesn't know the current value of (category_id in practice —
  // see CreatorCommunityForm/EditCourseView's own notes on that gap) is just
  // left out of the request rather than sent as a blank/guessed value.
  const updateCourseByCreator = useCallback(
    async (
      courseId: string,
      input: {
        categoryId?: string;
        title?: string;
        description?: string;
        image?: File;
        price?: number;
        discountPercentage?: number;
        introVideoUrl?: string;
        isFree?: boolean;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (input.categoryId) form.set("category_id", input.categoryId);
      if (input.title != null) form.set("title", input.title);
      if (input.description != null) form.set("description", input.description);
      if (input.image) form.set("image", input.image);
      if (input.price != null) form.set("price", String(input.price));
      if (input.discountPercentage != null)
        form.set("discount_percentage", String(input.discountPercentage));
      if (input.introVideoUrl != null)
        form.set("intro_video_url", input.introVideoUrl);
      if (input.isFree != null) form.set("is_free", input.isFree ? "1" : "0");
      const res = await apiFetch<{ data: ApiCreatorCourseUpdate }>(
        `/creators/courses/${courseId}`,
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return mapApiCreatorCourseUpdate(res.data);
    },
    [],
  );

  const deleteCourseByCreator = useCallback(
    async (courseId: string, requestLocale: Locale) => {
      await apiFetch(`/creators/courses/${courseId}`, {
        method: "DELETE",
        locale: requestLocale,
      });
    },
    [],
  );

  // GET /creators/courses/{id}/lessons — replaces the "reuse the lessons
  // array embedded in the public GET /courses/details/{id}" workaround from
  // round 11, now that a dedicated creator-scoped list exists. Response
  // wraps the array as { items: [...] }, unlike the community/course list
  // endpoints. Fails soft to [] on error (a course with no lessons yet
  // looks the same to the UI as a fetch failure — both just show empty).
  const getLessonsByCourse = useCallback(
    async (courseId: string, requestLocale: Locale) => {
      try {
        const res = await apiFetch<{ data: ApiCreatorLessonListResponse }>(
          `/creators/courses/${courseId}/lessons`,
          {
            method: "GET",
            locale: requestLocale,
          },
        );
        return res.data.items.map(mapApiCreatorLessonUpdate);
      } catch {
        return [];
      }
    },
    [],
  );

  // GET /creators/courses/lessons/{id} — get one, used to fetch the
  // freshest bilingual data for a single lesson when opening its edit
  // modal, rather than relying on already-loaded list state.
  const getLessonByCreator = useCallback(
    async (lessonId: string, requestLocale: Locale) => {
      try {
        const res = await apiFetch<{ data: ApiCreatorLessonUpdate }>(
          `/creators/lessons/${lessonId}`,
          {
            method: "GET",
            locale: requestLocale,
          },
        );
        return mapApiCreatorLessonUpdate(res.data);
      } catch {
        return null;
      }
    },
    [],
  );

  // GET /lessons/{id} — authenticated, student-facing "watch this lesson"
  // endpoint. The backend now returns video_url AES-256-CBC encrypted, so
  // this goes through our own /api/lessons/{id} Route Handler instead of
  // calling the backend directly — that handler holds the decryption key
  // server-side and hands back an already-decrypted url. Still called only
  // from the dedicated per-lesson watch page's own client-side effect
  // (never passed down as a prop from a server-rendered page), same as
  // before.
  const getLessonVideo = useCallback(
    async (lessonId: string, requestLocale: Locale) => {
      try {
        const token = getAuthToken();
        if (!token) return null;
        const res = await fetch(`/api/lessons/${lessonId}?locale=${requestLocale}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) return null;
        const json = (await res.json()) as { data: LessonVideo };
        return json.data;
      } catch {
        return null;
      }
    },
    [],
  );

  // POST /creators/courses/{id}/lessons — create, added round 12
  // (previously the "Add lesson" button just showed a "not connected"
  // notice). This is the one course/lesson endpoint pair this round where
  // the table and the worked curl example actually agree on field names —
  // no mismatch to resolve here.
  const createLesson = useCallback(
    async (
      courseId: string,
      input: {
        title: string;
        description?: string;
        videoUrl?: string;
        duration?: number;
        order?: number;
        isFree?: boolean;
        attachments?: File[];
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("title", input.title);
      if (input.description) form.set("description", input.description);
      if (input.videoUrl) form.set("video_url", input.videoUrl);
      if (input.duration != null) form.set("duration", String(input.duration));
      if (input.order != null) form.set("order", String(input.order));
      if (input.isFree != null) form.set("is_free", input.isFree ? "1" : "0");
      // Confirmed live: the backend validates each indexed attachments[N]
      // file field individually (pdf/doc/docx/ppt/pptx/xls/xlsx/zip/jpg/
      // jpeg/png only) — a single "attachments[]" array field is not what's
      // expected here.
      input.attachments?.forEach((file, i) => form.append(`attachments[${i}]`, file));
      const res = await apiFetch<{ data: ApiCreatorLessonUpdate }>(
        `/creators/courses/${courseId}/lessons`,
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return mapApiCreatorLessonUpdate(res.data);
    },
    [],
  );

  const updateLessonByCreator = useCallback(
    async (
      lessonId: string,
      input: {
        title?: string;
        description?: string;
        videoUrl?: string;
        duration?: number;
        order?: number;
        isFree?: boolean;
        status?: "active" | "inactive";
        attachments?: File[];
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (input.title != null) form.set("title", input.title);
      if (input.description != null) form.set("description", input.description);
      if (input.videoUrl != null) form.set("video_url", input.videoUrl);
      if (input.duration != null) form.set("duration", String(input.duration));
      if (input.order != null) form.set("order", String(input.order));
      if (input.isFree != null) form.set("is_free", input.isFree ? "1" : "0");
      if (input.status) form.set("status", input.status);
      input.attachments?.forEach((file, i) => form.append(`attachments[${i}]`, file));
      const res = await apiFetch<{ data: ApiCreatorLessonUpdate }>(
        `/creators/lessons/${lessonId}`,
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return mapApiCreatorLessonUpdate(res.data);
    },
    [],
  );

  const deleteLessonByCreator = useCallback(
    async (lessonId: string, requestLocale: Locale) => {
      await apiFetch(`/creators/lessons/${lessonId}`, {
        method: "DELETE",
        locale: requestLocale,
      });
    },
    [],
  );

  // GET /creators/coupons — paginated (the spec's own example passes
  // ?page=2), same {items, total, currentPage, lastPage, perPage} shape as
  // the communities/creators list endpoints.
  const getMyCoupons = useCallback(async (requestLocale: Locale, page = 1) => {
    const res = await apiFetch<{
      data: {
        items: ApiCreatorCoupon[];
        total: number;
        currentPage: number;
        lastPage: number;
        perPage: number;
      };
    }>(`/creators/coupons?page=${page}`, {
      method: "GET",
      locale: requestLocale,
    });
    return { ...res.data, items: res.data.items.map(mapApiCreatorCoupon) };
  }, []);

  const getCouponByCreator = useCallback(
    async (couponId: string, requestLocale: Locale) => {
      try {
        const res = await apiFetch<{ data: ApiCreatorCoupon }>(
          `/creators/coupons/${couponId}`,
          {
            method: "GET",
            locale: requestLocale,
          },
        );
        return mapApiCreatorCoupon(res.data);
      } catch {
        return null;
      }
    },
    [],
  );

  // POST /creators/coupons (create) / POST /creators/coupons/{id} (update) —
  // the one creator-CRUD endpoint pair in this whole project where the
  // spec's table and worked curl example actually agree on field names, no
  // mismatch to resolve. `code`/`discount_percentage` required on create,
  // both optional on update (partial-update-safe, same as every other save*
  // function here).
  const saveCreatorCoupon = useCallback(
    async (
      input: {
        code: string;
        discountPercentage: number;
        limitUses?: number;
        expiredAt?: string;
      },
      existingId: string | null,
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("code", input.code);
      form.set("discount_percentage", String(input.discountPercentage));
      if (input.limitUses != null)
        form.set("limit_uses", String(input.limitUses));
      if (input.expiredAt) form.set("expired_at", input.expiredAt);
      const path = existingId
        ? `/creators/coupons/${existingId}`
        : "/creators/coupons";
      const res = await apiFetch<{ data: ApiCreatorCoupon }>(path, {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      return mapApiCreatorCoupon(res.data);
    },
    [],
  );

  const deleteCouponByCreator = useCallback(
    async (couponId: string, requestLocale: Locale) => {
      await apiFetch(`/creators/coupons/${couponId}`, {
        method: "DELETE",
        locale: requestLocale,
      });
    },
    [],
  );

  // GET /creators/reviews — no pagination fields documented in the response
  // (unlike coupons' {items, total, currentPage, lastPage, perPage}), just
  // { items: [...] } — treated as a single full list, same as lessons.
  // Fails soft to [] on error since it's the primary data source for a
  // whole dashboard page, not a side detail.
  const getMyReviews = useCallback(async (requestLocale: Locale) => {
    try {
      const res = await apiFetch<{ data: ApiCreatorReviewListResponse }>(
        "/creators/reviews",
        {
          method: "GET",
          locale: requestLocale,
        },
      );
      return res.data.items.map(mapApiCreatorReview);
    } catch {
      return [];
    }
  }, []);

  const getReviewByCreator = useCallback(
    async (reviewId: string, requestLocale: Locale) => {
      try {
        const res = await apiFetch<{ data: ApiCreatorReview }>(
          `/creators/reviews/${reviewId}`,
          {
            method: "GET",
            locale: requestLocale,
          },
        );
        return mapApiCreatorReview(res.data);
      } catch {
        return null;
      }
    },
    [],
  );

  // POST /creators/reviews/{id} — approve (is_approved=1) or reject (=0).
  // The spec's "Request Body" section doesn't explicitly say
  // multipart/form-data this time (unlike every other POST in this
  // project), but the worked curl example uses `--form`, so sent the same
  // way as everything else — trusting the concrete example, same rule as
  // every table/prose ambiguity so far. Response carries no data to map,
  // just {success, status, message} — caller updates local state itself.
  const moderateReview = useCallback(
    async (reviewId: string, approved: boolean, requestLocale: Locale) => {
      const form = new FormData();
      form.set("is_approved", approved ? "1" : "0");
      await apiFetch(`/creators/reviews/${reviewId}`, {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
    },
    [],
  );

  const deleteReviewByCreator = useCallback(
    async (reviewId: string, requestLocale: Locale) => {
      await apiFetch(`/creators/reviews/${reviewId}`, {
        method: "DELETE",
        locale: requestLocale,
      });
    },
    [],
  );

  // ---- Community feed: posts / comments / reactions ----
  // No 403 case is documented for GET /communities/{id}/posts (only 404 —
  // community not found), unlike every write action below (post/comment/
  // react all 403 if the caller isn't allowed) — so viewing a community's
  // feed is treated as open to anyone, and only the write actions need to
  // handle a 403 from the backend (surfaced to the caller as a normal
  // ApiError, same as everywhere else).
  // Paginated the same way as every other list endpoint in this project
  // ({items, total, currentPage, lastPage, perPage}) — the feed loads page 1
  // up front and fetches the next page only once the caller scrolls near the
  // bottom of the list (see RealCommunityFeedView's IntersectionObserver),
  // rather than fetching every post in the community up front.
  //
  // Deliberately NOT `auth: false` (despite the endpoint being open to
  // anyone) — every post's `my_reaction`/`is_owner` is computed by the
  // backend against whichever user the request is authenticated as, so
  // omitting the bearer token here made a logged-in viewer's own reaction
  // come back as null on every reload (confirmed live: reacting updates the
  // UI optimistically, then vanishes on refresh because the follow-up GET
  // never told the backend who was asking). `auth: true` (the apiFetch
  // default) only attaches the header when a token actually exists, so an
  // anonymous viewer's request is unaffected either way.
  const getCommunityPosts = useCallback(
    async (communityId: string, requestLocale: Locale, page = 1) => {
      type PostsPayload = {
        data: {
          items: ApiFeedPost[];
          total: number;
          currentPage: number;
          lastPage: number;
          perPage: number;
        };
      };
      const path = `/communities/${communityId}/posts?page=${page}`;
      const parse = (res: PostsPayload) => ({
        ...res.data,
        items: (res.data.items ?? []).map(mapApiFeedPost),
      });

      return parse(
        await apiFetch<PostsPayload>(path, {
          method: "GET",
          locale: requestLocale,
          auth: true,
        }),
      );
    },
    [],
  );

  const createCommunityPost = useCallback(
    async (
      communityId: string,
      input: { content: string; media?: File[] },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("content", input.content);
      input.media?.slice(0, 2).forEach((file, i) => form.set(`media[${i}]`, file));
      const res = await apiFetch<{ message?: string }>(`/communities/${communityId}/posts`, {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      return readApiMessage(res);
    },
    [],
  );

  const getPost = useCallback(async (postId: string, requestLocale: Locale) => {
    const res = await apiFetch<{ data: ApiFeedPost }>(`/posts/${postId}`, {
      method: "GET",
      locale: requestLocale,
      auth: true,
    });
    return mapApiFeedPost(res.data);
  }, []);

  const updatePost = useCallback(
    async (
      postId: string,
      input: { content: string; media?: File[]; removedMediaUrls?: string[] },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("content", input.content);
      input.media?.slice(0, 2).forEach((file, i) => form.set(`media[${i}]`, file));
      input.removedMediaUrls?.forEach((url, i) => form.set(`deleted_media_paths[${i}]`, url));
      const res = await apiFetch<{ message: string }>(`/posts/${postId}`, {
        method: "POST",
        body: form,
        locale: requestLocale,
        auth: true,
      });
      return res.message;
    },
    [],
  );

  const deletePost = useCallback(async (postId: string, requestLocale: Locale) => {
    await apiFetch(`/posts/${postId}`, { method: "DELETE", locale: requestLocale });
  }, []);

  // POST /posts/{id}/pin toggles — the response carries no pinned flag of
  // its own, only the status code says which way it went (201 = just
  // pinned, 200 = just unpinned, per the spec's own Responses table), same
  // signal style as favorites/toggle.
  const togglePinPost = useCallback(
    async (postId: string, requestLocale: Locale) => {
      const res = await apiFetch<{ status: number }>(`/posts/${postId}/pin`, {
        method: "POST",
        locale: requestLocale,
      });
      return res.status === 201;
    },
    [],
  );

  const getPostComments = useCallback(
    async (postId: string, requestLocale: Locale, page = 1) => {
      type CommentsPageData = {
        items?: ApiFeedCommentListItem[];
        comments?: ApiFeedCommentListItem[];
        total?: number;
        currentPage?: number;
        current_page?: number;
        lastPage?: number;
        last_page?: number;
        perPage?: number;
        per_page?: number;
      };
      type CommentsPayload = { data?: CommentsPageData };
      const path = `/posts/${postId}/comments?page=${page}`;

      const parsePage = (raw?: CommentsPageData) => {
        const source = raw?.items ?? raw?.comments ?? [];
        const items = source.flatMap((c) => {
          try {
            return [mapApiFeedComment(c)];
          } catch {
            return [];
          }
        });
        const currentPage = raw?.currentPage ?? raw?.current_page ?? page;
        const lastPage = raw?.lastPage ?? raw?.last_page ?? 1;
        return {
          items,
          total: raw?.total ?? items.length,
          currentPage,
          lastPage,
          perPage: raw?.perPage ?? raw?.per_page ?? items.length,
        };
      };

      const fetchPage = () =>
        apiFetch<CommentsPayload>(path, { method: "GET", locale: requestLocale, auth: true });

      const res = await fetchPage();
      return parsePage(res.data);
    },
    [],
  );

  const addComment = useCallback(
    async (postId: string, content: string, requestLocale: Locale) => {
      const form = new FormData();
      form.set("content", content);
      const res = await apiFetch<{ message?: string }>(`/posts/${postId}/comments`, {
        method: "POST",
        body: form,
        locale: requestLocale,
        auth: true,
      });
      return readApiMessage(res);
    },
    [],
  );

  const updateComment = useCallback(
    async (commentId: string, content: string, requestLocale: Locale) => {
      const form = new FormData();
      form.set("content", content);
      const res = await apiFetch<{ message?: string }>(`/comments/${commentId}`, {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      return readApiMessage(res);
    },
    [],
  );

  const deleteComment = useCallback(async (commentId: string, requestLocale: Locale) => {
    const res = await apiFetch<{ message?: string }>(`/comments/${commentId}`, {
      method: "DELETE",
      locale: requestLocale,
    });
    return readApiMessage(res);
  }, []);

  // GET /comments/{id}/replies — unlike the comments list, this wraps the
  // parent comment's own fields around a nested `replies` array rather than
  // an `{items}` list, so it's unwrapped differently here.
  const getCommentReplies = useCallback(
    async (commentId: string, requestLocale: Locale) => {
      const path = `/comments/${commentId}/replies`;
      const parseReplies = (raw?: ApiFeedCommentRepliesResponse) =>
        (raw?.replies ?? []).flatMap((c) => {
          try {
            return [mapApiFeedComment(c)];
          } catch {
            return [];
          }
        });

      const fetchReplies = () =>
        apiFetch<{ data?: ApiFeedCommentRepliesResponse }>(path, {
          method: "GET",
          locale: requestLocale,
          auth: true,
        });

      const res = await fetchReplies();
      return parseReplies(res.data);
    },
    [],
  );

  const addReply = useCallback(
    async (commentId: string, content: string, requestLocale: Locale) => {
      const form = new FormData();
      form.set("content", content);
      const res = await apiFetch<{ message?: string }>(`/comments/${commentId}/replies`, {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
      return readApiMessage(res);
    },
    [],
  );

  const getPostReactions = useCallback(
    async (postId: string, requestLocale: Locale, page = 1) => {
      const res = await apiFetch<{
        data: {
          items: ApiFeedReaction[];
          total: number;
          currentPage: number;
          lastPage: number;
          perPage: number;
        };
      }>(`/posts/${postId}/reactions?page=${page}`, {
        method: "GET",
        locale: requestLocale,
        auth: true,
      });
      return {
        ...res.data,
        items: (res.data?.items ?? []).map(mapApiFeedReaction),
      };
    },
    [],
  );

  const addReaction = useCallback(
    async (postId: string, type: ReactionType, requestLocale: Locale): Promise<ReactionResult> => {
      // Drop any existing row first before POST — switching reaction type
      // requires replacing the prior row on some backend builds.
      try {
        await apiFetch(`/posts/${postId}/reactions`, { method: "DELETE", locale: requestLocale, auth: true });
      } catch {
        // Nothing to delete — fine, continue to POST.
      }
      try {
        const form = new FormData();
        form.set("type", type);
        await apiFetch(`/posts/${postId}/reactions`, {
          method: "POST",
          body: form,
          locale: requestLocale,
          auth: true,
        });
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiError) return { ok: false, status: err.status, message: err.message };
        return { ok: false, status: 0, message: "Request failed" };
      }
    },
    [],
  );

  const removeReaction = useCallback(
    async (postId: string, requestLocale: Locale): Promise<ReactionResult> => {
      try {
        await apiFetch(`/posts/${postId}/reactions`, { method: "DELETE", locale: requestLocale, auth: true });
        return { ok: true };
      } catch (err) {
        if (err instanceof ApiError) return { ok: false, status: err.status, message: err.message };
        return { ok: false, status: 0, message: "Request failed" };
      }
    },
    [],
  );

  // GET /creators/dashboard — the general overview stats page. "Recent
  // sales" used to live on this page too (still does in the UI copy), but
  // that data properly belongs to the Earnings page's own sales list, which
  // is a real, paginated, per-sale breakdown — showing a second, different
  // "recent sales" here was redundant with it.
  const getCreatorDashboard = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: ApiCreatorDashboard }>("/creators/dashboard", {
      method: "GET",
      locale: requestLocale,
    });
    return mapApiCreatorDashboard(res.data);
  }, []);

  const getEarningsSummary = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: ApiCreatorEarningsSummary }>("/creators/earnings", {
      method: "GET",
      locale: requestLocale,
    });
    return mapApiCreatorEarningsSummary(res.data);
  }, []);

  const getEarningsSales = useCallback(async (requestLocale: Locale, page = 1) => {
    const res = await apiFetch<{
      data: { items: ApiCreatorSale[]; total: number; currentPage: number; lastPage: number; perPage: number };
    }>(`/creators/earnings/sales?page=${page}`, {
      method: "GET",
      locale: requestLocale,
    });
    return { ...res.data, items: res.data.items.map(mapApiCreatorSale) };
  }, []);

  const getWithdrawBalance = useCallback(async (requestLocale: Locale) => {
    const res = await apiFetch<{ data: { balance: number } }>("/creators/withdraws/balance", {
      method: "GET",
      locale: requestLocale,
    });
    return res.data.balance;
  }, []);

  const getWithdrawals = useCallback(async (requestLocale: Locale, page = 1) => {
    const res = await apiFetch<{
      data: { items: ApiCreatorWithdrawal[]; total: number; currentPage: number; lastPage: number; perPage: number };
    }>(`/creators/withdraws?page=${page}`, {
      method: "GET",
      locale: requestLocale,
    });
    return { ...res.data, items: res.data.items.map(mapApiCreatorWithdrawal) };
  }, []);

  // POST /creators/withdraws — the response only carries a slim
  // {id, amount, status, requested_at} confirmation, not the full row
  // shape the list endpoint returns, so callers reload the list afterward
  // rather than trying to splice this partial shape into it.
  const createWithdrawal = useCallback(
    async (
      input: { amount: number; payoutMethod: PayoutMethod; payoutAccountNumber: string },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("amount", String(input.amount));
      form.set("payout_method", input.payoutMethod);
      form.set("payout_account_number", input.payoutAccountNumber);
      await apiFetch("/creators/withdraws", {
        method: "POST",
        body: form,
        locale: requestLocale,
      });
    },
    [],
  );

  const getWithdrawalDetails = useCallback(async (withdrawId: string, requestLocale: Locale) => {
    try {
      const res = await apiFetch<{ data: ApiCreatorWithdrawalDetails }>(
        `/creators/withdraws/details/${withdrawId}`,
        { method: "GET", locale: requestLocale },
      );
      return mapApiCreatorWithdrawalDetails(res.data);
    } catch {
      return null;
    }
  }, []);

  const deleteWithdrawal = useCallback(async (withdrawId: string, requestLocale: Locale) => {
    await apiFetch(`/creators/withdraws/${withdrawId}`, { method: "DELETE", locale: requestLocale });
  }, []);

  const getCommunitySubscribers = useCallback(async (communityId: string, requestLocale: Locale, page = 1) => {
    try {
      const res = await apiFetch<{
        data: { items: ApiCommunitySubscriber[]; total: number; currentPage: number; lastPage: number; perPage: number };
      }>(`/creators/communities/${communityId}/subscriptions?page=${page}`, {
        method: "GET",
        locale: requestLocale,
      });
      return { ...res.data, items: (res.data.items ?? []).map(mapApiCommunitySubscriber) };
    } catch {
      return { items: [], total: 0, currentPage: 1, lastPage: 1, perPage: 0 };
    }
  }, []);

  const user = useMemo(() => {
    if (!hydrated || !apiUser) return null;
    return mapApiUserToLocal(apiUser);
  }, [hydrated, apiUser]);

  // Real subscription/enrollment membership — GET /communities/my-subscriptions
  // and GET /courses/my-courses are both paginated lists, not a single
  // "am I subscribed to X" lookup, so the full set of ids is loaded once per
  // session (looping through every page, same as favorites loads its full
  // list once) and cached here; isSubscribed/ownsCourseStandalone below just
  // check membership in that cached set, same synchronous-read shape the
  // rest of the app already calls them with. A payment only actually grants
  // access once the student completes checkout on Kashier's hosted page and
  // returns — reloaded on every mount/locale change so a student coming back
  // from a completed payment sees themselves unlocked without a hard refresh.
  // Cache-first, same pattern as getCachedUser/setCachedUser above: a
  // previously-seen membership set is read synchronously off localStorage
  // (keyed to this exact user id) so a repeat visit's very first render
  // already has the right answer — no loading gap for isSubscribed()/
  // ownsCourseStandalone() to fall through during. loadMyAccess still runs
  // in the background on every mount to reconcile against the real API
  // (a new subscription from another tab/device, an expiry, ...), it just no
  // longer has to be the ONLY source of truth before anything can render.
  // Prefer the cookie-sourced prop (identical on server and client, so
  // nothing to reconcile post-hydration) over the localStorage-only lookup —
  // the latter is kept only as a fallback for the rare case the cookie
  // didn't make it (e.g. it was set after this exact page's SSR pass) but a
  // same-tab localStorage write already happened.
  const initialMyAccessCache =
    initialUser && initialUser.type === "student"
      ? initialMyAccess && initialMyAccess.userId === String(initialUser.id)
        ? initialMyAccess
        : getCachedMyAccess(String(initialUser.id))
      : null;
  const [subscribedCommunityIds, setSubscribedCommunityIds] = useState<Set<string>>(
    () => new Set(initialMyAccessCache?.subscribedCommunityIds ?? []),
  );
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<Set<string>>(
    () => new Set(initialMyAccessCache?.enrolledCourseIds ?? []),
  );
  // GET /communities/my-subscriptions items carry subscription_start_at/
  // subscription_end_at (confirmed live) — the actual window this specific
  // subscription is valid for. Kept alongside the id set so any page that
  // already knows a community is subscribed (via isSubscribed) can also show
  // when that subscription started/ends without a second fetch.
  const [communitySubscriptionDates, setCommunitySubscriptionDates] = useState<
    Map<string, { startAt: string; endAt: string }>
  >(() => new Map(initialMyAccessCache?.communitySubscriptionDates ?? []));
  // Tracks whether the cached membership sets above reflect a real, resolved
  // fetch (or "nothing to load, not a student") rather than their initial
  // empty state — consumers (subscribe CTA, course access gate) gate on this
  // rather than just `hydrated` before deciding "not subscribed", since
  // `hydrated` only means the session/role is known, not that
  // subscribedCommunityIds/enrolledCourseIds have finished loading yet. Reading
  // isSubscribed()/ownsCourseStandalone() during that gap was returning a
  // false negative that then flipped true once the fetch resolved — a visible
  // "Subscribe" -> "Enter community" flicker on every refresh. Starting this
  // true when a localStorage cache already answered the question skips that
  // gap entirely on repeat visits; loadMyAccess below still quietly verifies.
  const [myAccessLoaded, setMyAccessLoaded] = useState(initialMyAccessCache !== null);
  const [myAccessResolved, setMyAccessResolved] = useState(false);

  const loadMyAccess = useCallback(
    async (requestLocale: Locale, forUserId: string) => {
      let finalIds = new Set<string>();
      let finalDates = new Map<string, { startAt: string; endAt: string }>();
      let finalCourseIds = new Set<string>();
      try {
        const ids = new Set<string>();
        const dates = new Map<string, { startAt: string; endAt: string }>();
        for (let page = 1, lastPage = 1; page <= lastPage && page <= 20; page++) {
          const res = await getMySubscriptions(requestLocale, page);
          res.items.forEach((c) => {
            ids.add(c.id);
            if (c.subscriptionStartAt && c.subscriptionEndAt) {
              dates.set(c.id, { startAt: c.subscriptionStartAt, endAt: c.subscriptionEndAt });
            }
          });
          lastPage = res.lastPage;
        }
        finalIds = ids;
        finalDates = dates;
        setSubscribedCommunityIds(ids);
        setCommunitySubscriptionDates(dates);
      } catch {
        // A failed refresh shouldn't wipe out a still-possibly-valid cached
        // answer — leave subscribedCommunityIds/communitySubscriptionDates
        // (and the cache write below) as whatever they already were.
      }
      try {
        const ids = new Set<string>();
        for (let page = 1, lastPage = 1; page <= lastPage && page <= 20; page++) {
          const res = await getMyEnrolledCourses(requestLocale, page);
          res.items.forEach((c) => ids.add(c.id));
          lastPage = res.lastPage;
        }
        finalCourseIds = ids;
        setEnrolledCourseIds(ids);
      } catch {
        // Same as above — keep whatever was already loaded/cached.
      } finally {
        setMyAccessLoaded(true);
        setMyAccessResolved(true);
        setCachedMyAccess({
          userId: forUserId,
          subscribedCommunityIds: [...finalIds],
          enrolledCourseIds: [...finalCourseIds],
          communitySubscriptionDates: [...finalDates.entries()],
        });
      }
    },
    [getMySubscriptions, getMyEnrolledCourses],
  );

  useEffect(() => {
    if (user && user.role === "student") {
      // Only show the loading gap when there's truly nothing cached yet for
      // this user — otherwise keep rendering the cached answer while this
      // fetch quietly reconciles it in the background.
      if (!getCachedMyAccess(user.id)) setMyAccessLoaded(false);
      loadMyAccess(locale, user.id);
    } else {
      setSubscribedCommunityIds(new Set());
      setEnrolledCourseIds(new Set());
      setCommunitySubscriptionDates(new Map());
      setMyAccessLoaded(hydrated);
      setMyAccessResolved(true);
      clearCachedMyAccess();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, user?.role, locale]);

  const isSubscribed = useCallback(
    (communityId: string) => subscribedCommunityIds.has(communityId),
    [subscribedCommunityIds],
  );

  const ownsCourseStandalone = useCallback(
    (courseId: string) => enrolledCourseIds.has(courseId),
    [enrolledCourseIds],
  );

  const getCommunitySubscriptionDates = useCallback(
    (communityId: string) => communitySubscriptionDates.get(communityId) ?? null,
    [communitySubscriptionDates],
  );

  // POST /favorites/toggle — returns true when the item was just added (201),
  // false when it was just removed (200). Favorite state on cards/details
  // comes from each list/details response's is_favorite field, not a cached
  // GET /favorites list.
  const toggleFavorite = useCallback(
    async (
      favoritableType: "course" | "community",
      favoritableId: string,
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("type", favoritableType);
      form.set("id", favoritableId);
      const res = await apiFetch<{ status: number; message: string }>(
        "/favorites/toggle",
        {
          method: "POST",
          body: form,
          locale: requestLocale,
        },
      );
      return res.status === 201;
    },
    [],
  );

  const value: AuthContextValue = {
    user,
    apiUser,
    role: user?.role ?? "guest",
    hydrated,
    sessionReady,
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    updateProfile,
    submitContactUs,
    checkCoupon,
    createCommunitySubscription,
    createCourseEnrollment,
    getMySubscriptions,
    getMyEnrolledCourses,
    createReview,
    saveCommunity,
    getMyCommunity,
    getMyCommunities,
    getMyCourses,
    getCourseByCreator,
    createCourse,
    updateCourseByCreator,
    deleteCourseByCreator,
    getLessonsByCourse,
    getLessonByCreator,
    getLessonVideo,
    createLesson,
    updateLessonByCreator,
    deleteLessonByCreator,
    getMyCoupons,
    getCouponByCreator,
    saveCreatorCoupon,
    deleteCouponByCreator,
    getMyReviews,
    getReviewByCreator,
    moderateReview,
    deleteReviewByCreator,
    getCommunityPosts,
    createCommunityPost,
    getPost,
    updatePost,
    deletePost,
    togglePinPost,
    getPostComments,
    addComment,
    updateComment,
    deleteComment,
    getCommentReplies,
    addReply,
    getPostReactions,
    addReaction,
    removeReaction,
    getCreatorDashboard,
    getEarningsSummary,
    getEarningsSales,
    getWithdrawBalance,
    getWithdrawals,
    createWithdrawal,
    getWithdrawalDetails,
    deleteWithdrawal,
    getCommunitySubscribers,
    fetchCommunityDetails,
    fetchCourseDetails,
    isSubscribed,
    ownsCourseStandalone,
    getCommunitySubscriptionDates,
    myAccessResolved,
    myAccessLoaded,
    toggleFavorite,
    settings,
    unreadNotificationsCount,
    refreshUnreadNotificationsCount,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
