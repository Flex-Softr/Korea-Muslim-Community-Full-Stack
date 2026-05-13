"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/providers/language-provider";
import { cn } from "@/lib/utils";

export function HomeQuickContact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      message: String(form.get("message") || ""),
    };

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
    };

    setPending(false);
    if (!res.ok) {
      setError(data.error || t("homeQuickContact.errorGeneric"));
      return;
    }
    setSent(true);
    e.currentTarget.reset();
  }

  return (
    <section
      className="relative overflow-hidden border-t border-border/50 bg-gradient-to-b from-muted/30 via-background to-muted/20 dark:from-muted/10 dark:to-muted/5"
      aria-labelledby="home-quick-contact-heading"
    >
      <div
        className="pointer-events-none absolute -end-24 -top-24 size-[28rem] rounded-full bg-[#2c7bb6]/[0.07] blur-3xl dark:bg-sky-500/10"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -start-24 size-[22rem] rounded-full bg-[#2c7bb6]/5 blur-3xl dark:bg-sky-500/5"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16 lg:items-start">
          <div className="lg:col-span-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#2c7bb6] dark:text-sky-400">
              {t("homeQuickContact.eyebrow")}
            </p>
            <h2
              id="home-quick-contact-heading"
              className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            >
              {t("homeQuickContact.heading")}
            </h2>
            <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("homeQuickContact.intro")}
            </p>

            <ul className="mt-10 space-y-5">
              <li className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2c7bb6]/10 text-[#2c7bb6] dark:bg-sky-400/15 dark:text-sky-400">
                  <Mail className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("homeQuickContact.emailTitle")}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t("homeQuickContact.emailHint")}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2c7bb6]/10 text-[#2c7bb6] dark:bg-sky-400/15 dark:text-sky-400">
                  <MapPin className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("homeQuickContact.locationTitle")}
                  </p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {t("homeQuickContact.locationHint")}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2c7bb6]/10 text-[#2c7bb6] dark:bg-sky-400/15 dark:text-sky-400">
                  <MessageCircle className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("homeQuickContact.fullPageTitle")}
                  </p>
                  <Link
                    href="/contact"
                    className="mt-0.5 inline-block text-sm font-medium text-[#2c7bb6] underline-offset-4 hover:underline dark:text-sky-400"
                  >
                    {t("homeQuickContact.fullPageLink")}
                  </Link>
                </div>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-7">
            <div
              className={cn(
                "rounded-3xl border border-border/80 bg-card/90 p-6 shadow-xl shadow-black/[0.04] ring-1 ring-black/[0.04] backdrop-blur-sm",
                "sm:p-8 dark:bg-card/80 dark:shadow-black/20 dark:ring-white/10",
              )}
            >
              <form
                onSubmit={(ev) => void handleSubmit(ev)}
                className="space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="home-quick-name" className="text-foreground">
                      {t("homeQuickContact.labelName")}
                    </Label>
                    <Input
                      id="home-quick-name"
                      name="name"
                      autoComplete="name"
                      required
                      placeholder={t("homeQuickContact.placeholderName")}
                      className="h-11 rounded-xl border-border/80 bg-background/80 shadow-sm transition-[box-shadow] focus-visible:border-[#2c7bb6]/40 focus-visible:ring-[#2c7bb6]/25 dark:focus-visible:border-sky-500/40 dark:focus-visible:ring-sky-500/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="home-quick-email" className="text-foreground">
                      {t("homeQuickContact.labelEmail")}
                    </Label>
                    <Input
                      id="home-quick-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder={t("homeQuickContact.placeholderEmail")}
                      className="h-11 rounded-xl border-border/80 bg-background/80 shadow-sm transition-[box-shadow] focus-visible:border-[#2c7bb6]/40 focus-visible:ring-[#2c7bb6]/25 dark:focus-visible:border-sky-500/40 dark:focus-visible:ring-sky-500/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-quick-message" className="text-foreground">
                    {t("homeQuickContact.labelMessage")}
                  </Label>
                  <Textarea
                    id="home-quick-message"
                    name="message"
                    required
                    rows={4}
                    placeholder={t("homeQuickContact.placeholderMessage")}
                    className="min-h-[7.5rem] resize-y rounded-xl border-border/80 bg-background/80 shadow-sm transition-[box-shadow] focus-visible:border-[#2c7bb6]/40 focus-visible:ring-[#2c7bb6]/25 dark:focus-visible:border-sky-500/40 dark:focus-visible:ring-sky-500/20"
                  />
                </div>

                {error ? (
                  <p className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    type="submit"
                    disabled={sent || pending}
                    className="h-11 rounded-xl bg-[#2c7bb6] px-6 text-sm font-semibold shadow-md shadow-[#2c7bb6]/20 hover:bg-[#256fa3] dark:shadow-sky-500/10"
                  >
                    {sent ? (
                      t("homeQuickContact.sentButton")
                    ) : pending ? (
                      t("homeQuickContact.sendingButton")
                    ) : (
                      <>
                        <Send className="me-2 size-4" aria-hidden />
                        {t("homeQuickContact.sendButton")}
                      </>
                    )}
                  </Button>
                  {sent ? (
                    <p className="text-sm text-muted-foreground" role="status">
                      {t("homeQuickContact.thanksStatus")}
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground sm:text-end sm:max-w-[14rem]">
                      {t("homeQuickContact.privacyNote")}
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
