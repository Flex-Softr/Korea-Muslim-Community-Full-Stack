"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  uploadType?: string;
};

type UploaderResponse = { url?: string; error?: string };

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  className,
  uploadType = "misc",
}: RichTextEditorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const config = useMemo(
    () => ({
      readonly: false,
      theme: isDark ? "dark" : "default",
      placeholder,
      height: 420,
      toolbarAdaptive: false,
      toolbarSticky: false,
      uploader: {
        url: `/api/upload/${uploadType}?folder=content`,
        withCredentials: true,
        format: "json",
        method: "POST",
        filesVariableName() {
          return "file";
        },
        isSuccess(resp: UploaderResponse) {
          return Boolean(resp?.url);
        },
        getMessage(resp: UploaderResponse) {
          return resp?.error ?? "";
        },
        process(resp: UploaderResponse) {
          return {
            files: resp.url ? [resp.url] : [],
            baseurl: "",
            isImages: [true],
          };
        },
      },
    }),
    [placeholder, uploadType, isDark],
  );

  return (
    <div
      className={cn(
        "w-full rounded-md border border-border/80 bg-background overflow-hidden [&_.jodit-react-container]:w-full",
        className,
      )}
    >
      <JoditEditor
        value={value || ""}
        config={config}
        onChange={(html) => onChange(html)}
      />
    </div>
  );
}
