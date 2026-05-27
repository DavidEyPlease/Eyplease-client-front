import { cn } from "@/lib/utils"

interface Props {
    current: number
    total: number
}

const WizardProgress = ({ current, total }: Props) => {
    return (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
                {Array.from({ length: total }).map((_, i) => {
                    const done = i < current
                    const active = i === current
                    return (
                        <span
                            key={i}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                done && "w-2 bg-eyp-violet",
                                active && "w-8 bg-eyp-violet",
                                !done && !active && "w-2 bg-eyp-violet-pale"
                            )}
                            aria-hidden="true"
                        />
                    )
                })}
            </div>
            <p className="text-xs font-medium tracking-wide uppercase text-eyp-gray-text">
                Paso {current + 1} de {total}
            </p>
        </div>
    )
}

export default WizardProgress
