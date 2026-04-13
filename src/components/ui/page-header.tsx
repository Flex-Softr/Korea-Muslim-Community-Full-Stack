import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
};

export function PageHeader({ title, subtitle, action, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 space-y-2", className)}>
      {breadcrumb && breadcrumb.length > 0 ? (
        <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground" aria-label="Breadcrumb">
          {breadcrumb.map((item, index) => {
            const isLast = index === breadcrumb.length - 1;
            return (
              <div key={`${item.label}-${index}`} className="inline-flex items-center gap-1">
                {item.href && !isLast ? (
                  <Link href={item.href} className="transition-colors hover:text-foreground">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-medium text-foreground" : ""}>{item.label}</span>
                )}
                {!isLast ? <ChevronRight className="size-3" aria-hidden /> : null}
              </div>
            );
          })}
        </nav>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}
