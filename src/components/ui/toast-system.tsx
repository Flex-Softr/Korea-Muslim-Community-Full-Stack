"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastTone = "success" | "error" | "info" | "warning";

type ToastEntry = {
  id: string;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  notify: (message: string, tone?: ToastTone) => void;
};

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToastSystem(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToastSystem must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastEntry[]>([]);

  const notify = React.useCallback((message: string, tone: ToastTone = "success") => {
    const id = crypto.randomUUID();
    setToasts((cur) => [...cur, { id, message, tone }]);
    setTimeout(() => {
      setToasts((cur) => cur.filter((t) => t.id !== id));
    }, 2600);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "animate-in fade-in zoom-in-95 rounded-lg border px-3 py-2 text-sm shadow-lg transition-all duration-200",
              toast.tone === "success" &&
                "border-emerald-300 bg-emerald-50 text-emerald-800",
              toast.tone === "error" && "border-red-300 bg-red-50 text-red-800",
              (toast.tone === "info" || toast.tone === "warning") &&
                "border-indigo-300 bg-indigo-50 text-indigo-800",
            )}
            role="status"
          >
            <div className="flex items-start gap-2">
              {toast.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
              ) : null}
              {toast.tone === "error" ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              ) : null}
              {(toast.tone === "info" || toast.tone === "warning") ? (
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              ) : null}
              <span>{toast.message}</span>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
