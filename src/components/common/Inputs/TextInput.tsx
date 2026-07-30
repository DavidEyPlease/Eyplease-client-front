import { Input } from "@/components/ui/input"
import { TextInputProps } from "./types"
import ErrorText from "./ErrorText"
import { IconEye } from "@/components/Svg/IconEye"
import { useState, forwardRef } from "react"
import { IconEyeSlash } from "@/components/Svg/IconEyeSlash"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
    type = 'text',
    label,
    register,
    error,
    startContent,
    placeholder,
    labelClassName,
    className,
    ...props
}, ref) => {
    const [tooglePassword, setTooglePassword] = useState(false)

    return (
        <div>
            {label && <Label className={cn("mb-2 block text-left text-[12.5px] font-bold", labelClassName)}>{label}</Label>}
            <div className="relative">
                {startContent && (
                    <div className="pointer-events-none absolute top-0 left-0 flex h-full items-center pl-3.5 text-muted-foreground [&_svg]:size-4">
                        {startContent}
                    </div>
                )}
                <Input
                    ref={ref}
                    type={type === 'password' && tooglePassword ? 'text' : type}
                    aria-invalid={error ? "true" : "false"}
                    placeholder={placeholder}
                    // El icono inicial ocupa el flanco izquierdo: el texto arranca después
                    className={cn(startContent && 'pl-10', className)}
                    {...register}
                    {...props}
                />
                {type === 'password' &&
                    <Button
                        variant="ghost"
                        className="absolute top-1/2 right-1.5 -translate-y-1/2 text-primary hover:bg-transparent"
                        size='icon-sm'
                        type="button"
                        aria-label={tooglePassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                        onClick={() => setTooglePassword(!tooglePassword)}
                    >
                        {tooglePassword ? <IconEyeSlash /> : <IconEye />}
                    </Button>
                }
            </div>
            {error && <ErrorText error={error} />}
        </div>
    )
})

export default TextInput
