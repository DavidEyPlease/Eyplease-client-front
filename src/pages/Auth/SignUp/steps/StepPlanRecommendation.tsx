import type { ReactNode } from "react"
import { Check, Sparkles, Gift, BadgePercent } from "lucide-react"

import StepShell from "../components/StepShell"
import StepPlanRecommendationSkeleton from "./StepPlanRecommendationSkeleton"
import { PLANS_METADATA } from "@/constants/plans"
import { PlanKeys } from "@/interfaces/plans"
import useRecommendedPlan from "../hooks/useRecommendedPlan"

interface Props {
    planKey: PlanKeys
    firstName: string
    /** Escogió su mes gratis en lugar de la promoción con permanencia (Elite y Área en el Buen Fin) */
    preferTrial?: boolean
    onPreferTrial?: (value: boolean) => void
}

const formatPrice = (n: number) => `$${n.toLocaleString('es-MX')}`

/** Una de las dos formas de empezar (la promoción o el mes gratis), como opción de radio */
const DealOption = ({ selected, onSelect, icon, title, detail }: {
    selected: boolean
    onSelect: () => void
    icon: ReactNode
    title: string
    detail: string
}) => (
    <button
        type="button"
        role="radio"
        aria-checked={selected}
        onClick={onSelect}
        className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${selected ? 'su-soft ring-2 ring-[#6C47FF]/45 dark:ring-[#A894FF]/45' : 'border-border bg-card/60 opacity-80 hover:opacity-100'}`}
    >
        <span className="su-accent grid size-10 shrink-0 place-items-center rounded-xl bg-card shadow-sm">{icon}</span>
        <span className="flex-1">
            <span className="block text-[14px] font-bold">{title}</span>
            <span className="block text-[12.5px] text-muted-foreground">{detail}</span>
        </span>
        <span
            className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${selected ? 'border-[#6C47FF] dark:border-[#A894FF]' : 'border-muted-foreground/40'}`}
            aria-hidden="true"
        >
            {selected && <span className="size-2.5 rounded-full bg-[#6C47FF] dark:bg-[#A894FF]" />}
        </span>
    </button>
)

const StepPlanRecommendation = ({ planKey, firstName, preferTrial = false, onPreferTrial }: Props) => {
    // `promo`: la promoción con permanencia de este plan (Elite y Área en el Buen Fin), la haya dejado o no por su mes gratis
    const { plan, deal, promo } = useRecommendedPlan(planKey, true, preferTrial)

    const planMetadata = PLANS_METADATA[planKey]
    const planWithMetadata = plan ? { ...plan, ...planMetadata } : null
    const offer = plan?.offer ?? null

    const personalGreeting = firstName ? `${firstName}, este plan es para ti` : 'Este plan es para ti'

    return (
        <StepShell
            eyebrow="Tu plan recomendado"
            title={personalGreeting}
            description={planWithMetadata?.headline}
        >
            {!planWithMetadata ? (
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

                        {/* Con oferta (la del Standard o la del Buen Fin), el precio de la oferta y el normal tachado */}
                        <div className="mt-4 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                            <span className="text-[40px] leading-none font-extrabold tracking-[-.04em]">
                                {formatPrice(offer ? offer.amount : planWithMetadata.price ?? 0)}
                            </span>
                            <span className="text-sm font-semibold text-muted-foreground">
                                MXN / mes
                            </span>
                            {offer && (
                                <span className="ml-1 text-[15px] font-semibold text-muted-foreground line-through decoration-2">
                                    <span className="sr-only">Precio normal: </span>
                                    {formatPrice(planWithMetadata.price ?? 0)}
                                </span>
                            )}
                        </div>
                        {offer?.label && (
                            <p className="mt-2 inline-flex rounded-full bg-[#E5077D]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#C0066A] dark:text-[#FF7AC0]">
                                {offer.label}
                            </p>
                        )}

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

                        {/* Elite y Área en el Buen Fin: escoge entre la promoción y su mes gratis de siempre (David, 8-nov-2026) */}
                        {promo && onPreferTrial ? (
                            <div className="mt-5 flex flex-col gap-2.5" role="radiogroup" aria-label="Cómo quieres empezar">
                                <p className="text-[12.5px] font-bold text-muted-foreground">Escoge cómo quieres empezar</p>
                                <DealOption
                                    selected={!preferTrial}
                                    onSelect={() => onPreferTrial(false)}
                                    icon={<BadgePercent className="size-5" />}
                                    title={`${promo.label ? `${promo.label}: ` : ''}tus primeros ${promo.months} meses a ${formatPrice(promo.amount)}`}
                                    detail={`Sin mes gratis. Después, ${formatPrice(planWithMetadata.price ?? 0)} al mes.${promo.commitment ? ` Permanencia de ${promo.commitment.months} meses: si cancelas antes, pagas el descuento de los meses que usaste.` : ''}`}
                                />
                                <DealOption
                                    selected={preferTrial}
                                    onSelect={() => onPreferTrial(true)}
                                    icon={<Gift className="size-5" />}
                                    title="Pruébalo un mes gratis"
                                    detail={`Sin la promoción: después, ${formatPrice(planWithMetadata.price ?? 0)} al mes. Sin permanencia; cancela cuando quieras.`}
                                />
                                {promo.commitment && (
                                    <a
                                        href={promo.commitment.terms_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="su-accent self-start text-[12.5px] font-bold underline underline-offset-2"
                                    >
                                        Ver términos de la promoción
                                    </a>
                                )}
                            </div>
                        ) : deal.kind !== 'none' && (
                            <div className="su-soft mt-5 flex items-center gap-3 rounded-2xl p-3">
                                <span className="su-accent grid size-10 shrink-0 place-items-center rounded-xl bg-card shadow-sm">
                                    {deal.kind === 'offer' ? <BadgePercent className="size-5" /> : <Gift className="size-5" />}
                                </span>
                                <div className="flex-1 text-left">
                                    <p className="text-[14px] font-bold">{deal.title}</p>
                                    <p className="text-[12.5px] text-muted-foreground">{deal.detail}</p>
                                    {/* Con permanencia (Elite y Área en el Buen Fin): sus términos, en la web pública */}
                                    {deal.commitment && (
                                        <a
                                            href={deal.commitment.terms_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="su-accent mt-1 inline-block text-[12.5px] font-bold underline underline-offset-2"
                                        >
                                            Ver términos
                                        </a>
                                    )}
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
