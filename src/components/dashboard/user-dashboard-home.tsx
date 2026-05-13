"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAccountProfile } from "@/lib/api/account-profile";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToastSystem } from "@/components/ui/toast-system";
import { useLanguage } from "@/components/providers/language-provider";
import type { Lang } from "@/lib/i18n/lang";

type BlogItem = {
  id: string;
  title: string;
  category: string;
  dateIso: string;
  status?: "pending" | "published";
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

export function UserDashboardHome() {
  const { notify } = useToastSystem();
  const { t, lang } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [memberCode, setMemberCode] = useState<string | null>(null);
  const [city, setCity] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<BlogItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [profile, blogRes] = await Promise.all([
          getAccountProfile(),
          fetch("/api/dashboard/blog?mine=true", { cache: "no-store" }),
        ]);
        if (!blogRes.ok) throw new Error("Failed blogs");
        const blogData = (await blogRes.json()) as { items?: BlogItem[] };
        if (cancelled) return;
        setName(profile.user.name ?? "");
        setEmail(profile.user.email);
        setMemberCode(profile.member?.memberCode ?? null);
        setCity(profile.member?.cityKorea ?? null);
        setBlogs(blogData.items ?? []);
      } catch {
        if (!cancelled) notify(t("dashboard.home.loadError"), "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [notify, t]);

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

        {loading ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.home.loadingProfile")}</p>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("dashboard.home.email")}</Label>
              <Input value={email} readOnly className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label>{t("dashboard.home.name")}</Label>
              <Input value={name} readOnly className="bg-muted" />
            </div>
            {memberCode ? (
              <div className="space-y-2">
                <Label>{t("dashboard.home.memberCode")}</Label>
                <Input value={memberCode} readOnly className="bg-muted" />
              </div>
            ) : null}
            {city ? (
              <div className="space-y-2">
                <Label>{t("dashboard.home.cityKorea")}</Label>
                <Input value={city} readOnly className="bg-muted" />
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
        )}
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
