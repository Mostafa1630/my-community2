"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Users2 } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/getDictionary";
import type { CommunityStatus, CommunityType } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { usePlatformStore } from "@/lib/platform-store";
import { categories } from "@/lib/data";
import EmptyState from "./EmptyState";
import DashboardPageHeader from "./DashboardPageHeader";

export default function CreatorCommunityForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const { user } = useAuth();
  const store = usePlatformStore();
  const community = store.communities.all.find((c) => c.creatorId === user?.id);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [type, setType] = useState<CommunityType>("public");
  const [status, setStatus] = useState<CommunityStatus>("active");
  const [isFree, setIsFree] = useState(false);
  const [subscriptionPrice, setSubscriptionPrice] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (community) {
      setNameEn(community.nameEn);
      setNameAr(community.nameAr);
      setDescriptionEn(community.descriptionEn ?? "");
      setDescriptionAr(community.descriptionAr ?? "");
      setType(community.type);
      setStatus(community.status);
      setIsFree(community.isFree);
      setSubscriptionPrice(community.subscriptionPrice);
      setDiscountPercentage(community.discountPercentage);
      setCategoryId(community.categoryId);
    }
  }, [community]);

  if (!user || user.role !== "creator" || !community) {
    return <EmptyState icon={Users2} title={dict.common.empty} />;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    store.communities.update(community!.id, {
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
      type,
      status,
      isFree,
      subscriptionPrice: isFree ? 0 : subscriptionPrice,
      discountPercentage: isFree ? 0 : discountPercentage,
      categoryId
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="w-full">
      <DashboardPageHeader title={dict.creatorDash.myCommunityTitle} subtitle={dict.creatorDash.myCommunitySubtitle} />

      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 shadow-card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={dict.creatorDash.fieldCommunityNameEn} value={nameEn} onChange={setNameEn} dir="ltr" />
          <Field label={dict.creatorDash.fieldCommunityNameAr} value={nameAr} onChange={setNameAr} dir="rtl" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea label={dict.creatorDash.fieldCommunityDescEn} value={descriptionEn} onChange={setDescriptionEn} dir="ltr" />
          <TextArea label={dict.creatorDash.fieldCommunityDescAr} value={descriptionAr} onChange={setDescriptionAr} dir="rtl" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCommunityCategory}</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {locale === "ar" ? c.nameAr : c.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCommunityType}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("public")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                  type === "public" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/60"
                }`}
              >
                {dict.creatorDash.communityTypePublic}
              </button>
              <button
                type="button"
                onClick={() => setType("private")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                  type === "private" ? "border-primary-500 bg-primary-50 text-primary-700" : "border-line text-ink/60"
                }`}
              >
                {dict.creatorDash.communityTypePrivate}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink/60">{dict.creatorDash.fieldCommunityStatus}</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStatus("active")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                  status === "active" ? "border-success bg-success/10 text-success" : "border-line text-ink/60"
                }`}
              >
                {dict.common.active}
              </button>
              <button
                type="button"
                onClick={() => setStatus("inactive")}
                className={`flex-1 rounded-full border px-3 py-2 text-xs font-medium ${
                  status === "inactive" ? "border-accent-500 bg-accent-50 text-accent-700" : "border-line text-ink/60"
                }`}
              >
                {dict.common.inactive}
              </button>
            </div>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-ink/70">
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => setIsFree(e.target.checked)}
            className="h-4 w-4 rounded border-line"
          />
          {dict.creatorDash.fieldCommunityIsFree}
        </label>

        {!isFree && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={dict.creatorDash.fieldCommunitySubscriptionPrice}
              value={String(subscriptionPrice)}
              onChange={(v) => setSubscriptionPrice(Number(v) || 0)}
              type="number"
            />
            <Field
              label={dict.creatorDash.fieldCommunityDiscount}
              value={String(discountPercentage)}
              onChange={(v) => setDiscountPercentage(Math.min(100, Math.max(0, Number(v) || 0)))}
              type="number"
            />
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="rounded-full bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600">
            {dict.common.save}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 size={14} />
              {dict.creatorDash.communitySaved}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      <input
        type={type}
        dir={dir}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  dir
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-ink/60">{label}</label>
      <textarea
        dir={dir}
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-none rounded-xl border border-line bg-paper px-3.5 py-2.5 text-sm outline-none focus:border-primary-400"
      />
    </div>
  );
}
