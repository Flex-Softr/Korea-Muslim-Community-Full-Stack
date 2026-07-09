"use client";

import { useEffect, useId, useRef, useState } from "react";
import type Quill from "quill";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  uploadType?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  className,
  uploadType = "misc",
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Quill | null>(null);
  const isSettingRef = useRef(false);
  const id = useId();
  const toolbarId = `quill-toolbar-${id.replace(/:/g, "")}`;
  const [isCodeView, setIsCodeView] = useState(false);

  useEffect(() => {
    let active = true;
    let root: HTMLDivElement | null = null;

    const setup = async () => {
      if (!containerRef.current) return;
      const [{ default: Quill }] = await Promise.all([
        import("quill"),
        import("quill/dist/quill.snow.css"),
      ]);
      if (!active || !containerRef.current) return;

      root = document.createElement("div");
      root.className = "min-h-[220px]";
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(root);

      const quill = new Quill(root, {
        theme: "snow",
        placeholder,
        modules: {
          table: true,
          toolbar: {
            container: `#${toolbarId}`,
            handlers: {
              image: () => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/*";
                input.onchange = async () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const formData = new FormData();
                  formData.append("file", file);
                  try {
                    const res = await fetch(`/api/upload/${uploadType}?folder=content`, {
                      method: "POST",
                      body: formData,
                    });
                    const data = (await res.json()) as { url?: string };
                    const src = data.url ?? "";
                    if (!res.ok || !src) return;
                    const range = quill.getSelection(true);
                    const index = range?.index ?? quill.getLength();
                    quill.insertEmbed(index, "image", src, "user");
                    quill.setSelection(index + 1, 0, "user");
                  } catch {
                    return;
                  }
                };
                input.click();
              },
            },
          },
        },
      });

      editorRef.current = quill;

      if (value) {
        quill.clipboard.dangerouslyPasteHTML(value);
      }

      quill.on("text-change", () => {
        if (isSettingRef.current) return;
        onChange(quill.root.innerHTML);
      });
    };

    void setup();

    return () => {
      active = false;
      editorRef.current = null;
      if (root && root.parentNode) {
        root.parentNode.removeChild(root);
      }
    };
  }, [onChange, placeholder, toolbarId, uploadType]);

  useEffect(() => {
    if (isCodeView) return; // Skip updating Quill while user is editing in HTML code view
    const quill = editorRef.current;
    if (!quill) return;
    const current = (quill.root.innerHTML || "").trim();
    const next = (value || "").trim();
    if (current === next) return;
    isSettingRef.current = true;
    quill.setContents([]);
    if (next) {
      quill.clipboard.dangerouslyPasteHTML(next);
    }
    isSettingRef.current = false;
  }, [value, isCodeView]);

  return (
    <div className={cn("w-full rounded-md border border-border/80 bg-background overflow-hidden", className)}>
      <div id={toolbarId} className="border-b border-border/80 flex items-center justify-between px-2 py-1 flex-wrap">
        <div className={cn("flex flex-wrap items-center", isCodeView && "opacity-40 pointer-events-none")}>
          <span className="ql-formats">
            <select className="ql-header" defaultValue="">
              <option value="1">H1</option>
              <option value="2">H2</option>
              <option value="3">H3</option>
              <option value="">Normal</option>
            </select>
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-bold" aria-label="Bold" />
            <button type="button" className="ql-italic" aria-label="Italic" />
            <button type="button" className="ql-underline" aria-label="Underline" />
            <button type="button" className="ql-strike" aria-label="Strikethrough" />
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-list" value="ordered" aria-label="Ordered list" />
            <button type="button" className="ql-list" value="bullet" aria-label="Bullet list" />
            <button type="button" className="ql-blockquote" aria-label="Blockquote" />
          </span>
          <span className="ql-formats">
            <select className="ql-align" defaultValue="">
              <option value="">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </span>
          <span className="ql-formats">
            <button type="button" className="ql-link" aria-label="Insert link" />
            <button type="button" className="ql-image" aria-label="Insert image" />
            <button type="button" className="ql-table" aria-label="Insert table" />
            <button type="button" className="ql-clean" aria-label="Clear formatting" />
          </span>
        </div>

        <div className="flex items-center ql-formats">
          <button
            type="button"
            className={cn(
              "p-1.5 rounded-md hover:bg-muted text-slate-700 flex items-center justify-center border border-border/80 transition-colors",
              isCodeView && "bg-[#2c7bb6] text-white hover:bg-[#2c7bb6]/90 border-transparent"
            )}
            onClick={() => {
              if (isCodeView) {
                // Switching from HTML view to Quill View: Sync HTML content back to editor
                const quill = editorRef.current;
                if (quill) {
                  isSettingRef.current = true;
                  quill.setContents([]);
                  quill.clipboard.dangerouslyPasteHTML(value || "");
                  isSettingRef.current = false;
                }
              }
              setIsCodeView(!isCodeView);
            }}
            title="Toggle HTML Code View"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        ref={containerRef} 
        className={cn("[&_.ql-container]:border-0 [&_.ql-editor]:min-h-[220px]", isCodeView && "hidden")} 
      />

      {isCodeView && (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste or write HTML code here..."
          className="w-full min-h-[220px] p-3 font-mono text-sm border-0 focus:ring-0 focus:outline-none bg-background resize-y block border-t border-border/80"
        />
      )}
    </div>
  );
}
