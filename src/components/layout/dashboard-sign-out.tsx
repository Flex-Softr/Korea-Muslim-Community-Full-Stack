"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DashboardSignOut() {
  return (
    <Button
      type="button"
      variant="secondary"
      className="!py-1.5 !text-xs"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Sign out
    </Button>
  );
}
