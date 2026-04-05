"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, LogOut } from "lucide-react";
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
}: {
  email: string;
  name?: string | null;
}) {
  const router = useRouter();
  const label = initials(name, email);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-2 text-muted-foreground",
        )}
      >
        <ArrowLeft className="size-4" />
        <span className="hidden sm:inline">Back to site</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1.5 outline-none ring-offset-background hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar size="sm">
            <AvatarFallback>{label}</AvatarFallback>
          </Avatar>
          <div className="hidden text-left text-sm sm:block">
            <p className="font-medium leading-none text-foreground">
              {name || "Account"}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{email}</p>
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
