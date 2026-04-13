"use client";

import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write content...",
  className,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any>(null);
  const isSettingRef = useRef(false);
  const id = useId();
  const toolbarId = `quill-toolbar-${id.replace(/:/g, "")}`;

  useEffect(() => {
    let active = true;
    let root: HTMLDivElement | null = null;

    const setup = async () => {
      if (!containerRef.current) return;
      const [{ default: Quill }, _themeCss] = await Promise.all([
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
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => {
                    const src = typeof reader.result === "string" ? reader.result : "";
                    if (!src) return;
                    const range = quill.getSelection(true);
                    const index = range?.index ?? quill.getLength();
                    quill.insertEmbed(index, "image", src, "user");
                    quill.setSelection(index + 1, 0, "user");
                  };
                  reader.readAsDataURL(file);
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
  }, [onChange, placeholder, toolbarId]);

  useEffect(() => {
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
  }, [value]);

  return (
    <div className={cn("w-full rounded-md border border-border/80 bg-background", className)}>
      <div id={toolbarId} className="border-b border-border/80">
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
      <div ref={containerRef} className="[&_.ql-container]:border-0 [&_.ql-editor]:min-h-[220px]" />
    </div>
  );
}
