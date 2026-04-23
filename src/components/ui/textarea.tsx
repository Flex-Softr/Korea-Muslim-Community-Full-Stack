import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border border-input bg-background px-4 py-2 text-base font-medium text-foreground transition-all duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:bg-muted/60 disabled:text-muted-foreground disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[success=true]:border-green-500 data-[success=true]:ring-2 data-[success=true]:ring-green-200 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
