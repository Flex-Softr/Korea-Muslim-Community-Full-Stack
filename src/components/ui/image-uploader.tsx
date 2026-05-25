"use client";

import Image from "next/image";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ImageUploaderProps = {
  value: string | null;
  onChange: (next: string | null) => void;
  accept?: string;
  maxSizeMb?: number;
  disabled?: boolean;
  helperText?: string;
  error?: string | null;
  className?: string;
  uploadType?: string;
  uploadFolder?: string;
};

export function ImageUploader({
  value,
  onChange,
  accept = "image/*",
  maxSizeMb = 5,
  disabled = false,
  helperText,
  error,
  className,
  uploadType = "misc",
  uploadFolder = "images",
}: ImageUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const pickFile = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const clear = () => {
    onChange(null);
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLocalError("Only image files are allowed.");
      return;
    }
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError(`Image must be ${maxSizeMb}MB or smaller.`);
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch(`/api/upload/${uploadType}?folder=${uploadFolder}`, {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setLocalError(data.error ?? "Could not upload the image.");
        return;
      }
      onChange(data.url);
      setLocalError(null);
    } catch {
      setLocalError("Could not upload the image.");
    } finally {
      setUploading(false);
    }
  };

  const message = error ?? localError ?? helperText ?? null;

  return (
    <div className={cn("space-y-3", className)}>
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex items-start gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={pickFile} disabled={disabled || uploading}>
            {uploading ? "Uploading..." : value ? "Replace image" : "Upload image"}
          </Button>
          {value ? (
            <Button type="button" variant="ghost" onClick={clear} disabled={disabled}>
              Remove
            </Button>
          ) : null}
        </div>
      </div>

      {message ? (
        <p
          className={cn(
            "text-xs",
            error || localError ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
