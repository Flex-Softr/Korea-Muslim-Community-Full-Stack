"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, LogOut, Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

function initials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || a.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function DashboardHeader({
  email,
  name,
  onMenuClick,
}: {
  email: string;
  name?: string | null;
  /** Opens the mobile navigation drawer (dashboard shell only). */
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const label = initials(name, email);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur sm:gap-4 sm:px-6">
      {onMenuClick ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden />
        </Button>
      ) : null}

      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "shrink-0 gap-2 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4 shrink-0" />
        <span className="hidden min-[380px]:inline sm:inline">Back to site</span>
      </Link>

      <span className="min-w-0 flex-1" aria-hidden />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex max-w-[min(100%,12rem)] min-w-0 items-center gap-2 rounded-lg p-1.5 outline-none ring-offset-background hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none">
          <Avatar size="sm" className="shrink-0">
            <AvatarFallback>{label}</AvatarFallback>
          </Avatar>
          <div className="hidden min-w-0 text-left text-sm sm:block">
            <p className="truncate font-medium leading-none text-foreground">
              {name || "Account"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 p-0" sideOffset={6}>
          <div className="border-b border-border px-3 py-3">
            <p className="text-sm font-medium text-foreground">
              {name || "Account"}
            </p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="p-1">
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              Settings
            </DropdownMenuItem>
          </div>
          <DropdownMenuSeparator className="my-0" />
          <div className="p-2">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-center gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
