"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/components/providers/language-provider";
import { useToastSystem } from "@/components/ui/toast-system";
import {
  CONTACT_OCCUPATION_VALUES,
  type ContactOccupationValue,
} from "@/lib/contact/occupations";
import { submitContactForm } from "@/lib/services/contact-form";
import { cn } from "@/lib/utils";

const OCCUPATION_LABEL_KEY: Record<
  ContactOccupationValue,
  | "homeQuickContact.occupationOptionStudent"
  | "homeQuickContact.occupationOptionJobHolder"
  | "homeQuickContact.occupationOptionEps"
> = {
  student: "homeQuickContact.occupationOptionStudent",
  job_holder: "homeQuickContact.occupationOptionJobHolder",
  eps: "homeQuickContact.occupationOptionEps",
};

const selectClass =
  "h-10 w-full min-w-0 rounded-lg border border-input bg-background px-3 text-base font-medium text-foreground transition-all duration-200 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm";

export function ContactForm() {
  const { t } = useLanguage();
  const { notify } = useToastSystem();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    setError(null);
    setPending(true);
    try {
      const form = new FormData(formEl);
      const payload = {
        name: String(form.get("name") || ""),
        mobileNumber: String(form.get("mobileNumber") || ""),
        occupation: String(form.get("occupation") || ""),
        address: String(form.get("address") || ""),
        visaType: String(form.get("visaType") || ""),
        message: String(form.get("message") || ""),
      };

      const res = await submitContactForm(payload);
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.error || t("homeQuickContact.errorGeneric"));
        return;
      }
      formEl.reset();
      notify(t("homeQuickContact.toastSuccess"), "success");
    } catch {
      setError(t("homeQuickContact.errorGeneric"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
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
          <Label htmlFor="contact-mobile">
            {t("homeQuickContact.labelMobile")}
          </Label>
          <Input
            id="contact-mobile"
            name="mobileNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder={t("homeQuickContact.placeholderMobile")}
            className="h-10"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-occupation">
          {t("homeQuickContact.labelOccupation")}
        </Label>
        <select
          id="contact-occupation"
          name="occupation"
          required
          defaultValue=""
          className={cn(
            selectClass,
            "appearance-none bg-[length:1rem] bg-[position:right_0.65rem_center] bg-no-repeat pe-9",
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          }}
        >
          <option value="" disabled>
            {t("homeQuickContact.occupationPlaceholder")}
          </option>
          {CONTACT_OCCUPATION_VALUES.map((value) => (
            <option key={value} value={value}>
              {t(OCCUPATION_LABEL_KEY[value])}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="contact-address">
            {t("homeQuickContact.labelAddress")}
          </Label>
          <Input
            id="contact-address"
            name="address"
            autoComplete="street-address"
            required
            placeholder={t("homeQuickContact.placeholderAddress")}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact-visa">
            {t("homeQuickContact.labelVisaType")}
          </Label>
          <Input
            id="contact-visa"
            name="visaType"
            required
            placeholder={t("homeQuickContact.placeholderVisaType")}
            className="h-10"
          />
        </div>
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
      <Button type="submit" disabled={pending}>
        {pending
          ? t("homeQuickContact.sendingButton")
          : t("homeQuickContact.sendButton")}
      </Button>
    </form>
  );
}
