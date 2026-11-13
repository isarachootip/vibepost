import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-20 w-full rounded-xl border border-[var(--border-control)] bg-[var(--surface-elevated)]/80 px-3 py-2.5 text-base text-foreground shadow-[inset_2px_2px_5px_var(--neu-dark)] transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/25 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
