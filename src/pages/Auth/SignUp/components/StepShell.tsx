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
        <div className={cn("flex flex-col gap-5", className)}>
            <div className="text-center">
                {eyebrow && (
                    <p className="mb-2 text-xs font-semibold tracking-wider uppercase text-eyp-cyan">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl text-eyp-ink font-display">
                    {title}
                </h2>
                {description && (
                    <p className="mt-3 text-sm sm:text-base text-eyp-gray-text">
                        {description}
                    </p>
                )}
            </div>
            <div className="mt-2">{children}</div>
        </div>
    )
}

export default StepShell
