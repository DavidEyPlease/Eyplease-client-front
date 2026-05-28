import { Check, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
    label: string
    description?: string
    selected: boolean
    onClick: () => void
    Icon?: LucideIcon
    layout?: 'row' | 'compact'
}

const OptionCard = ({ label, description, selected, onClick, Icon, layout = 'row' }: Props) => {
    const compact = layout === 'compact'
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onClick}
            className={cn(
                "group relative flex items-start gap-3 p-4 text-left transition-all rounded-2xl border-2 w-full",
                selected
                    ? "border-eyp-violet bg-eyp-violet-pale/60 shadow-md shadow-eyp-violet/10"
                    : "border-eyp-gray-warm bg-white hover:border-eyp-violet/40 hover:bg-eyp-violet-pale/30"
            )}
        >
            {Icon && (
                <span
                    className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-colors",
                        selected
                            ? "bg-eyp-gradient text-white"
                            : "bg-eyp-gray-warm text-eyp-violet group-hover:bg-eyp-violet-pale"
                    )}
                >
                    <Icon className="w-5 h-5" />
                </span>
            )}
            <span className="flex-1 min-w-0">
                <span className={cn("block font-semibold text-eyp-ink", compact ? "text-sm" : "")}>
                    {label}
                </span>
                {description && (
                    <span className={cn("block text-eyp-gray-text mt-0.5", compact ? "text-xs" : "text-sm")}>
                        {description}
                    </span>
                )}
            </span>
            <span
                className={cn(
                    "flex items-center justify-center w-5 h-5 rounded-full border-2 shrink-0 transition-all mt-0.5",
                    selected
                        ? "border-eyp-violet bg-eyp-violet text-white"
                        : "border-eyp-gray-mid bg-white"
                )}
            >
                {selected && <Check className="w-3 h-3" strokeWidth={3} />}
            </span>
        </button>
    )
}

export default OptionCard
