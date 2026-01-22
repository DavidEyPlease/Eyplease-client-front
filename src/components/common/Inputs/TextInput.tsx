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
    ...props
}, ref) => {
    const [tooglePassword, setTooglePassword] = useState(false)

    return (
        <div>
            {label && <Label className={cn("mb-2", labelClassName)}>{label}</Label>}
            <div className="relative">
                {startContent && <div className="absolute top-0 left-0 flex items-center h-full pl-2 text-gray-400">{startContent}</div>}
                <Input
                    ref={ref}
                    type={type === 'password' && tooglePassword ? 'text' : type}
                    aria-invalid={error ? "true" : "false"}
                    placeholder={placeholder}
                    {...register}
                    {...props}
                />
                {type === 'password' &&
                    <Button
                        variant="ghost"
                        className="absolute top-0 right-0 text-primary"
                        size='icon'
                        type="button"
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