import { CheckIcon, CopyIcon, HeartHandshakeIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { API_ROUTES } from '@/constants/api'
import useAuth from '@/hooks/useAuth'
import useFetchQuery from '@/hooks/useFetchQuery'
import { PermissionKeys } from '@/interfaces/permissions'
import { cn } from '@/lib/utils'

type ReferralStatus = 'registered' | 'joined' | 'paid' | 'rewarded'

interface MyReferrals {
    code: string
    link: string
    /** El plan que se gana; null = ya tiene el más alto (su premio se lo decimos nosotros) */
    next_plan: string | null
    referrals: Array<{ name: string | null, status: ReferralStatus, reward_until: string | null }>
}

const STATUS: Record<ReferralStatus, { label: string, tone: string }> = {
    registered: { label: 'Anotada', tone: 'bg-muted text-muted-foreground' },
    joined: { label: 'Ya entró · falta su primer pago', tone: 'bg-amber-500/12 text-amber-700 dark:text-amber-300' },
    paid: { label: 'Ya pagó · tu premio va en camino', tone: 'bg-primary/10 text-primary' },
    rewarded: { label: 'Premio ganado', tone: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300' },
}

/** «20 de noviembre» */
const longDate = (ymd: string) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', timeZone: 'UTC' })
    .format(new Date(`${ymd}T12:00:00Z`))

/** «Plan Ejecutivo» → «Ejecutivo» */
const shortPlan = (name: string) => name.replace(/^Plan\s+/i, '')

/**
 * «Invite a una Directora», en su ficha de pagos: su liga para recomendar, qué se gana y cómo van sus recomendaciones.
 * El premio es un mes del plan siguiente pagando lo mismo, en cuanto la recomendada paga su primer mes. Sólo cuenta
 * quien entra con su liga (o si nos avisa antes de que entre): por eso la liga va aquí, a la mano.
 */
const ReferralCard = ({ className }: { className?: string }) => {
    const { hasAccess } = useAuth()
    const isDirector = hasAccess(PermissionKeys.POSTS_UNITY)
    const [copied, setCopied] = useState(false)

    const { response } = useFetchQuery<MyReferrals>(API_ROUTES.REFERRALS.MINE, {
        customQueryKey: ['referrals', 'mine'],
        staleTime: 300_000,
        enabled: isDirector,
    })
    const mine = response?.data

    if (!isDirector || !mine?.link) return null

    const next = mine.next_plan ? shortPlan(mine.next_plan) : null
    const message = `Hola, te recomiendo Eyplease+: me deja listos los reconocimientos de mi unidad, las publicaciones y el boletín del mes. Entra con mi liga: ${mine.link}`

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(mine.link)
            setCopied(true)
            toast.success('Liga copiada')
            setTimeout(() => setCopied(false), 2400)
        } catch {
            toast.error(`No se pudo copiar sola: ${mine.link}`)
        }
    }

    return (
        <section className={cn('overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[.07] via-transparent to-[#2CD4D9]/[.08] p-4 sm:p-5', className)}>
            <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <HeartHandshakeIcon className="size-5" />
                </span>
                <div className="min-w-0">
                    <b className="block text-[15px] font-extrabold tracking-tight">
                        {next ? <>Recomienda a una Directora y gana un mes del {next}</> : <>Recomienda a una Directora</>}
                    </b>
                    <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                        Comparte tu liga. Cuando la Directora que recomiendes entre por ella y pague su primer mes,
                        {next
                            ? <> tienes un mes del <b className="font-semibold text-foreground">{next}</b> pagando lo mismo que hoy. Luego regresas a tu plan, o te quedas si te gusta.</>
                            : <> te avisamos de tu premio.</>}
                    </p>
                </div>
            </div>

            <div className="mt-3.5 flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card/70 py-1.5 pr-1.5 pl-3">
                {/* `w-0`: sin esto la liga entera cuenta como ancho mínimo y empuja la página en teléfono */}
                <span className="w-0 min-w-0 flex-1 truncate text-[13px] font-semibold">{mine.link}</span>
                <button
                    type="button"
                    onClick={copy}
                    className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-lg px-3 text-[12.5px] font-bold text-primary transition-colors hover:bg-primary/10"
                >
                    {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
                    {copied ? 'Copiada' : 'Copiar'}
                </button>
            </div>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <a
                    href={`https://wa.me/?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-br from-[#12A150] to-[#25D366] px-4 text-[13px] font-bold text-white shadow-[0_10px_20px_-12px_rgba(18,161,80,.9)]"
                >
                    Compartir por WhatsApp
                </a>
            </div>

            {mine.referrals.length > 0 && (
                <ul className="mt-4 grid gap-1.5 border-t border-border pt-3">
                    {mine.referrals.map((item, index) => (
                        <li key={`${item.name}-${index}`} className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <span className="min-w-0 max-w-full truncate text-[13px] font-semibold">{item.name ?? 'Directora recomendada'}</span>
                            <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', STATUS[item.status].tone)}>
                                {item.status === 'rewarded' && item.reward_until ? `Premio hasta el ${longDate(item.reward_until)}` : STATUS[item.status].label}
                            </span>
                        </li>
                    ))}
                </ul>
            )}

            <p className="mt-3 text-[11.5px] leading-snug text-muted-foreground">
                Cuenta cuando entra con tu liga, o si nos avisas por WhatsApp antes de que se registre.
            </p>
        </section>
    )
}

export default ReferralCard
