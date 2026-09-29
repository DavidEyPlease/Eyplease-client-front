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

/** Opción elegible (perfil, tamaño de unidad, años): vidrio suave; la elegida se enmarca en violeta. */
const OptionCard = ({ label, description, selected, onClick, Icon, layout = 'row' }: Props) => {
    const compact = layout === 'compact'
    return (
        <button
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={onClick}
            className={cn(
                "group relative flex w-full items-center border text-left transition-all duration-200",
                compact ? "gap-3 rounded-[14px] px-3.5 py-3" : "gap-3.5 rounded-[18px] p-3.5 sm:p-4",
                selected
                    ? "border-transparent bg-card shadow-[0_14px_30px_-16px_rgba(108,71,255,.75)] ring-2 ring-[#6C47FF] dark:bg-white/[.07] dark:ring-[#8C78FF]"
                    : "border-border bg-surface-soft hover:-translate-y-px hover:border-[#6C47FF]/40 hover:bg-card dark:border-white/10 dark:bg-white/[.04] dark:hover:bg-white/[.07]"
            )}
        >
            {Icon && (
                <span
                    className={cn(
                        "grid shrink-0 place-items-center rounded-[14px] transition-all duration-200",
                        compact ? "size-9" : "size-11",
                        selected
                            ? "shell-grad text-white shadow-[0_8px_18px_-8px_rgba(108,71,255,.8)]"
                            : "su-accent bg-[#6C47FF]/10 dark:bg-white/10"
                    )}
                >
                    <Icon className="size-5" />
                </span>
            )}
            <span className="min-w-0 flex-1">
                <span className={cn("block font-bold", compact ? "text-[14px]" : "text-[15.5px]")}>
                    {label}
                </span>
                {description && (
                    <span className={cn("mt-0.5 block leading-snug text-muted-foreground", compact ? "text-[12.5px]" : "text-[13.5px]")}>
                        {description}
                    </span>
                )}
            </span>
            <span
                className={cn(
                    "grid size-[22px] shrink-0 place-items-center rounded-full border-2 transition-all duration-200",
                    selected
                        ? "shell-grad border-transparent text-white"
                        : "border-border bg-card dark:border-white/20 dark:bg-transparent"
                )}
            >
                {selected && <Check className="size-3" strokeWidth={3.5} />}
            </span>
        </button>
    )
}

export default OptionCard
