import { Skeleton } from "@/components/ui/skeleton"

/** Misma silueta que la tarjeta del plan, para que nada salte cuando llega. */
const StepPlanRecommendationSkeleton = () => {
    return (
        <div className="su-plan relative overflow-hidden rounded-[22px] p-5 opacity-80 sm:p-6">
            <div className="relative">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <Skeleton className="mb-2 h-3 w-24" />
                        <Skeleton className="h-7 w-40" />
                    </div>
                    <Skeleton className="h-6 w-28 rounded-full" />
                </div>

                <div className="mt-4 flex items-baseline gap-1.5">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-4 w-20" />
                </div>

                <ul className="mt-5 flex flex-col gap-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                            <Skeleton className="mt-px size-5 shrink-0 rounded-full" />
                            <Skeleton className="h-4 max-w-[85%] flex-1" />
                        </li>
                    ))}
                </ul>

                <div className="su-soft mt-5 flex items-center gap-3 rounded-2xl p-3">
                    <Skeleton className="size-10 shrink-0 rounded-xl" />
                    <div className="flex flex-1 flex-col gap-1.5">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-52" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default StepPlanRecommendationSkeleton
