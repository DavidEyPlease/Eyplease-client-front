import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"

import { cn } from "@/lib/utils"
import ErrorText from "./ErrorText"

interface Props {
    type?: "text" | "email" | "password" | "tel"
    placeholder?: string
    inputMode?: "text" | "email" | "tel" | "numeric"
    autoComplete?: string
    autoFocus?: boolean
    register?: UseFormRegisterReturn<string>
    error?: string
    icon?: React.ReactNode
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
    className?: string
}

const WizardInput = forwardRef<HTMLInputElement, Props>(({
    type = "text",
    placeholder,
    inputMode,
    autoComplete,
    autoFocus,
    register,
    error,
    icon,
    onKeyDown,
    className,
}, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    return (
        <div>
            <div className="relative">
                {icon && (
                    <div className="absolute -translate-y-1/2 pointer-events-none left-4 top-1/2 text-eyp-gray-mid">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={inputType}
                    placeholder={placeholder}
                    inputMode={inputMode}
                    autoComplete={autoComplete}
                    autoFocus={autoFocus}
                    aria-invalid={error ? "true" : "false"}
                    onKeyDown={onKeyDown}
                    {...register}
                    className={cn(
                        "w-full h-14 text-base text-eyp-ink bg-white border-2 rounded-2xl transition-colors outline-none",
                        "placeholder:text-eyp-gray-mid",
                        icon ? "pl-12 pr-4" : "px-4",
                        isPassword && "pr-12",
                        error
                            ? "border-red-400 focus:border-red-500"
                            : "border-eyp-gray-warm focus:border-eyp-violet hover:border-eyp-violet/40",
                        className
                    )}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="absolute transition-colors -translate-y-1/2 right-4 top-1/2 text-eyp-gray-mid hover:text-eyp-violet"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && <ErrorText error={error} />}
        </div>
    )
})

WizardInput.displayName = "WizardInput"

export default WizardInput
