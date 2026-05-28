import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const StepPlanRecommendationSkeleton = () => {
    return (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6 bg-white",
            "border-eyp-violet/40 shadow-xl shadow-eyp-violet/10"
        )}>
            <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-40 blur-2xl"
                style={{ background: 'radial-gradient(circle, #5DD9D2 0%, transparent 70%)' }}
                aria-hidden="true"
            />

            <div className="relative">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex-1">
                        <Skeleton className="h-3 w-24 mb-2" />
                        <Skeleton className="h-7 w-40" />
                    </div>
                    <Skeleton className="h-6 w-28 rounded-full" />
                </div>

                <div className="flex items-baseline gap-1.5 mb-5">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>

                <ul className="flex flex-col gap-2 mb-5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
                            <Skeleton className="h-4 flex-1 max-w-[85%]" />
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-eyp-gradient-soft border border-eyp-cyan/30">
                    <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
                    <div className="flex-1 flex flex-col gap-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-52" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StepPlanRecommendationSkeleton
