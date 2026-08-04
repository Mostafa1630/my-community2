import type { Locale } from "./i18n/config";
import type { Category } from "./types";
import { apiFetch } from "./api-client";
import {
  mapApiCategoryToLocal,
  mapApiCreatorSummary,
  mapApiCreatorDetails,
  mapApiCommunitySummary,
  mapApiCommunityDetails,
  mapApiCourseDetails,
  type ApiCategory,
  type ApiCreatorSummary,
  type ApiCreatorDetails,
  type CreatorSummary,
  type CreatorDetails,
  type ApiCommunitySummary,
  type ApiCommunityDetails,
  type CommunitySummary,
  type CommunityDetails,
  type ApiCourseDetails,
  type CourseDetails
} from "./api-types";

// Public content endpoints connected to the real backend (no auth required).
// Called from Server Components (await directly) or Client Components alike —
// apiFetch works in both since it's a plain fetch() wrapper.
//
// These fail soft (return an empty list) instead of throwing: they're called
// directly in Server Component page bodies, and an uncaught rejection there
// crashes the whole page render, not just the category filter — unacceptable
// for a non-critical filter list, especially while NEXT_PUBLIC_API_BASE_URL
// is still unset (guaranteed to throw on every call until the client sends
// the real URL). Once it's set and the backend is reachable, this behaves
// like a normal fetch; the empty-list fallback only ever kicks in on failure.
export async function getCategories(locale: Locale): Promise<Category[]> {
  try {
    const res = await apiFetch<{ data: ApiCategory[] }>("/categories", { method: "GET", locale, auth: false });
    return res.data.map(mapApiCategoryToLocal);
  } catch {
    return [];
  }
}

export interface CreatorsPage {
  items: CreatorSummary[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

const EMPTY_CREATORS_PAGE: CreatorsPage = { items: [], total: 0, currentPage: 1, lastPage: 1, perPage: 10 };

export async function getCreators(locale: Locale, page = 1): Promise<CreatorsPage> {
  try {
    const res = await apiFetch<{
      data: { items: ApiCreatorSummary[]; total: number; currentPage: number; lastPage: number; perPage: number };
    }>(`/creators?page=${page}`, { method: "GET", locale, auth: false });
    return { ...res.data, items: res.data.items.map(mapApiCreatorSummary) };
  } catch {
    return EMPTY_CREATORS_PAGE;
  }
}

export async function getTopCreatorsApi(locale: Locale): Promise<CreatorSummary[]> {
  try {
    const res = await apiFetch<{ data: ApiCreatorSummary[] }>("/creators/top", { method: "GET", locale, auth: false });
    return res.data.map(mapApiCreatorSummary);
  } catch {
    return [];
  }
}

export async function getCreatorDetails(id: string, locale: Locale): Promise<CreatorDetails | null> {
  try {
    const res = await apiFetch<{ data: ApiCreatorDetails }>(`/creators/details/${id}`, {
      method: "GET",
      locale,
      auth: false
    });
    return mapApiCreatorDetails(res.data);
  } catch {
    return null;
  }
}

export interface CommunitiesPage {
  items: CommunitySummary[];
  total: number;
  currentPage: number;
  lastPage: number;
  perPage: number;
}

const EMPTY_COMMUNITIES_PAGE: CommunitiesPage = { items: [], total: 0, currentPage: 1, lastPage: 1, perPage: 10 };

export async function getCommunities(
  locale: Locale,
  { page = 1, categoryId }: { page?: number; categoryId?: string } = {}
): Promise<CommunitiesPage> {
  try {
    const query = new URLSearchParams({ page: String(page) });
    if (categoryId) query.set("category_id", categoryId);
    const res = await apiFetch<{
      data: { items: ApiCommunitySummary[]; total: number; currentPage: number; lastPage: number; perPage: number };
    }>(`/communities?${query.toString()}`, { method: "GET", locale, auth: false });
    return { ...res.data, items: res.data.items.map(mapApiCommunitySummary) };
  } catch {
    return EMPTY_COMMUNITIES_PAGE;
  }
}

export async function getCommunityDetails(id: string, locale: Locale): Promise<CommunityDetails | null> {
  try {
    const res = await apiFetch<{ data: ApiCommunityDetails }>(`/communities/details/${id}`, {
      method: "GET",
      locale,
      auth: false
    });
    return mapApiCommunityDetails(res.data);
  } catch {
    return null;
  }
}

export async function getCourseDetails(id: string, locale: Locale): Promise<CourseDetails | null> {
  try {
    const res = await apiFetch<{ data: ApiCourseDetails }>(`/courses/details/${id}`, {
      method: "GET",
      locale,
      auth: false
    });
    return mapApiCourseDetails(res.data);
  } catch {
    return null;
  }
}
