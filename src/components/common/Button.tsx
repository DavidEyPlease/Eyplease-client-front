import { Button as UIButton } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
    text?: React.ReactNode
    type?: "button" | "submit" | "reset"
    loading?: boolean
    color?: 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'default'
    rounded?: boolean
    size?: 'sm' | 'lg' | 'icon'
    block?: boolean
    disabled?: boolean
    variant?: 'link' | 'outline' | 'ghost'
    className?: string
    onClick?: () => void
}

const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    lg: 'px-6 py-2.5',
}

const Button = ({ text, type = 'button', loading, variant, size, disabled, rounded, className, block, color = 'primary', ...props }: Props) => {
    return (
        <UIButton
            type={type}
            variant={variant}
            disabled={loading || disabled}
            size={size}
            data-color={color}
            className={cn(
                // Botón primario del rediseño: gradiente/sombra/radio tokenizados en @theme (index.css).
                'flex h-auto w-max cursor-pointer items-center gap-2.5 rounded-brand bg-primary-gradient text-[15px] font-bold text-white shadow-primary-glow transition-[transform,box-shadow,filter] duration-150 hover:-translate-y-px hover:text-white hover:brightness-[1.03] hover:shadow-primary-glow-lg active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:shadow-none disabled:grayscale-[0.2]',
                rounded && 'rounded-full',
                block && 'w-full',
                className,
                size && sizeClasses[size],
            )}
            {...props}
        >
            {loading && (
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="animate-spin h-5 w-5 mr-3 text-white"
                >
                    <circle
                        strokeWidth="4"
                        stroke="currentColor"
                        r="10"
                        cy="12"
                        cx="12"
                        className="opacity-25"
                    ></circle>
                    <path
                        d="M4 12a8 8 0 018-8v8H4z"
                        fill="currentColor"
                        className="opacity-75"
                    ></path>
                </svg>
            )}
            {text}
        </UIButton>
    )
}

export default Button