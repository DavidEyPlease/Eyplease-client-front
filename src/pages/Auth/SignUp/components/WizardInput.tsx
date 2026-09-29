import { forwardRef, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import type { UseFormRegisterReturn } from "react-hook-form"

import { Input } from "@/components/ui/input"
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

/** El mismo campo que el acceso (`ui/input`), un poco más alto porque aquí va solo en su paso. */
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
                    <div className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground [&_svg]:size-[18px]">
                        {icon}
                    </div>
                )}
                <Input
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
                        "h-12 text-[15px] md:text-[15px]",
                        icon && "pl-11",
                        isPassword && "pr-12",
                        className
                    )}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(p => !p)}
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        className="su-accent absolute top-1/2 right-2.5 grid size-8 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-muted"
                    >
                        {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                    </button>
                )}
            </div>
            {error && <ErrorText error={error} />}
        </div>
    )
})

WizardInput.displayName = "WizardInput"

export default WizardInput
