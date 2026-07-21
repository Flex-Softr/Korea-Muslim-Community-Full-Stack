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

export function SupporterSubmissionForm() {
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
        whyWantBecomeSupporter: String(form.get("whyWantBecomeSupporter") || ""),
        previouslySupporter: form.get("previouslySupporter") === "true",
        directJoinOnOrganization: form.get("directJoinOnOrganization") === "true",
      };

      const res = await fetch("/api/supporter-submission", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };

      if (!res.ok) {
        setError(data.error || t("supporterSubmission.errorSubmitTitle"));
        return;
      }

      formEl.reset();
      notify(t("supporterSubmission.successSubmitTitle"), "success");
    } catch {
      setError(t("supporterSubmission.errorSubmitTitle"));
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(ev) => void handleSubmit(ev)} className="space-y-6">
      {/* Declaration / Terms */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-foreground/90 dark:bg-primary/10">
        <p className="italic font-medium">{t("supporterSubmission.termsAndConditions")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supporter-name">
            {t("supporterSubmission.form.name")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="supporter-name"
            name="name"
            autoComplete="name"
            required
            placeholder={t("supporterSubmission.placeholder.name")}
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supporter-mobile">
            {t("supporterSubmission.form.mobileNumber")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="supporter-mobile"
            name="mobileNumber"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            placeholder={t("supporterSubmission.placeholder.mobileNumber")}
            className="h-10"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supporter-occupation">
            {t("supporterSubmission.form.occupation")} <span className="text-destructive">*</span>
          </Label>
          <select
            id="supporter-occupation"
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
              {t("supporterSubmission.placeholder.occupation")}
            </option>
            {CONTACT_OCCUPATION_VALUES.map((value) => (
              <option key={value} value={value}>
                {t(OCCUPATION_LABEL_KEY[value])}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supporter-visa">
            {t("supporterSubmission.form.visaType")} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="supporter-visa"
            name="visaType"
            required
            placeholder={t("supporterSubmission.placeholder.visaType")}
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="supporter-address">
          {t("supporterSubmission.form.address")} <span className="text-destructive">*</span>
        </Label>
        <Input
          id="supporter-address"
          name="address"
          autoComplete="street-address"
          required
          placeholder={t("supporterSubmission.placeholder.address")}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="supporter-why">
          {t("supporterSubmission.form.whyWantBecomeSupporter")} <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="supporter-why"
          name="whyWantBecomeSupporter"
          required
          rows={4}
          placeholder={t("supporterSubmission.placeholder.whyWantBecomeSupporter")}
          className="min-h-24 resize-y"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="supporter-previously">
            {t("supporterSubmission.form.previouslySupporter")} <span className="text-destructive">*</span>
          </Label>
          <select
            id="supporter-previously"
            name="previouslySupporter"
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
              {t("supporterSubmission.placeholder.previouslySupporter")}
            </option>
            <option value="true">{t("supporterSubmission.options.yes")}</option>
            <option value="false">{t("supporterSubmission.options.no")}</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="supporter-direct-join">
            {t("supporterSubmission.form.directJoinOnOrganization")} <span className="text-destructive">*</span>
          </Label>
          <select
            id="supporter-direct-join"
            name="directJoinOnOrganization"
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
              {t("supporterSubmission.placeholder.directJoinOnOrganization")}
            </option>
            <option value="true">{t("supporterSubmission.options.yes")}</option>
            <option value="false">{t("supporterSubmission.options.no")}</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto px-8" disabled={pending}>
        {pending ? "..." : t("supporterSubmission.form.submit")}
      </Button>
    </form>
  );
}
