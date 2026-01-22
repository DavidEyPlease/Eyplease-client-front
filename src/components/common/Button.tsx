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

const Button = ({ text, type = 'button', loading, variant, size, disabled, rounded, className, block, color = 'primary', ...props }: Props) => {
    return (
        <UIButton
            type={type}
            variant={variant}
            disabled={loading || disabled}
            size={size}
            className={cn(
                // variant && !['outline', 'ghost'].includes(variant) && `bg-${color}`,
                // variant === 'outline' && `border border-primary`,
                'bg-gradient-to-r w-max cursor-pointer from-blue-600 to-purple-600 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center transition duration-300 transform hover:scale-105 hover:text-white active:scale-95',
                rounded && 'rounded-full',
                block && 'w-full',
                className
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