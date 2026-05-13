"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/providers/language-provider";

export function ContactForm() {
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
      message?: string;
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
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contact-name">{t("homeQuickContact.labelName")}</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          placeholder={t("homeQuickContact.placeholderName")}
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">{t("homeQuickContact.labelEmail")}</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t("homeQuickContact.placeholderEmail")}
          className="h-10"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-message">{t("homeQuickContact.labelMessage")}</Label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={4}
          placeholder={t("homeQuickContact.placeholderMessage")}
          className="min-h-28 resize-y"
        />
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={sent || pending}>
        {sent
          ? t("homeQuickContact.sentButton")
          : pending
            ? t("homeQuickContact.sendingButton")
            : t("homeQuickContact.sendButton")}
      </Button>
      {sent ? (
        <p className="text-sm text-muted-foreground" role="status">
          {t("homeQuickContact.thanksStatus")}
        </p>
      ) : null}
    </form>
  );
}
