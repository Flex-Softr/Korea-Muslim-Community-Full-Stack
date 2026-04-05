"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function ClientUserMenu({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[10rem] truncate text-xs text-zinc-500 sm:inline">
        {email}
      </span>
      <Button
        type="button"
        variant="secondary"
        className="!py-1.5 !text-xs"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </Button>
    </div>
  );
}
