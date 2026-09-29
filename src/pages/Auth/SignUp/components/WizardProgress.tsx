import { cn } from "@/lib/utils"

interface Props {
    current: number
    total: number
}

/** Un segmento por paso; se llenan con el degradado de la marca (`.su-steps` en signup.css). */
const WizardProgress = ({ current, total }: Props) => {
    return (
        <div className="flex items-center gap-3">
            <div className="su-steps flex flex-1 items-center gap-1.5" aria-hidden="true">
                {Array.from({ length: total }).map((_, i) => (
                    <i key={i} className={cn(i < current && "done", i === current && "on")} />
                ))}
            </div>
            <p className="shrink-0 text-[12px] font-bold tabular-nums text-muted-foreground">
                Paso {current + 1} de {total}
            </p>
        </div>
    )
}

export default WizardProgress
