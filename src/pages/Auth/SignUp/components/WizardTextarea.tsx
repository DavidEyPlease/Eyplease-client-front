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
                    "w-full px-4 py-3 text-base text-eyp-ink bg-white border-2 rounded-2xl transition-colors outline-none resize-none",
                    "placeholder:text-eyp-gray-mid",
                    error
                        ? "border-red-400 focus:border-red-500"
                        : "border-eyp-gray-warm focus:border-eyp-violet hover:border-eyp-violet/40",
                    className
                )}
            />
            <div className="flex items-center justify-between gap-2 mt-1">
                {error ? <ErrorText error={error} /> : <span />}
                {maxLength && (
                    <span className="text-xs text-eyp-gray-mid">
                        {currentLength ?? 0}/{maxLength}
                    </span>
                )}
            </div>
        </div>
    )
})

WizardTextarea.displayName = "WizardTextarea"

export default WizardTextarea
