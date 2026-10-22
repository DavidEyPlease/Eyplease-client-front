import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'
import { ArrowRightIcon, CheckIcon, CreditCardIcon, LoaderCircleIcon, LockIcon, MessageCircleIcon, PartyPopperIcon } from 'lucide-react'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useAuth from '@/hooks/useAuth'
import { ApiResponse } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import LOGO_CLARO from '@/assets/images/eyplease-logo-color.png'
import LOGO_OSCURO from '@/assets/images/eyplease-logo-fondo-oscuro.png'
import { puedeVerBoletinDinamico } from '@/pages/NewsletterInteractive/acceso'

/** Lo que manda `GET billing/plan-upgrade` (PlanUpgradeService::quote). */
interface Cotizacion {
    available: boolean
    reason: string | null
    message: string | null
    period_label: string
    whatsapp: string | null
    currency?: string
    current: { key: string, name: string } | null
    plan: { id: string, key: string, name: string, color: string | null, price?: number, features: string[] } | null
    due_now?: number
    monthly?: number
    paid_this_month?: number
}

const PLANES = ['elite', 'national']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const pesos = (valor = 0, moneda = 'MXN') => `${valor.toLocaleString('es-MX', { style: 'currency', currency: moneda, maximumFractionDigits: 2 })} ${moneda}`
const mesSiguiente = () => MESES[(new Date().getMonth() + 1) % 12]
const dormir = (ms: number) => new Promise(listo => setTimeout(listo, ms))

/**
 * Subir de plan ella sola, rápido (David, 22-oct-2026: «pagar, subir, utilizar»): ve cuánto le cuesta HOY (lo que le
 * falta del mes para el plan nuevo), paga con tarjeta en Stripe y al volver se confirma aquí mismo y se le abre lo
 * nuevo. Lo que no se puede resolver solo (tarjeta domiciliada, precio especial, atrasos…) la manda con el equipo.
 * Es de la web: en la app de las tiendas no se puede decir cómo pagar.
 */
const PlanUpgradePage = () => {
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const { getMe } = useAuth()
    const navigate = useNavigate()
    const [params] = useSearchParams()
    const pedido = params.get('plan') ?? 'elite'
    const planKey = PLANES.includes(pedido) ? pedido : 'elite'
    const sesion = params.get('sesion')
    const cancelado = params.get('cancelado') === '1'

    const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [pagando, setPagando] = useState(false)
    // al volver de Stripe: confirmando → listo | pendiente
    const [vuelta, setVuelta] = useState<'confirmando' | 'listo' | 'pendiente' | null>(sesion ? 'confirmando' : null)
    const confirmado = useRef(false)

    useEffect(() => {
        if (!user || sesion) return
        HttpService.get<ApiResponse<Cotizacion>>(`${API_ROUTES.BILLING.PLAN_UPGRADE}?plan=${planKey}`)
            .then(res => setCotizacion(res.data ?? null))
            .catch(err => setError(err?.message || 'No pudimos cargar tu plan. Inténtalo otra vez.'))
    }, [user, sesion, planKey])

    /* Al volver de pagar: se confirma con Stripe sin esperar al aviso del banco; unos intentos por si tarda */
    const confirmar = async (id: string) => {
        setVuelta('confirmando')
        for (let intento = 0; intento < 8; intento++) {
            try {
                const res = await HttpService.post<ApiResponse<{ status: string, plan: string | null }>>(API_ROUTES.BILLING.PLAN_UPGRADE_CONFIRM, { session_id: id })
                if (res.data?.status === 'paid') {
                    await getMe()
                    setVuelta('listo')
                    return
                }
            } catch {
                /* sigue intentando: la liga pudo no estar todavía */
            }
            await dormir(2500)
        }
        setVuelta('pendiente')
    }
    useEffect(() => {
        if (!user || !sesion || confirmado.current) return
        confirmado.current = true
        confirmar(sesion)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, sesion])

    const pagar = async () => {
        setPagando(true)
        setError(null)
        try {
            const res = await HttpService.post<ApiResponse<{ checkout_url: string }>>(API_ROUTES.BILLING.PLAN_UPGRADE, { plan: planKey })
            const url = res.data?.checkout_url
            if (!url) throw new Error('Sin liga de pago')
            // a Stripe en la misma pestaña: al pagar regresa aquí y se confirma
            if (url.startsWith('/')) navigate(url)
            else window.location.href = url
        } catch (err) {
            setError((err as { message?: string })?.message || 'No pudimos abrir el pago. Inténtalo otra vez.')
            setPagando(false)
        }
    }

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    const nombrePlan = cotizacion?.plan?.name ?? (planKey === 'national' ? 'Plan Nacional' : 'Plan Elite')
    const whatsapp = cotizacion?.whatsapp
        ? `https://wa.me/${cotizacion.whatsapp}?text=${encodeURIComponent(`Hola, soy ${user?.name ?? ''} (cuenta ${user?.account ?? ''}). Quiero subir al ${nombrePlan}.`)}`
        : null
    const conBoletin = puedeVerBoletinDinamico(user)

    return (
        <div className="grid min-h-dvh place-items-center bg-background px-4 py-10 text-foreground">
            <main className="w-full max-w-[520px]">
                <img src={LOGO_CLARO} alt="Eyplease+" className="mx-auto mb-6 w-20 dark:hidden" />
                <img src={LOGO_OSCURO} alt="Eyplease+" className="mx-auto mb-6 hidden w-20 dark:block" />

                <section className="rounded-[26px] border bg-card p-6 shadow-[0_30px_70px_-40px_rgba(78,49,192,.55)] md:p-8">
                    {vuelta === 'confirmando' && (
                        <div className="grid justify-items-center gap-3 py-8 text-center" role="status">
                            <LoaderCircleIcon className="size-9 animate-spin text-primary" />
                            <p className="text-lg font-bold">Confirmando tu pago…</p>
                            <p className="text-sm text-muted-foreground">Unos segundos y te abrimos tu plan nuevo.</p>
                        </div>
                    )}

                    {vuelta === 'listo' && (
                        <div className="grid justify-items-center gap-3 py-4 text-center">
                            <span className="grid size-14 place-items-center rounded-full bg-primary-gradient text-white shadow-primary-glow"><PartyPopperIcon className="size-7" /></span>
                            <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">¡Listo! Ya tienes el {user?.plan?.name ?? nombrePlan}</h1>
                            <p className="max-w-[40ch] text-sm text-muted-foreground">Tu pago quedó registrado y todo lo de tu plan nuevo ya está abierto.</p>
                            <div className="mt-3 grid w-full gap-2.5">
                                {conBoletin && (
                                    <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE)} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                                        Abrir mi boletín interactivo <ArrowRightIcon className="size-4" />
                                    </button>
                                )}
                                <button type="button" onClick={() => navigate(APP_ROUTES.HOME.INITIAL)} className="inline-flex h-11 items-center justify-center rounded-[14px] border px-5 text-sm font-bold">Ir a Eyplease+</button>
                            </div>
                        </div>
                    )}

                    {vuelta === 'pendiente' && (
                        <div className="grid justify-items-center gap-3 py-4 text-center">
                            <p className="text-lg font-bold">Tu pago se está confirmando</p>
                            <p className="max-w-[42ch] text-sm text-muted-foreground">El banco está tardando un poco. En cuanto quede, tu plan cambia solo; no tienes que volver a pagar.</p>
                            <button type="button" onClick={() => sesion && confirmar(sesion)} className="mt-2 inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-gradient px-5 text-sm font-extrabold text-white">Revisar otra vez</button>
                        </div>
                    )}

                    {!vuelta && (
                        <>
                            {cancelado && <p className="mb-4 rounded-xl bg-muted px-4 py-2.5 text-center text-sm font-semibold">No se hizo ningún cargo. Cuando quieras, aquí sigue.</p>}
                            <p className="text-[11px] font-extrabold tracking-[.16em] text-primary uppercase">Sube de plan</p>
                            <h1 className="mt-1 text-[28px] leading-tight font-extrabold tracking-tight">{nombrePlan}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Con tu boletín interactivo para presentar tu cierre en la junta, y todo lo del plan.</p>

                            {!cotizacion && !error && <div className="grid place-items-center py-10"><LoaderCircleIcon className="size-7 animate-spin text-primary" /></div>}

                            {cotizacion?.available && (
                                <>
                                    <div className="mt-6 rounded-2xl bg-muted/60 p-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Hoy pagas</p>
                                        <p className="text-[34px] leading-tight font-extrabold tabular-nums">{pesos(cotizacion.due_now, cotizacion.currency)}</p>
                                        <p className="mt-1 text-[13px] text-muted-foreground">
                                            Es lo que te falta de {cotizacion.period_label.split(' ')[0]} para el {nombrePlan}
                                            {cotizacion.paid_this_month ? ` (ya pagaste ${pesos(cotizacion.paid_this_month, cotizacion.currency)})` : ''}.
                                            {' '}Desde {mesSiguiente()}, {pesos(cotizacion.monthly, cotizacion.currency)} al mes.
                                        </p>
                                    </div>
                                    <button type="button" onClick={pagar} disabled={pagando} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow disabled:opacity-70">
                                        {pagando ? <LoaderCircleIcon className="size-5 animate-spin" /> : <CreditCardIcon className="size-5" />}
                                        {pagando ? 'Abriendo el pago…' : 'Pagar con tarjeta y activar'}
                                    </button>
                                    <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><LockIcon className="size-3" /> Pago seguro con Stripe. Tu plan se activa en cuanto se confirma.</p>
                                </>
                            )}

                            {cotizacion && !cotizacion.available && (
                                <div className="mt-6 grid gap-3">
                                    <p className="rounded-2xl bg-muted/60 p-4 text-sm font-semibold">{cotizacion.message}</p>
                                    {whatsapp && cotizacion.reason !== 'ya_lo_tiene' && (
                                        <a href={whatsapp} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                                            Escribir por WhatsApp <MessageCircleIcon className="size-4" />
                                        </a>
                                    )}
                                </div>
                            )}

                            {/* lo que trae el plan va al final: primero cuánto y el botón, para que sea rápido */}
                            {!!cotizacion?.plan?.features?.length && (
                                <details className="group mt-6 border-t pt-4">
                                    <summary className="cursor-pointer list-none text-sm font-bold text-muted-foreground group-open:text-foreground">Qué incluye el {nombrePlan}</summary>
                                    <ul className="mt-3 grid gap-2">
                                        {cotizacion.plan.features.map(feature => (
                                            <li key={feature} className="flex items-start gap-2.5 text-[13.5px]">
                                                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/12 text-primary"><CheckIcon className="size-3.5" /></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </details>
                            )}

                            {error && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-sm font-semibold text-destructive">{error}</p>}

                            <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER)} className="mt-4 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground">Ahora no</button>
                        </>
                    )}
                </section>
            </main>
        </div>
    )
}

export default PlanUpgradePage
