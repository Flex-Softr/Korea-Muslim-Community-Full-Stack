"use client";

import * as React from "react";
import { THEME_STORAGE_KEY } from "@/components/providers/theme-init-inline";

type Theme = "light" | "dark" | "system";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark" | undefined;
  themes: Theme[];
};

const ThemeContext = React.createContext<ThemeContextValue | undefined>(
  undefined,
);

const MEDIA = "(prefers-color-scheme: dark)";

function systemPref(): "light" | "dark" {
  return window.matchMedia(MEDIA).matches ? "dark" : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? systemPref() : theme;
}

function applyDom(resolved: "light" | "dark") {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.style.colorScheme = resolved;
}

function disableTransitionsTemporarily() {
  const el = document.createElement("style");
  el.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}",
    ),
  );
  document.head.appendChild(el);
  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => document.head.removeChild(el), 1);
  };
}

function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") {
      return raw;
    }
  } catch {
    /* ignore */
  }
  return "system";
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}

type ThemeProviderProps = {
  children: React.ReactNode;
  attribute?: "class";
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
};

export function ThemeProvider({
  children,
  attribute: _attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  void _attribute;
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = React.useState<
    "light" | "dark" | undefined
  >(undefined);

  const applyWithOptionalTransitionKill = React.useCallback(
    (resolved: "light" | "dark") => {
      let restore: (() => void) | undefined;
      if (disableTransitionOnChange) {
        restore = disableTransitionsTemporarily();
      }
      applyDom(resolved);
      restore?.();
    },
    [disableTransitionOnChange],
  );

  React.useLayoutEffect(() => {
    setThemeState(readStoredTheme());
  }, []);

  React.useEffect(() => {
    const r = resolveTheme(theme);
    setResolvedTheme(r);
    applyWithOptionalTransitionKill(r);
  }, [theme, applyWithOptionalTransitionKill]);

  React.useEffect(() => {
    if (!enableSystem || theme !== "system") {
      return;
    }
    const mq = window.matchMedia(MEDIA);
    const onChange = () => {
      const r = systemPref();
      setResolvedTheme(r);
      applyWithOptionalTransitionKill(r);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, enableSystem, applyWithOptionalTransitionKill]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== THEME_STORAGE_KEY || e.newValue == null) {
        return;
      }
      const v = e.newValue;
      if (v === "light" || v === "dark" || v === "system") {
        setThemeState(v);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const themes = React.useMemo(
    () =>
      enableSystem
        ? (["light", "dark", "system"] as const)
        : (["light", "dark"] as const),
    [enableSystem],
  );

  const value = React.useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
      themes: [...themes],
    }),
    [theme, setTheme, resolvedTheme, themes],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
