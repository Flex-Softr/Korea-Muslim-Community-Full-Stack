import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium transition-all duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-indigo-500 focus-visible:ring-3 focus-visible:ring-indigo-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60 aria-invalid:border-red-500 aria-invalid:ring-3 aria-invalid:ring-red-200 data-[success=true]:border-green-500 data-[success=true]:ring-2 data-[success=true]:ring-green-200 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }
