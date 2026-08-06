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
import type { AnyUser, Role, Creator } from "./types";
import type { Locale } from "./i18n/config";
import { usePlatformStore } from "./platform-store";
import { resolveCommunityPrice } from "./data";
import {
  apiFetch,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  getCachedUser,
  setCachedUser,
  clearCachedUser,
} from "./api-client";
import type {
  ApiUser,
  ApiFavoriteEntry,
  FavoriteItem,
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
} from "./api-types";
import {
  mapApiUserToLocal,
  mapApiFavoriteEntry,
  mapApiCreatorCommunity,
  mapApiCreatorCourseUpdate,
  mapApiCreatorLessonUpdate,
  mapApiCreatorCoupon,
  mapApiCreatorReview,
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
  login: (email: string, password: string, locale: Locale) => Promise<AnyUser>;
  register: (input: RegisterApiInput, locale: Locale) => Promise<AnyUser>;
  logout: (locale: Locale) => void;
  forgotPassword: (email: string, locale: Locale) => Promise<void>;
  resetPassword: (
    input: {
      email: string;
      token: string;
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
      bioEn?: string;
      bioAr?: string;
      coverImage?: File;
    },
    locale: Locale,
  ) => Promise<void>;
  checkCoupon: (
    input: { creatorId: string; code: string },
    locale: Locale,
  ) => Promise<{ id: string; discountPercentage: number }>;
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
      nameEn: string;
      nameAr: string;
      descriptionEn?: string;
      descriptionAr?: string;
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
  getMyCourses: (locale: Locale) => Promise<CreatorCourseUpdateResult[]>;
  getCourseByCreator: (
    courseId: string,
    locale: Locale,
  ) => Promise<CreatorCourseUpdateResult | null>;
  createCourse: (
    input: {
      categoryId: string;
      titleEn: string;
      titleAr: string;
      descriptionEn?: string;
      descriptionAr?: string;
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
      titleEn?: string;
      titleAr?: string;
      descriptionEn?: string;
      descriptionAr?: string;
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
  createLesson: (
    courseId: string,
    input: {
      titleEn: string;
      titleAr: string;
      descriptionEn?: string;
      descriptionAr?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
    },
    locale: Locale,
  ) => Promise<CreatorLessonUpdateResult>;
  updateLessonByCreator: (
    lessonId: string,
    input: {
      titleEn?: string;
      titleAr?: string;
      descriptionEn?: string;
      descriptionAr?: string;
      videoUrl?: string;
      duration?: number;
      order?: number;
      isFree?: boolean;
      status?: "active" | "inactive";
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
  isSubscribed: (communityId: string) => boolean;
  ownsCourseStandalone: (courseId: string) => boolean;
  subscribeToCommunity: (communityId: string, couponCode?: string) => void;
  purchaseCourse: (courseId: string) => void;
  favorites: FavoriteItem[];
  favoritesLoading: boolean;
  toggleFavorite: (
    favoritableType: "course" | "community",
    favoritableId: string,
    locale: Locale,
  ) => Promise<void>;
  isFavorited: (
    favoritableType: "course" | "community",
    favoritableId: string,
  ) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  locale = "en",
}: {
  children: ReactNode;
  locale?: Locale;
}) {
  const store = usePlatformStore();
  const [apiUser, setApiUser] = useState<ApiUser | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

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
    const cached = token ? getCachedUser<ApiUser>() : null;
    if (cached) setApiUser(cached);
    setHydrated(true);

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
      } catch {
        if (!cancelled) {
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
        bioEn?: string;
        bioAr?: string;
        coverImage?: File;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (input.name) form.set("name", input.name);
      if (input.email) form.set("email", input.email);
      if (input.phoneNumber) form.set("phone_number", input.phoneNumber);
      if (input.image) form.set("image", input.image);
      if (input.bioEn) form.set("bio[en]", input.bioEn);
      if (input.bioAr) form.set("bio[ar]", input.bioAr);
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

  // NOT part of the documented Auth sub-folders (register/login/logout/profile/
  // change-password) — the client asked for a "forgot password" link and its
  // own reset page without sending a spec for it. Guessed at endpoints
  // following the same `/auth/*` + multipart-form-data + snake_case pattern
  // every other Auth endpoint in this project actually uses, and the standard
  // Laravel password-broker shape (email+token+password+password_confirmation
  // for the reset step). Flagged back to the client — these two need real
  // confirmation once they have the actual routes.
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

  const resetPassword = useCallback(
    async (
      input: {
        email: string;
        token: string;
        password: string;
        passwordConfirmation: string;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("email", input.email);
      form.set("token", input.token);
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
        nameEn: string;
        nameAr: string;
        descriptionEn?: string;
        descriptionAr?: string;
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
      form.set("name[en]", input.nameEn);
      form.set("name[ar]", input.nameAr);
      if (input.descriptionEn) form.set("description[en]", input.descriptionEn);
      if (input.descriptionAr) form.set("description[ar]", input.descriptionAr);
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
  // returns the real bilingual name/description pair and the real
  // category_id directly, closing every gap that workaround had.
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
  // per the spec's own table: title[en], title[ar], category_id — same
  // table-vs-formdata mismatch as the update endpoint (discount_percentage/
  // intro_video_url/`image` not `cover_image`), resolved the same way.
  const createCourse = useCallback(
    async (
      input: {
        categoryId: string;
        titleEn: string;
        titleAr: string;
        descriptionEn?: string;
        descriptionAr?: string;
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
      form.set("title[en]", input.titleEn);
      form.set("title[ar]", input.titleAr);
      if (input.descriptionEn) form.set("description[en]", input.descriptionEn);
      if (input.descriptionAr) form.set("description[ar]", input.descriptionAr);
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
        titleEn?: string;
        titleAr?: string;
        descriptionEn?: string;
        descriptionAr?: string;
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
      if (input.titleEn != null) form.set("title[en]", input.titleEn);
      if (input.titleAr != null) form.set("title[ar]", input.titleAr);
      if (input.descriptionEn != null)
        form.set("description[en]", input.descriptionEn);
      if (input.descriptionAr != null)
        form.set("description[ar]", input.descriptionAr);
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

  // POST /creators/courses/{id}/lessons — create, added round 12
  // (previously the "Add lesson" button just showed a "not connected"
  // notice). This is the one course/lesson endpoint pair this round where
  // the table and the worked curl example actually agree on field names —
  // no mismatch to resolve here.
  const createLesson = useCallback(
    async (
      courseId: string,
      input: {
        titleEn: string;
        titleAr: string;
        descriptionEn?: string;
        descriptionAr?: string;
        videoUrl?: string;
        duration?: number;
        order?: number;
        isFree?: boolean;
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      form.set("title[en]", input.titleEn);
      form.set("title[ar]", input.titleAr);
      if (input.descriptionEn) form.set("description[en]", input.descriptionEn);
      if (input.descriptionAr) form.set("description[ar]", input.descriptionAr);
      if (input.videoUrl) form.set("video_url", input.videoUrl);
      if (input.duration != null) form.set("duration", String(input.duration));
      if (input.order != null) form.set("order", String(input.order));
      if (input.isFree != null) form.set("is_free", input.isFree ? "1" : "0");
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
        titleEn?: string;
        titleAr?: string;
        descriptionEn?: string;
        descriptionAr?: string;
        videoUrl?: string;
        duration?: number;
        order?: number;
        isFree?: boolean;
        status?: "active" | "inactive";
      },
      requestLocale: Locale,
    ) => {
      const form = new FormData();
      if (input.titleEn != null) form.set("title[en]", input.titleEn);
      if (input.titleAr != null) form.set("title[ar]", input.titleAr);
      if (input.descriptionEn != null)
        form.set("description[en]", input.descriptionEn);
      if (input.descriptionAr != null)
        form.set("description[ar]", input.descriptionAr);
      if (input.videoUrl != null) form.set("video_url", input.videoUrl);
      if (input.duration != null) form.set("duration", String(input.duration));
      if (input.order != null) form.set("order", String(input.order));
      if (input.isFree != null) form.set("is_free", input.isFree ? "1" : "0");
      if (input.status) form.set("status", input.status);
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

  const user = useMemo(() => {
    if (!hydrated || !apiUser) return null;
    return mapApiUserToLocal(apiUser);
  }, [hydrated, apiUser]);

  const isSubscribed = useCallback(
    (communityId: string) => {
      if (!user || user.role !== "student") return false;
      return store.communitySubscriptions.all.some(
        (s) =>
          s.studentId === user.id &&
          s.communityId === communityId &&
          s.status === "active" &&
          new Date(s.endsAt).getTime() > Date.now(),
      );
    },
    [user, store.communitySubscriptions.all],
  );

  const ownsCourseStandalone = useCallback(
    (courseId: string) => {
      if (!user || user.role !== "student") return false;
      return store.enrollments.all.some(
        (e) => e.studentId === user.id && e.courseId === courseId,
      );
    },
    [user, store.enrollments.all],
  );

  const pay = useCallback(
    (
      payableType: "course" | "community",
      payableId: string,
      amount: number,
    ) => {
      if (!user) return null;
      const now = new Date().toISOString();
      const paymentId = `pay-local-${Date.now()}`;
      store.payments.add({
        id: paymentId,
        studentId: user.id,
        payableType,
        payableId,
        amount,
        currency: "EGP",
        paymobOrderId: `ord-local-${Date.now()}`,
        paymobTransactionId: `txn-local-${Date.now()}`,
        paymentMethod: "card",
        status: "success",
        paidAt: now,
        createdAt: now,
      });
      return { paymentId, now };
    },
    [user, store.payments],
  );

  const creditCreator = useCallback(
    (creatorId: string, creatorEarning: number, amount: number) => {
      const creator = store.users.all.find(
        (u) => u.id === creatorId && u.role === "creator",
      ) as Creator | undefined;
      if (!creator) return;
      store.users.update(creator.id, {
        balance: creator.balance + creatorEarning,
        totalSales: creator.totalSales + amount,
      } as Partial<Creator>);
    },
    [store.users],
  );

  const subscribeToCommunity = useCallback(
    (communityId: string, couponCode?: string) => {
      if (!user || user.role !== "student" || isSubscribed(communityId)) return;
      const community = store.communities.all.find((c) => c.id === communityId);
      if (!community) return;
      const { amount } = resolveCommunityPrice(
        community,
        couponCode,
        store.coupons.all,
      );
      const creator = store.users.all.find(
        (u) => u.id === community.creatorId && u.role === "creator",
      ) as Creator | undefined;
      const commissionRate = creator?.commissionRate ?? 20;
      const platformCommission = Math.round((amount * commissionRate) / 100);
      const creatorEarning = amount - platformCommission;
      const paid = pay("community", communityId, amount);
      if (!paid) return;
      const startsAt = new Date();
      const endsAt = new Date(
        startsAt.getTime() +
          community.subscriptionDurationDays * 24 * 60 * 60 * 1000,
      );
      store.communitySubscriptions.add({
        id: `cs-local-${Date.now()}`,
        studentId: user.id,
        communityId,
        paymentId: paid.paymentId,
        pricePaid: amount,
        platformCommission,
        creatorEarning,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        status: "active",
        createdAt: paid.now,
      });
      creditCreator(community.creatorId, creatorEarning, amount);
    },
    [
      user,
      store.communities.all,
      store.users.all,
      store.communitySubscriptions,
      store.coupons.all,
      isSubscribed,
      pay,
      creditCreator,
    ],
  );

  const purchaseCourse = useCallback(
    (courseId: string) => {
      if (!user || user.role !== "student" || ownsCourseStandalone(courseId))
        return;
      const course = store.courses.all.find((c) => c.id === courseId);
      if (!course) return;
      const amount = course.price;
      const creator = store.users.all.find(
        (u) => u.id === course.creatorId && u.role === "creator",
      ) as Creator | undefined;
      const commissionRate = creator?.commissionRate ?? 20;
      const platformCommission = Math.round((amount * commissionRate) / 100);
      const creatorEarning = amount - platformCommission;
      const paid = pay("course", courseId, amount);
      if (!paid) return;
      store.enrollments.add({
        id: `en-local-${Date.now()}`,
        studentId: user.id,
        courseId,
        paymentId: paid.paymentId,
        pricePaid: amount,
        platformCommission,
        creatorEarning,
        enrolledAt: paid.now,
      });
      creditCreator(course.creatorId, creatorEarning, amount);
    },
    [
      user,
      store.courses.all,
      store.users.all,
      store.enrollments,
      ownsCourseStandalone,
      pay,
      creditCreator,
    ],
  );

  // GET /favorites and POST /favorites/toggle both require Bearer auth, so
  // this can't be a Server Component fetcher like getCommunities/etc — it
  // only ever runs client-side, backed by whatever token is in localStorage.
  // Loaded once per session (and again on locale change, so item names come
  // back in the right language) rather than fetched fresh by every
  // FavoriteButton — isFavorited() just reads this cached list. Supports an
  // optional `type` filter (community|course) — deliberately not sent here,
  // since the Favorites page wants both types loaded at once to populate
  // its two tabs from a single request.
  const loadFavorites = useCallback(async (requestLocale: Locale) => {
    setFavoritesLoading(true);
    try {
      const res = await apiFetch<{ data: ApiFavoriteEntry[] }>("/favorites", {
        method: "GET",
        locale: requestLocale,
      });
      setFavorites(res.data.map(mapApiFavoriteEntry));
    } catch {
      setFavorites([]);
    } finally {
      setFavoritesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (apiUser) {
      loadFavorites(locale);
    } else {
      setFavorites([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiUser?.id, locale]);

  const isFavorited = useCallback(
    (favoritableType: "course" | "community", favoritableId: string) =>
      favorites.some(
        (f) => f.type === favoritableType && f.id === favoritableId,
      ),
    [favorites],
  );

  // The toggle response only ever carries {success, status, message} — status
  // 201 means it was just added, 200 means it was just removed (per the
  // spec's own Responses table), and that's the only signal available for
  // which branch happened. On add, the response has none of the item's own
  // data (name/image/price/...), so there's nothing to splice in locally —
  // refetch the list instead. On remove, the id we already sent is enough to
  // drop it from local state without another round-trip.
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
      if (res.status === 201) {
        await loadFavorites(requestLocale);
      } else {
        setFavorites((prev) =>
          prev.filter(
            (f) => !(f.type === favoritableType && f.id === favoritableId),
          ),
        );
      }
    },
    [loadFavorites],
  );

  const value: AuthContextValue = {
    user,
    apiUser,
    role: user?.role ?? "guest",
    login,
    register,
    logout,
    changePassword,
    forgotPassword,
    resetPassword,
    updateProfile,
    checkCoupon,
    createReview,
    saveCommunity,
    getMyCommunity,
    getMyCourses,
    getCourseByCreator,
    createCourse,
    updateCourseByCreator,
    deleteCourseByCreator,
    getLessonsByCourse,
    getLessonByCreator,
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
    isSubscribed,
    ownsCourseStandalone,
    subscribeToCommunity,
    purchaseCourse,
    favorites,
    favoritesLoading,
    toggleFavorite,
    isFavorited,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
