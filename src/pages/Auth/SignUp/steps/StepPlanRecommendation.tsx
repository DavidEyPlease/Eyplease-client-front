import { Check, Sparkles, Gift, BadgePercent } from "lucide-react"

import StepShell from "../components/StepShell"
import StepPlanRecommendationSkeleton from "./StepPlanRecommendationSkeleton"
import { PLANS_METADATA } from "@/constants/plans"
import { PlanKeys } from "@/interfaces/plans"
import useRecommendedPlan from "../hooks/useRecommendedPlan"

interface Props {
    planKey: PlanKeys
    firstName: string
}

const formatPrice = (n: number) => `$${n.toLocaleString('es-MX')}`

const StepPlanRecommendation = ({ planKey, firstName }: Props) => {
    const { plan, loading, deal } = useRecommendedPlan(planKey)

    const planMetadata = PLANS_METADATA[planKey]
    const planWithMetadata = plan ? { ...plan, ...planMetadata } : null

    const personalGreeting = firstName ? `${firstName}, este plan es para ti` : 'Este plan es para ti'

    return (
        <StepShell
            eyebrow="Tu plan recomendado"
            title={personalGreeting}
            description={planWithMetadata?.headline}
        >
            {loading || !planWithMetadata ? (
                <StepPlanRecommendationSkeleton />
            ) : (
                <div className="su-plan relative overflow-hidden rounded-[22px] p-5 sm:p-6">
                    <div
                        className="pointer-events-none absolute -top-14 -right-14 size-40 rounded-full opacity-40 blur-2xl"
                        style={{ background: 'radial-gradient(circle, #2CD4D9 0%, transparent 70%)' }}
                        aria-hidden="true"
                    />

                    <div className="relative">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="su-accent text-[11px] font-bold tracking-[.12em] uppercase">
                                    Plan {planWithMetadata.audience}
                                </p>
                                <h3 className="mt-1 text-[26px] leading-none font-extrabold tracking-tight">
                                    {planWithMetadata.name}
                                </h3>
                            </div>
                            {planWithMetadata.recommendedTagline && (
                                <span className="shell-grad inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white uppercase">
                                    <Sparkles className="size-3" />
                                    Recomendado
                                </span>
                            )}
                        </div>

                        <div className="mt-4 flex items-baseline gap-1.5">
                            <span className="text-[40px] leading-none font-extrabold tracking-[-.04em]">
                                {formatPrice(planWithMetadata.price ?? 0)}
                            </span>
                            <span className="text-sm font-semibold text-muted-foreground">
                                MXN / mes
                            </span>
                        </div>

                        <ul className="mt-5 flex flex-col gap-2.5">
                            {planWithMetadata.features.map((h, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-[14px] leading-snug">
                                    <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-[#6C47FF]/12 dark:bg-white/10">
                                        <Check className="su-accent size-3" strokeWidth={3.5} />
                                    </span>
                                    {h}
                                </li>
                            ))}
                        </ul>

                        {/* La oferta de entrada o la prueba gratis, según el plan (sin ninguna de las dos, nada) */}
                        {deal.kind !== 'none' && (
                            <div className="su-soft mt-5 flex items-center gap-3 rounded-2xl p-3">
                                <span className="su-accent grid size-10 shrink-0 place-items-center rounded-xl bg-card shadow-sm">
                                    {deal.kind === 'offer' ? <BadgePercent className="size-5" /> : <Gift className="size-5" />}
                                </span>
                                <div className="flex-1 text-left">
                                    <p className="text-[14px] font-bold">{deal.title}</p>
                                    <p className="text-[12.5px] text-muted-foreground">{deal.detail}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <p className="mt-3.5 text-center text-[12.5px] text-muted-foreground">
                Puedes cambiar de plan más tarde desde tu cuenta.
            </p>
        </StepShell>
    )
}

export default StepPlanRecommendation
