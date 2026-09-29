import { cn } from "@/lib/utils"

interface Props {
    eyebrow?: string
    title: string
    description?: React.ReactNode
    children: React.ReactNode
    className?: string
}

const StepShell = ({ eyebrow, title, description, children, className }: Props) => {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <div className="text-center">
                {eyebrow && (
                    <p className="su-accent mb-2.5 text-[11.5px] font-bold tracking-[.14em] uppercase">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-[26px] leading-[1.1] font-extrabold tracking-tight text-balance sm:text-[28px]">
                    {title}
                </h2>
                {description && (
                    <p className="mx-auto mt-2.5 max-w-[400px] text-[14.5px] leading-relaxed font-medium text-pretty text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            <div>{children}</div>
        </div>
    )
}

export default StepShell
