"use client";

import { useEffect, useState } from "react";
import type { Locale } from "./i18n/config";
import { useAuth } from "./auth-context";

type AccessEntry = { resolved: boolean; value: boolean };

const communityAccessCache = new Map<string, AccessEntry>();
const courseAccessCache = new Map<string, AccessEntry>();
const communityInflight = new Map<string, Promise<boolean>>();
const courseInflight = new Map<string, Promise<boolean>>();

function communityKey(communityId: string, locale: Locale) {
  return `${communityId}:${locale}`;
}

function courseKey(courseId: string, locale: Locale) {
  return `${courseId}:${locale}`;
}

export function invalidateCommunityAccess(communityId: string, locale?: Locale) {
  if (locale) {
    const key = communityKey(communityId, locale);
    communityAccessCache.delete(key);
    communityInflight.delete(key);
    return;
  }
  for (const key of communityAccessCache.keys()) {
    if (key.startsWith(`${communityId}:`)) {
      communityAccessCache.delete(key);
      communityInflight.delete(key);
    }
  }
}

export function invalidateCourseAccess(courseId: string, locale?: Locale) {
  if (locale) {
    const key = courseKey(courseId, locale);
    courseAccessCache.delete(key);
    courseInflight.delete(key);
    return;
  }
  for (const key of courseAccessCache.keys()) {
    if (key.startsWith(`${courseId}:`)) {
      courseAccessCache.delete(key);
      courseInflight.delete(key);
    }
  }
}

function fetchCommunitySubscription(
  communityId: string,
  locale: Locale,
  fetchCommunityDetails: ReturnType<typeof useAuth>["fetchCommunityDetails"],
  fallbackSubscribed: boolean,
  key: string,
) {
  const existing = communityInflight.get(key);
  if (existing) return existing;

  const promise = fetchCommunityDetails(communityId, locale)
    .then((details) => {
      const apiSubscribed = details != null && Boolean(details.isSubscribed);
      const value = apiSubscribed || fallbackSubscribed;
      const entry = { resolved: true, value };
      communityAccessCache.set(key, entry);
      communityInflight.delete(key);
      return value;
    })
    .catch(() => {
      const value = fallbackSubscribed;
      const entry = { resolved: true, value };
      communityAccessCache.set(key, entry);
      communityInflight.delete(key);
      return value;
    });

  communityInflight.set(key, promise);
  return promise;
}

/** Subscription flag from GET /communities/details/{id} with Bearer auth. */
export function useCommunitySubscription(
  communityId: string,
  locale: Locale,
  ssrSubscribed = false,
): { subscribed: boolean; resolved: boolean } {
  const { role, hydrated, sessionReady, myAccessLoaded, fetchCommunityDetails, isSubscribed } =
    useAuth();
  const key = communityKey(communityId, locale);
  const membershipCached = role === "student" && isSubscribed(communityId);

  const [state, setState] = useState<AccessEntry>(() => {
    const cached = communityAccessCache.get(key);
    if (cached?.resolved) {
      if (!cached.value && membershipCached) return { resolved: true, value: true };
      return cached;
    }
    if (role !== "student") return { resolved: true, value: false };
    if (membershipCached || ssrSubscribed) return { resolved: true, value: true };
    return { resolved: false, value: false };
  });

  useEffect(() => {
    if (!hydrated || !sessionReady) return;

    if (role !== "student") {
      setState({ resolved: true, value: false });
      return;
    }

    const cached = communityAccessCache.get(key);
    const mustRefetch =
      !cached?.resolved ||
      (cached.value === false && membershipCached) ||
      (cached.value === true && !membershipCached);

    if (cached?.resolved && !mustRefetch) {
      if (cached.value === false && !myAccessLoaded) return;
      setState(cached);
      return;
    }

    if (mustRefetch) {
      communityAccessCache.delete(key);
      communityInflight.delete(key);
    }

    let cancelled = false;

    fetchCommunitySubscription(
      communityId,
      locale,
      fetchCommunityDetails,
      membershipCached,
      key,
    ).then((value) => {
      if (!cancelled) setState({ resolved: true, value });
    });

    return () => {
      cancelled = true;
    };
  }, [
    communityId,
    locale,
    role,
    hydrated,
    sessionReady,
    myAccessLoaded,
    fetchCommunityDetails,
    membershipCached,
    key,
  ]);

  // my-subscriptions can resolve after details/{id} cached a stale false — sync immediately.
  useEffect(() => {
    if (!membershipCached || state.value) return;
    const entry = { resolved: true, value: true as const };
    communityAccessCache.set(key, entry);
    setState(entry);
  }, [membershipCached, state.value, key]);

  const subscribed =
    role === "student" && (state.value || membershipCached);
  const resolved =
    role !== "student" ||
    membershipCached ||
    (myAccessLoaded && state.resolved);

  return { subscribed, resolved };
}

/** Enrollment flag from GET /courses/details/{id} with Bearer auth. */
export function useCourseEnrollment(
  courseId: string,
  locale: Locale,
  ssrEnrolled = false,
): { enrolled: boolean; resolved: boolean } {
  const { role, hydrated, fetchCourseDetails } = useAuth();
  const key = courseKey(courseId, locale);

  const [state, setState] = useState<AccessEntry>(() => {
    const cached = courseAccessCache.get(key);
    if (cached?.resolved) return cached;
    if (role !== "student") return { resolved: true, value: false };
    if (ssrEnrolled) return { resolved: true, value: true };
    return { resolved: false, value: false };
  });

  useEffect(() => {
    if (!hydrated) return;

    if (role !== "student") {
      setState({ resolved: true, value: false });
      return;
    }

    const cached = courseAccessCache.get(key);
    if (cached?.resolved) {
      setState(cached);
      return;
    }

    let cancelled = false;
    const existing = courseInflight.get(key);
    const promise =
      existing ??
      fetchCourseDetails(courseId, locale)
        .then((details) => {
          const value = details?.isEnrolled ?? false;
          const entry = { resolved: true, value };
          courseAccessCache.set(key, entry);
          courseInflight.delete(key);
          return value;
        })
        .catch(() => {
          const entry = { resolved: true, value: false };
          courseAccessCache.set(key, entry);
          courseInflight.delete(key);
          return false;
        });

    if (!existing) courseInflight.set(key, promise);

    promise.then((value) => {
      if (!cancelled) setState({ resolved: true, value });
    });

    return () => {
      cancelled = true;
    };
  }, [courseId, locale, role, hydrated, fetchCourseDetails, key]);

  return {
    enrolled: role === "student" && state.value,
    resolved: role !== "student" || state.resolved,
  };
}
