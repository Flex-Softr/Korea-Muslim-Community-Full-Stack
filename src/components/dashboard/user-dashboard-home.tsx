"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/components/providers/language-provider";
import type { Lang } from "@/lib/i18n/lang";

type BlogItem = {
  id: string;
  title: string;
  category: string;
  dateIso: string;
  status?: "pending" | "published";
};

export type UserDashboardHomeProfile = {
  name: string;
  email: string;
  memberCode: string | null;
  city: string | null;
};

function localeTagForLang(lang: Lang): string {
  if (lang === "bn") return "bn-BD";
  if (lang === "ko") return "ko-KR";
  return "en-US";
}

function formatDate(dateIso: string, lang: Lang): string {
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString(localeTagForLang(lang), { year: "numeric", month: "short", day: "numeric" });
}

export function UserDashboardHome({
  profile,
  blogs,
}: {
  profile: UserDashboardHomeProfile;
  blogs: BlogItem[];
}) {
  const { t, lang } = useLanguage();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{t("dashboard.home.title")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("dashboard.home.introBeforeLink")}{" "}
              <Link href="/dashboard/settings#account-profile" className="font-medium text-primary underline-offset-4 hover:underline">
                {t("common.settings")}
              </Link>
              {t("dashboard.home.introAfterLink")}
            </p>
          </div>
          <Link
            href="/dashboard/blogs/create"
            className={buttonVariants({ variant: "default", size: "default", className: "w-full sm:w-auto" })}
          >
            {t("dashboard.home.writeBlog")}
          </Link>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t("dashboard.home.email")}</Label>
            <Input value={profile.email} readOnly className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>{t("dashboard.home.name")}</Label>
            <Input value={profile.name} readOnly className="bg-muted" />
          </div>
          {profile.memberCode ? (
            <div className="space-y-2">
              <Label>{t("dashboard.home.memberCode")}</Label>
              <Input value={profile.memberCode} readOnly className="bg-muted" />
            </div>
          ) : null}
          {profile.city ? (
            <div className="space-y-2">
              <Label>{t("dashboard.home.cityKorea")}</Label>
              <Input value={profile.city} readOnly className="bg-muted" />
            </div>
          ) : null}
          <div className="pt-1">
            <Link
              href="/dashboard/settings#account-profile"
              className={buttonVariants({ variant: "secondary" })}
            >
              {t("dashboard.home.editFullProfile")}
            </Link>
          </div>
        </div>
      </section>

      <section id="my-blogs" className="rounded-xl border border-border/80 bg-card p-4 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">{t("dashboard.home.myBlogs")}</h2>
        {blogs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.home.noBlogsYet")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm sm:min-w-[40rem]">
              <thead>
                <tr className="border-b border-border/80 bg-muted/70 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-2 py-2">{t("dashboard.home.colTitle")}</th>
                  <th className="px-2 py-2">{t("dashboard.home.colCategory")}</th>
                  <th className="px-2 py-2">{t("dashboard.home.colStatus")}</th>
                  <th className="px-2 py-2">{t("dashboard.home.colCreatedAt")}</th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog, idx) => (
                  <tr
                    key={blog.id}
                    className={
                      idx % 2 === 0
                        ? "border-b border-border/60 bg-background text-foreground transition-colors duration-200 hover:bg-muted/60"
                        : "border-b border-border/60 bg-muted/30 text-foreground transition-colors duration-200 hover:bg-muted/60"
                    }
                  >
                    <td className="px-2 py-2 font-medium">{blog.title}</td>
                    <td className="px-2 py-2">{blog.category}</td>
                    <td className="px-2 py-2">
                      <span
                        className={
                          blog.status === "pending"
                            ? "inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800"
                            : "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                        }
                      >
                        {blog.status === "pending"
                          ? t("dashboard.home.statusPending")
                          : t("dashboard.home.statusPublished")}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-muted-foreground">{formatDate(blog.dateIso, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
