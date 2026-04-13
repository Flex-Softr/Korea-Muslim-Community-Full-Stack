import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium transition-all duration-200 outline-none placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-200 data-[success=true]:border-green-500 data-[success=true]:ring-2 data-[success=true]:ring-green-200 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
