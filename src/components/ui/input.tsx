import type { InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-zinc-300 bg-background px-3 py-2 text-sm outline-none ring-offset-background focus:border-foreground focus:ring-2 focus:ring-foreground/20 dark:border-zinc-600 ${className}`}
      {...props}
    />
  );
}
