"use client";

import { useEffect, useRef } from "react";
import { useLanguage } from "@/components/providers/language-provider";
import { translateText } from "@/lib/translate";

const TEXT_NODE_TAG_BLACKLIST = new Set([
  "SCRIPT",
  "STYLE",
  "NOSCRIPT",
  "CODE",
  "PRE",
  "KBD",
  "SAMP",
  "SVG",
  "TEXTAREA",
  "INPUT",
]);

const ATTRIBUTE_KEYS = ["placeholder", "title", "aria-label"] as const;

function isTranslatableTextNode(node: Text): boolean {
  const parent = node.parentElement;
  if (!parent) return false;
  if (parent.closest("[data-no-auto-translate='true']")) return false;
  if (parent.isContentEditable) return false;
  if (TEXT_NODE_TAG_BLACKLIST.has(parent.tagName)) return false;
  const value = node.nodeValue?.trim() ?? "";
  if (!value) return false;
  // Skip pure punctuation/numeric tokens.
  return /[A-Za-z\u0980-\u09FF\uAC00-\uD7AF]/.test(value);
}

export function GlobalAutoTranslator() {
  const { lang } = useLanguage();
  const translatingRef = useRef(false);
  const textOriginalRef = useRef<WeakMap<Text, string>>(new WeakMap());
  const attrOriginalRef = useRef<WeakMap<Element, Record<string, string>>>(new WeakMap());

  useEffect(() => {
    if (typeof document === "undefined") return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const applyTranslations = async () => {
      if (disposed || translatingRef.current) return;
      translatingRef.current = true;

      try {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const textNodes: Text[] = [];
        let current = walker.nextNode();
        while (current) {
          const textNode = current as Text;
          if (isTranslatableTextNode(textNode)) textNodes.push(textNode);
          current = walker.nextNode();
        }

        const textBuckets = new Map<string, Text[]>();
        for (const node of textNodes) {
          const original = textOriginalRef.current.get(node) ?? node.nodeValue ?? "";
          if (!textOriginalRef.current.has(node)) {
            textOriginalRef.current.set(node, original);
          }
          const list = textBuckets.get(original) ?? [];
          list.push(node);
          textBuckets.set(original, list);
        }

        await Promise.all(
          Array.from(textBuckets.entries()).map(async ([original, nodes]) => {
            const translated = await translateText(original, lang, "auto");
            for (const node of nodes) {
              if (!disposed && node.isConnected) {
                node.nodeValue = translated;
              }
            }
          }),
        );

        const elements = document.body.querySelectorAll("*");
        const attrBuckets = new Map<string, Array<{ element: Element; key: (typeof ATTRIBUTE_KEYS)[number] }>>();
        await Promise.all(
          Array.from(elements).map(async (element) => {
            if (element.closest("[data-no-auto-translate='true']")) return;

            let originalRecord = attrOriginalRef.current.get(element);
            if (!originalRecord) {
              originalRecord = {};
              attrOriginalRef.current.set(element, originalRecord);
            }

            await Promise.all(
              ATTRIBUTE_KEYS.map(async (key) => {
                const currentValue = element.getAttribute(key);
                if (!currentValue?.trim()) return;
                const original = originalRecord[key] ?? currentValue;
                if (!originalRecord[key]) originalRecord[key] = original;
                const bucket = attrBuckets.get(original) ?? [];
                bucket.push({ element, key });
                attrBuckets.set(original, bucket);
              }),
            );
          }),
        );
        await Promise.all(
          Array.from(attrBuckets.entries()).map(async ([original, entries]) => {
            const translated = await translateText(original, lang, "auto");
            for (const entry of entries) {
              if (!disposed && entry.element.isConnected) {
                entry.element.setAttribute(entry.key, translated);
              }
            }
          }),
        );
      } finally {
        translatingRef.current = false;
      }
    };

    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        void applyTranslations();
      }, 120);
    };

    schedule();

    const observer = new MutationObserver(() => {
      schedule();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTE_KEYS],
    });

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      observer.disconnect();
    };
  }, [lang]);

  return null;
}
