"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type FileUploaderProps = {
  value: string | null;
  onChange: (next: string | null) => void;
  accept?: string;
  maxSizeMb?: number;
  helperText?: string;
  uploadType?: string;
  uploadFolder?: string;
};

export function FileUploader({
  value,
  onChange,
  accept = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,image/*",
  maxSizeMb = 12,
  helperText,
  uploadType = "download",
  uploadFolder = "files",
}: FileUploaderProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxBytes = maxSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File must be ${maxSizeMb}MB or smaller.`);
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
        setError(data.error ?? "Could not upload the file.");
        return;
      }
      onChange(data.url);
      setFileName(file.name);
      setError(null);
    } catch {
      setError("Could not upload the file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? "Uploading..." : value ? "Replace file" : "Upload file"}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onChange(null);
              setFileName("");
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            Remove
          </Button>
        ) : null}
      </div>
      {fileName || value ? (
        <p className="text-xs text-muted-foreground">{fileName || "File uploaded."}</p>
      ) : null}
      {error || helperText ? (
        <p className={`text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}>
          {error ?? helperText}
        </p>
      ) : null}
    </div>
  );
}
