import { Check, Sparkles, Gift } from "lucide-react"

import StepShell from "../components/StepShell"
import { PLANS, type PlanId, TRIAL_DAYS } from "@/constants/plans"
import { cn } from "@/lib/utils"

interface Props {
    planId: PlanId
    firstName: string
}

const formatPrice = (n: number) => `$${n.toLocaleString('es-MX')}`

const StepPlanRecommendation = ({ planId, firstName }: Props) => {
    const plan = PLANS[planId]
    const personalGreeting = firstName ? `${firstName}, este plan es para ti` : 'Este plan es para ti'

    return (
        <StepShell
            eyebrow="Tu plan recomendado"
            title={personalGreeting}
            description={plan.headline}
        >
            <div className={cn(
                "relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6 bg-white",
                "border-eyp-violet shadow-xl shadow-eyp-violet/15"
            )}>
                <div
                    className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-40 blur-2xl"
                    style={{ background: 'radial-gradient(circle, #5DD9D2 0%, transparent 70%)' }}
                    aria-hidden="true"
                />

                <div className="relative">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <p className="text-xs font-semibold tracking-wider uppercase text-eyp-cyan">
                                Plan {plan.audience}
                            </p>
                            <h3 className="text-2xl font-extrabold font-display text-eyp-ink mt-0.5">
                                {plan.name}
                            </h3>
                        </div>
                        {plan.recommendedTagline && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-eyp-violet-pale text-eyp-violet">
                                <Sparkles className="w-3 h-3" />
                                Recomendado
                            </span>
                        )}
                    </div>

                    <div className="flex items-baseline gap-1.5 mb-5">
                        <span className="text-4xl font-extrabold font-display text-eyp-ink">
                            {formatPrice(plan.monthlyPrice)}
                        </span>
                        <span className="text-sm font-medium text-eyp-gray-text">
                            {plan.currency} / mes
                        </span>
                    </div>

                    <ul className="flex flex-col gap-2 mb-5">
                        {plan.highlights.map((h, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-eyp-ink-soft">
                                <span className="flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-eyp-cyan-pale shrink-0">
                                    <Check className="w-3 h-3 text-eyp-violet" strokeWidth={3} />
                                </span>
                                {h}
                            </li>
                        ))}
                    </ul>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-eyp-gradient-soft border border-eyp-cyan/30">
                        <span className="flex items-center justify-center rounded-lg w-9 h-9 bg-white shadow-sm text-eyp-violet shrink-0">
                            <Gift className="w-5 h-5" />
                        </span>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-eyp-ink">
                                Pruébalo {TRIAL_DAYS} días gratis
                            </p>
                            <p className="text-xs text-eyp-gray-text">
                                Sin cobro automático. Cancela cuando quieras.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-3 text-xs text-center text-eyp-gray-text">
                Puedes cambiar de plan más tarde desde tu cuenta.
            </p>
        </StepShell>
    )
}

export default StepPlanRecommendation
