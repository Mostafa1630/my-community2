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
import type { AnyUser, Role, Creator, Student, AccentKey, Community } from "./types";
import { usePlatformStore } from "./platform-store";
import { categories, resolveCommunityPrice } from "./data";

const STORAGE_KEY = "marefa.session.v1";

const ACCENTS: AccentKey[] = ["teal", "gold", "clay", "ink", "moss", "plum", "sand", "rust"];

interface Session {
  userId: string;
  role: Role;
}

interface RegisterInput {
  name: string;
  email: string;
  role: "student" | "creator";
}

interface AuthContextValue {
  user: AnyUser | null;
  role: Role | "guest";
  loginAs: (userId: string, role: Role) => void;
  loginWithEmail: (email: string) => AnyUser | null;
  register: (input: RegisterInput) => AnyUser;
  logout: () => void;
  isSubscribed: (communityId: string) => boolean;
  ownsCourseStandalone: (courseId: string) => boolean;
  subscribeToCommunity: (communityId: string, couponCode?: string) => void;
  purchaseCourse: (courseId: string) => void;
  toggleFavorite: (favoritableType: "course" | "community", favoritableId: string) => void;
  isFavorited: (favoritableType: "course" | "community", favoritableId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function randomAccent(): AccentKey {
  return ACCENTS[Math.floor(Math.random() * ACCENTS.length)];
}

function slugify(name: string) {
  return `${name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()
    .toString()
    .slice(-4)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = usePlatformStore();
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setSession(JSON.parse(raw));
    } catch {
      // ignore corrupted storage
    } finally {
      setHydrated(true);
    }
  }, []);

  const loginAs = useCallback((userId: string, role: Role) => {
    const next = { userId, role };
    setSession(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const loginWithEmail = useCallback(
    (email: string) => {
      const normalized = email.trim().toLowerCase();
      const found = store.users.all.find((u) => u.email.toLowerCase() === normalized);
      if (found) loginAs(found.id, found.role);
      return found ?? null;
    },
    [store.users.all, loginAs]
  );

  const register = useCallback(
    ({ name, email, role }: RegisterInput) => {
      const id = `${role}-local-${Date.now()}`;
      const base = {
        id,
        name,
        email,
        avatarAccent: randomAccent(),
        status: "active" as const,
        preferredLanguage: "ar" as const,
        createdAt: new Date().toISOString()
      };
      const newUser: AnyUser =
        role === "student"
          ? ({ ...base, role: "student" } as Student)
          : ({
              ...base,
              role: "creator",
              slug: slugify(name),
              bioEn: "",
              bioAr: "",
              coverAccent: randomAccent(),
              verified: false,
              balance: 0,
              totalSales: 0,
              commissionRate: 20
            } as Creator);

      store.users.add(newUser);

      if (role === "creator") {
        const community: Community = {
          id: `community-local-${Date.now()}`,
          slug: slugify(name),
          creatorId: id,
          categoryId: categories[0]?.id ?? "",
          nameEn: `${name}'s Community`,
          nameAr: `مجتمع ${name}`,
          descriptionEn: "",
          descriptionAr: "",
          coverImage: undefined,
          type: "public",
          status: "inactive",
          isFree: true,
          subscriptionPrice: 0,
          discountPercentage: 0,
          subscriptionDurationDays: 30,
          createdAt: new Date().toISOString()
        };
        store.communities.add(community);
      }

      loginAs(id, role);
      return newUser;
    },
    [store, loginAs]
  );

  const logout = useCallback(() => {
    setSession(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const user = useMemo(() => {
    if (!hydrated || !session) return null;
    return store.users.all.find((u) => u.id === session.userId && u.role === session.role) ?? null;
  }, [hydrated, session, store.users.all]);

  const isSubscribed = useCallback(
    (communityId: string) => {
      if (!user || user.role !== "student") return false;
      return store.communitySubscriptions.all.some(
        (s) =>
          s.studentId === user.id &&
          s.communityId === communityId &&
          s.status === "active" &&
          new Date(s.endsAt).getTime() > Date.now()
      );
    },
    [user, store.communitySubscriptions.all]
  );

  const ownsCourseStandalone = useCallback(
    (courseId: string) => {
      if (!user || user.role !== "student") return false;
      return store.enrollments.all.some((e) => e.studentId === user.id && e.courseId === courseId);
    },
    [user, store.enrollments.all]
  );

  const pay = useCallback(
    (payableType: "course" | "community", payableId: string, amount: number) => {
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
        createdAt: now
      });
      return { paymentId, now };
    },
    [user, store.payments]
  );

  const creditCreator = useCallback(
    (creatorId: string, creatorEarning: number, amount: number) => {
      const creator = store.users.all.find((u) => u.id === creatorId && u.role === "creator") as
        | Creator
        | undefined;
      if (!creator) return;
      store.users.update(creator.id, {
        balance: creator.balance + creatorEarning,
        totalSales: creator.totalSales + amount
      } as Partial<Creator>);
    },
    [store.users]
  );

  const subscribeToCommunity = useCallback(
    (communityId: string, couponCode?: string) => {
      if (!user || user.role !== "student" || isSubscribed(communityId)) return;
      const community = store.communities.all.find((c) => c.id === communityId);
      if (!community) return;
      const { amount } = resolveCommunityPrice(community, couponCode, store.coupons.all);
      const creator = store.users.all.find((u) => u.id === community.creatorId && u.role === "creator") as
        | Creator
        | undefined;
      const commissionRate = creator?.commissionRate ?? 20;
      const platformCommission = Math.round((amount * commissionRate) / 100);
      const creatorEarning = amount - platformCommission;
      const paid = pay("community", communityId, amount);
      if (!paid) return;
      const startsAt = new Date();
      const endsAt = new Date(startsAt.getTime() + community.subscriptionDurationDays * 24 * 60 * 60 * 1000);
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
        createdAt: paid.now
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
      creditCreator
    ]
  );

  const purchaseCourse = useCallback(
    (courseId: string) => {
      if (!user || user.role !== "student" || ownsCourseStandalone(courseId)) return;
      const course = store.courses.all.find((c) => c.id === courseId);
      if (!course) return;
      const amount = course.price;
      const creator = store.users.all.find((u) => u.id === course.creatorId && u.role === "creator") as
        | Creator
        | undefined;
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
        enrolledAt: paid.now
      });
      creditCreator(course.creatorId, creatorEarning, amount);
    },
    [user, store.courses.all, store.users.all, store.enrollments, ownsCourseStandalone, pay, creditCreator]
  );

  const isFavorited = useCallback(
    (favoritableType: "course" | "community", favoritableId: string) => {
      if (!user) return false;
      return store.favorites.all.some(
        (f) => f.userId === user.id && f.favoritableType === favoritableType && f.favoritableId === favoritableId
      );
    },
    [user, store.favorites.all]
  );

  const toggleFavorite = useCallback(
    (favoritableType: "course" | "community", favoritableId: string) => {
      if (!user) return;
      const existing = store.favorites.all.find(
        (f) => f.userId === user.id && f.favoritableType === favoritableType && f.favoritableId === favoritableId
      );
      if (existing) {
        store.favorites.remove(existing.id);
      } else {
        store.favorites.add({
          id: `fav-local-${Date.now()}`,
          userId: user.id,
          favoritableType,
          favoritableId,
          createdAt: new Date().toISOString()
        });
      }
    },
    [user, store.favorites]
  );

  const value: AuthContextValue = {
    user,
    role: user?.role ?? "guest",
    loginAs,
    loginWithEmail,
    register,
    logout,
    isSubscribed,
    ownsCourseStandalone,
    subscribeToCommunity,
    purchaseCourse,
    toggleFavorite,
    isFavorited
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
