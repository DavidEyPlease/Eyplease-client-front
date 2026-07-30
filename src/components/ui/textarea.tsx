import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Mismo control que Input (ver ui/input.tsx): píldora suave con foco violeta
        "border-input placeholder:text-muted-foreground focus-visible:border-primary-light focus-visible:bg-card focus-visible:ring-primary/15 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 bg-surface-soft flex field-sizing-content min-h-16 w-full rounded-brand border px-4 py-3 text-base transition-[color,box-shadow,background-color] outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
