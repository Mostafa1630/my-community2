"use client";

import { Lock } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import { useAuth } from "@/lib/auth-context";
import CommunityFeed from "./CommunityFeed";
import EmptyState from "./EmptyState";

export default function CreatorCommunityGate({
  creatorId,
  communityId,
  locale,
  dict
}: {
  creatorId: string;
  communityId: string;
  locale: Locale;
  dict: Dictionary;
}) {
  const { role, user, isSubscribed } = useAuth();

  const unlocked =
    (role === "student" && isSubscribed(communityId)) ||
    (role === "creator" && user?.id === creatorId) ||
    role === "admin";

  if (!unlocked) {
    return <EmptyState icon={Lock} title={dict.creator.communityLocked} />;
  }

  return <CommunityFeed communityId={communityId} locale={locale} dict={dict} creatorId={creatorId} />;
}
