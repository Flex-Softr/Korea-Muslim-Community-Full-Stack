"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomeActions() {
  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
      <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
        Create account
      </Link>
      <Link
        href="/login"
        className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
      >
        Log in
      </Link>
      <Link
        href="/contact"
        className={cn(
          buttonVariants({ variant: "ghost", size: "lg" }),
          "text-muted-foreground",
        )}
      >
        Contact
      </Link>
    </div>
  );
}
