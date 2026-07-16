"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type {
  AnyUser,
  Category,
  Community,
  CommunityPost,
  CommunitySubscription,
  Coupon,
  Course,
  Enrollment,
  Favorite,
  Lesson,
  Media,
  Payment,
  PostComment,
  PostReaction,
  Review,
  Setting,
  WithdrawalRequest
} from "./types";
import {
  courses as seedCourses,
  communities as seedCommunities,
  posts as seedPosts,
  comments as seedComments,
  reactions as seedReactions,
  enrollments as seedEnrollments,
  communitySubscriptions as seedCommunitySubscriptions,
  payments as seedPayments,
  withdrawals as seedWithdrawals,
  categories as seedCategories,
  settings as seedSettings,
  coupons as seedCoupons,
  favorites as seedFavorites,
  reviews as seedReviews,
  allUsers
} from "./data";

const STORAGE_KEY = "marefa.platformEdits.v1";

interface CollectionEdits<T> {
  overrides: Record<string, Partial<T>>;
  added: T[];
  deletedIds: string[];
}

function emptyCollection<T>(): CollectionEdits<T> {
  return { overrides: {}, added: [], deletedIds: [] };
}

interface StoredEdits {
  courses: CollectionEdits<Course>;
  communities: CollectionEdits<Community>;
  posts: CollectionEdits<CommunityPost>;
  comments: CollectionEdits<PostComment>;
  reactions: CollectionEdits<PostReaction>;
  enrollments: CollectionEdits<Enrollment>;
  communitySubscriptions: CollectionEdits<CommunitySubscription>;
  payments: CollectionEdits<Payment>;
  withdrawalRequests: CollectionEdits<WithdrawalRequest>;
  users: CollectionEdits<AnyUser>;
  categories: CollectionEdits<Category>;
  settings: CollectionEdits<Setting>;
  coupons: CollectionEdits<Coupon>;
  favorites: CollectionEdits<Favorite>;
  media: CollectionEdits<Media>;
  reviews: CollectionEdits<Review>;
}

function emptyEdits(): StoredEdits {
  return {
    courses: emptyCollection(),
    communities: emptyCollection(),
    posts: emptyCollection(),
    comments: emptyCollection(),
    reactions: emptyCollection(),
    enrollments: emptyCollection(),
    communitySubscriptions: emptyCollection(),
    payments: emptyCollection(),
    withdrawalRequests: emptyCollection(),
    users: emptyCollection(),
    categories: emptyCollection(),
    settings: emptyCollection(),
    coupons: emptyCollection(),
    favorites: emptyCollection(),
    media: emptyCollection(),
    reviews: emptyCollection()
  };
}

function mergeCollection<T extends { id: string }>(seed: T[], edits: CollectionEdits<T>): T[] {
  const base = seed
    .filter((item) => !edits.deletedIds.includes(item.id))
    .map((item) => ({ ...item, ...edits.overrides[item.id] }));
  const added = edits.added.filter((item) => !edits.deletedIds.includes(item.id));
  return [...base, ...added];
}

interface Collection<T> {
  all: T[];
  add: (item: T) => void;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
}

type CollectionKey = keyof StoredEdits;

interface PlatformStoreValue {
  courses: Collection<Course>;
  communities: Collection<Community>;
  posts: Collection<CommunityPost>;
  comments: Collection<PostComment>;
  reactions: Collection<PostReaction>;
  enrollments: Collection<Enrollment>;
  communitySubscriptions: Collection<CommunitySubscription>;
  payments: Collection<Payment>;
  withdrawalRequests: Collection<WithdrawalRequest>;
  users: Collection<AnyUser>;
  categories: Collection<Category>;
  settings: Collection<Setting>;
  coupons: Collection<Coupon>;
  favorites: Collection<Favorite>;
  media: Collection<Media>;
  reviews: Collection<Review>;
  addLesson: (courseId: string, lesson: Lesson) => void;
  updateLesson: (courseId: string, lessonId: string, patch: Partial<Lesson>) => void;
  deleteLesson: (courseId: string, lessonId: string) => void;
}

const PlatformStoreContext = createContext<PlatformStoreValue | null>(null);

export function PlatformStoreProvider({ children }: { children: ReactNode }) {
  const [edits, setEdits] = useState<StoredEdits>(emptyEdits);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setEdits({ ...emptyEdits(), ...JSON.parse(raw) });
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  const persist = useCallback((next: StoredEdits) => {
    setEdits(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const seeds = useMemo(
    () => ({
      courses: seedCourses,
      communities: seedCommunities,
      posts: seedPosts,
      comments: seedComments,
      reactions: seedReactions,
      enrollments: seedEnrollments,
      communitySubscriptions: seedCommunitySubscriptions,
      payments: seedPayments,
      withdrawalRequests: seedWithdrawals,
      users: allUsers(),
      categories: seedCategories,
      settings: seedSettings,
      coupons: seedCoupons,
      favorites: seedFavorites,
      media: [] as Media[],
      reviews: seedReviews
    }),
    []
  );

  const makeCollection = useCallback(
    <K extends CollectionKey>(key: K): Collection<StoredEdits[K]["added"][number]> => {
      type T = StoredEdits[K]["added"][number];
      const seed = seeds[key] as unknown as T[];
      const collectionEdits = hydrated ? edits[key] : emptyCollection<T>();
      const all = mergeCollection(seed, collectionEdits as CollectionEdits<T>);

      const add = (item: T) => {
        const current = edits[key] as CollectionEdits<T>;
        persist({ ...edits, [key]: { ...current, added: [...current.added, item] } });
      };

      const update = (id: string, patch: Partial<T>) => {
        const current = edits[key] as CollectionEdits<T>;
        const isAdded = current.added.some((item: any) => item.id === id);
        if (isAdded) {
          persist({
            ...edits,
            [key]: {
              ...current,
              added: current.added.map((item: any) => (item.id === id ? { ...item, ...patch } : item))
            }
          });
        } else {
          persist({
            ...edits,
            [key]: {
              ...current,
              overrides: { ...current.overrides, [id]: { ...current.overrides[id], ...patch } }
            }
          });
        }
      };

      const remove = (id: string) => {
        const current = edits[key] as CollectionEdits<T>;
        persist({ ...edits, [key]: { ...current, deletedIds: [...current.deletedIds, id] } });
      };

      return { all, add, update, remove };
    },
    [edits, hydrated, persist, seeds]
  );

  const courses = makeCollection("courses");
  const communities = makeCollection("communities");
  const posts = makeCollection("posts");
  const comments = makeCollection("comments");
  const reactions = makeCollection("reactions");
  const enrollments = makeCollection("enrollments");
  const communitySubscriptions = makeCollection("communitySubscriptions");
  const paymentsCollection = makeCollection("payments");
  const withdrawalRequests = makeCollection("withdrawalRequests");
  const users = makeCollection("users");
  const categories = makeCollection("categories");
  const settings = makeCollection("settings");
  const coupons = makeCollection("coupons");
  const favorites = makeCollection("favorites");
  const media = makeCollection("media");
  const reviews = makeCollection("reviews");

  const addLesson = useCallback(
    (courseId: string, lesson: Lesson) => {
      const course = courses.all.find((c) => c.id === courseId);
      if (!course) return;
      courses.update(courseId, { lessons: [...course.lessons, lesson] });
    },
    [courses]
  );

  const updateLesson = useCallback(
    (courseId: string, lessonId: string, patch: Partial<Lesson>) => {
      const course = courses.all.find((c) => c.id === courseId);
      if (!course) return;
      courses.update(courseId, {
        lessons: course.lessons.map((l) => (l.id === lessonId ? { ...l, ...patch } : l))
      });
    },
    [courses]
  );

  const deleteLesson = useCallback(
    (courseId: string, lessonId: string) => {
      const course = courses.all.find((c) => c.id === courseId);
      if (!course) return;
      courses.update(courseId, { lessons: course.lessons.filter((l) => l.id !== lessonId) });
    },
    [courses]
  );

  const value: PlatformStoreValue = {
    courses,
    communities,
    posts,
    comments,
    reactions,
    enrollments,
    communitySubscriptions,
    payments: paymentsCollection,
    withdrawalRequests,
    users,
    categories,
    settings,
    coupons,
    favorites,
    media,
    reviews,
    addLesson,
    updateLesson,
    deleteLesson
  };

  return <PlatformStoreContext.Provider value={value}>{children}</PlatformStoreContext.Provider>;
}

export function usePlatformStore() {
  const ctx = useContext(PlatformStoreContext);
  if (!ctx) throw new Error("usePlatformStore must be used within PlatformStoreProvider");
  return ctx;
}
