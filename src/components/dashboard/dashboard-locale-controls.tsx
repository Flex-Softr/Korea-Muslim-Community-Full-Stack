"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CONTENT_LOCALE_LABELS,
  CONTENT_LOCALES,
  type ContentLocale,
} from "@/lib/i18n/content-locale";

type WriterSelectProps = {
  id?: string;
  value: ContentLocale;
  onChange: (locale: ContentLocale) => void;
};

export function DashboardWriterLanguageSelect({ id, value, onChange }: WriterSelectProps) {
  const fid = id ?? "dashboard-writer-lang";
  return (
    <div className="space-y-2">
      <Label htmlFor={fid}>Language you are writing in</Label>
      <select
        id={fid}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value as ContentLocale)}
      >
        {CONTENT_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {CONTENT_LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground">
        Only this language is filled when you create the item. Use the language tabs when editing to add the other
        languages.
      </p>
    </div>
  );
}

type TabBarProps = {
  value: ContentLocale;
  onChange: (locale: ContentLocale) => void;
  label?: string;
  className?: string;
};

export function DashboardContentLocaleTabBar({
  value,
  onChange,
  label = "Language",
  className,
}: TabBarProps) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      <div className="flex flex-wrap gap-2">
        {CONTENT_LOCALES.map((loc) => (
          <Button
            key={loc}
            type="button"
            size="sm"
            variant={value === loc ? "default" : "outline"}
            onClick={() => onChange(loc)}
          >
            {CONTENT_LOCALE_LABELS[loc]}
          </Button>
        ))}
      </div>
    </div>
  );
}
