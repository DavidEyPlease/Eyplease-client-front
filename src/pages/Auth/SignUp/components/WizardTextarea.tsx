import { forwardRef } from "react"
import type { UseFormRegisterReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import ErrorText from "./ErrorText"

interface Props {
    placeholder?: string
    rows?: number
    maxLength?: number
    register?: UseFormRegisterReturn<string>
    error?: string
    autoFocus?: boolean
    currentLength?: number
    className?: string
}

const WizardTextarea = forwardRef<HTMLTextAreaElement, Props>(({
    placeholder,
    rows = 5,
    maxLength,
    register,
    error,
    autoFocus,
    currentLength,
    className,
}, ref) => {
    return (
        <div>
            <textarea
                ref={ref}
                rows={rows}
                maxLength={maxLength}
                placeholder={placeholder}
                autoFocus={autoFocus}
                aria-invalid={error ? "true" : "false"}
                {...register}
                className={cn(
                    // Mismo control que `ui/input`: píldora suave que se aclara y se enfoca en violeta
                    "w-full resize-none rounded-brand border border-input bg-surface-soft px-4 py-3 text-[15px] leading-relaxed outline-none transition-[box-shadow,background-color,border-color] dark:bg-input/30",
                    "placeholder:text-muted-foreground focus-visible:border-primary-light focus-visible:bg-card focus-visible:ring-4 focus-visible:ring-primary/15",
                    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
                    className
                )}
            />
            <div className="mt-1 flex items-center justify-between gap-2">
                {error ? <ErrorText error={error} /> : <span />}
                {maxLength && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                        {currentLength ?? 0}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    )
})

WizardTextarea.displayName = "WizardTextarea"

export default WizardTextarea
