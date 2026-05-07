"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function initials(name: string | null | undefined, email: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? "";
    const b = parts[1]?.[0] ?? "";
    return (a + b).toUpperCase() || a.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function ClientUserMenu({
  email,
  name,
  image,
  onBrand = false,
}: {
  email: string;
  name?: string | null;
  image?: string | null;
  onBrand?: boolean;
}) {
  const router = useRouter();
  const label = initials(name, email);

  const menuLabel =
    name?.trim() || email || "Account menu";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        aria-label={menuLabel}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-2 px-1.5 py-4 sm:px-2 shadow-sm shadow-zinc-800/60 hover:bg-zinc-200 focus-visible:ring-[#2c7bb6]/50 focus-visible:ring-offset-background dark:text-zinc-300 dark:hover:bg-zinc-800",
          onBrand &&
            "text-white hover:bg-white/15 hover:text-white focus-visible:ring-white/40",
        )}
      >
        <Avatar size="sm" className={onBrand ? "ring-2 ring-white/40" : undefined}>
          {image ? <AvatarImage src={image} alt={menuLabel} /> : null}
          <AvatarFallback
            className={onBrand ? "bg-white/20 text-white" : undefined}
          >
            {label}
          </AvatarFallback>
        </Avatar>
        <ChevronDown className="size-4 shrink-0 opacity-90" aria-hidden />
        {!onBrand ? (
          <span className="hidden max-w-[8rem] truncate text-xs text-muted-foreground sm:inline">
            {email}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-0.5">
            {name ? (
              <span className="text-sm font-medium text-foreground">{name}</span>
            ) : null}
            <span className="truncate text-xs text-muted-foreground">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard")}>
          <User className="mr-2 size-4" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="mr-2 size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
