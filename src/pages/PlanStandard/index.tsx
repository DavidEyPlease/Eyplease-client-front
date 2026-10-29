import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { ArrowRightIcon, CheckIcon, CreditCardIcon, LandmarkIcon, LoaderCircleIcon, LockIcon, MessageCircleIcon, PartyPopperIcon, StoreIcon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import { BILLING_PATH } from '@/components/billing/SubscriptionCard'
import CashPaymentCard from '@/components/billing/CashPaymentCard'
import { ICashPayment } from '@/interfaces/billing'
import { cn } from '@/lib/utils'
import useAuth from '@/hooks/useAuth'
import useStandardQuote, { STANDARD_QUOTE_KEY } from '@/hooks/useStandardQuote'
import { STRATEGY_KEY } from '@/hooks/useInventory'
import { ApiResponse } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import LOGO_CLARO from '@/assets/images/eyplease-logo-color.png'
import LOGO_OSCURO from '@/assets/images/eyplease-logo-fondo-oscuro.png'

const pesos = (valor = 0, moneda = 'MXN') => `${valor.toLocaleString('es-MX', { style: 'currency', currency: moneda, maximumFractionDigits: 2 })} ${moneda}`
const dormir = (ms: number) => new Promise(listo => setTimeout(listo, ms))

type Metodo = 'card' | 'oxxo' | 'transfer'
/** Cómo se paga cada forma: con tarjeta se cobra sola; con OXXO o transferencia, ella paga cada mes */
const METODOS: Array<{ key: Metodo, label: string, hint: string, Icon: typeof CreditCardIcon, boton: string }> = [
    { key: 'card', label: 'Tarjeta', hint: 'Se cobra sola cada mes', Icon: CreditCardIcon, boton: 'Contratar con tarjeta' },
    { key: 'oxxo', label: 'OXXO', hint: 'Pagas en efectivo cada mes; se confirma al día hábil siguiente', Icon: StoreIcon, boton: 'Generar mi ficha de OXXO' },
    { key: 'transfer', label: 'Transferencia', hint: 'Desde tu banco cada mes; se confirma en minutos', Icon: LandmarkIcon, boton: 'Ver los datos para transferir' },
]
const ACTIVA = 'Tu plan se activa en cuanto se confirme tu pago (OXXO: al día hábil siguiente; transferencia: en minutos).'

/**
 * Contratar el Plan Standard («Tu estrategia») con tarjeta, desde la web (David, 28-oct-2026): cuánto paga hoy (con la
 * oferta de lanzamiento, 3 meses a $99) y cada mes, paga en Stripe y al volver se confirma aquí y se le abre su
 * estrategia. Lo que no puede sola (otra moneda, ya se le cobra solo, su prueba…) la manda con el equipo.
 * Es de la web: en la app de las tiendas no se puede decir cómo pagar (ahí va la compra integrada).
 */
const PlanStandardPage = () => {
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const { getMe } = useAuth()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [params] = useSearchParams()
    const sesion = params.get('sesion')
    const cancelado = params.get('cancelado') === '1'

    const { data: cotizacion, error: errorCotizacion, isLoading } = useStandardQuote(!sesion)
    const [error, setError] = useState<string | null>(null)
    const [pagando, setPagando] = useState(false)
    const [metodo, setMetodo] = useState<Metodo>('card')
    // La ficha de OXXO o la transferencia que pidió para contratarlo (o la que ya tenía abierta)
    const [ficha, setFicha] = useState<ICashPayment | null>(null)
    const [cambiando, setCambiando] = useState(false)
    useEffect(() => { if (cotizacion?.cash_pending) setFicha(cotizacion.cash_pending) }, [cotizacion?.cash_pending])
    // al volver de Stripe: confirmando → listo | pendiente
    const [vuelta, setVuelta] = useState<'confirmando' | 'listo' | 'pendiente' | null>(sesion ? 'confirmando' : null)
    const confirmado = useRef(false)

    /* Al volver de pagar: se confirma con Stripe sin esperar al aviso del banco; unos intentos por si tarda */
    const confirmar = async (id: string) => {
        setVuelta('confirmando')
        for (let intento = 0; intento < 8; intento++) {
            try {
                const res = await HttpService.post<ApiResponse<{ status: string, plan: string | null }>>(API_ROUTES.BILLING.STANDARD_CONFIRM, { session_id: id })
                if (res.data?.status === 'paid') {
                    await getMe()
                    queryClient.removeQueries({ queryKey: STRATEGY_KEY })
                    queryClient.removeQueries({ queryKey: STANDARD_QUOTE_KEY })
                    setVuelta('listo')
                    return
                }
                if (res.data?.status === 'expired') break
            } catch {
                /* sigue intentando: la sesión pudo no estar todavía */
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

    /* Al confirmarse su ficha o su transferencia: se le abre el plan como si volviera de Stripe */
    const pagado = async () => {
        await getMe()
        queryClient.removeQueries({ queryKey: STRATEGY_KEY })
        queryClient.removeQueries({ queryKey: STANDARD_QUOTE_KEY })
        setVuelta('listo')
    }

    const pagar = async () => {
        setPagando(true)
        setError(null)
        try {
            const res = await HttpService.post<ApiResponse<{ checkout_url: string, cash_payment?: ICashPayment | null }>>(API_ROUTES.BILLING.STANDARD, { method: metodo })
            // OXXO y transferencia: los datos se enseñan aquí mismo (la página de Stripe queda en «Ver mi ficha»)
            if (metodo !== 'card' && res.data?.cash_payment) {
                setFicha(res.data.cash_payment)
                setCambiando(false)
                setPagando(false)
                queryClient.invalidateQueries({ queryKey: STANDARD_QUOTE_KEY })
                return
            }
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

    const nombrePlan = cotizacion?.plan?.name ?? 'Plan Standard'
    const whatsapp = cotizacion?.whatsapp
        ? `https://wa.me/${cotizacion.whatsapp}?text=${encodeURIComponent(`Hola, soy ${user?.name ?? ''} (cuenta ${user?.account ?? ''}). Quiero el ${nombrePlan}.`)}`
        : null
    const mensajeError = error ?? (errorCotizacion ? ((errorCotizacion as { message?: string })?.message || 'No pudimos cargar tu plan. Inténtalo otra vez.') : null)

    return (
        <div className="grid min-h-dvh place-items-center bg-background px-4 py-10 text-foreground">
            <main className="w-full max-w-[520px]">
                <img src={LOGO_CLARO} alt="Eyplease+" className="mx-auto mb-6 w-20 dark:hidden" />
                <img src={LOGO_OSCURO} alt="Eyplease+" className="mx-auto mb-6 hidden w-20 dark:block" />

                <section className="rounded-[26px] border bg-card p-6 shadow-[0_30px_70px_-40px_rgba(229,7,125,.55)] md:p-8">
                    {vuelta === 'confirmando' && (
                        <div className="grid justify-items-center gap-3 py-8 text-center" role="status">
                            <LoaderCircleIcon className="size-9 animate-spin text-primary" />
                            <p className="text-lg font-bold">Confirmando tu pago…</p>
                            <p className="text-sm text-muted-foreground">Unos segundos y te abrimos tu estrategia.</p>
                        </div>
                    )}

                    {vuelta === 'listo' && (
                        <div className="grid justify-items-center gap-3 py-4 text-center">
                            <span className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white shadow-[0_12px_24px_-12px_rgba(229,7,125,.8)]"><PartyPopperIcon className="size-7" /></span>
                            <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">¡Listo! Ya tienes el {user?.plan?.name ?? nombrePlan}</h1>
                            <p className="max-w-[40ch] text-sm text-muted-foreground">Tu pago quedó registrado. Tu estrategia del mes ya está abierta, armada con tus pedidos.</p>
                            <div className="mt-3 grid w-full gap-2.5">
                                <button type="button" onClick={() => navigate(APP_ROUTES.STRATEGY)} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                                    Ver mi estrategia <ArrowRightIcon className="size-4" />
                                </button>
                                <button type="button" onClick={() => navigate(APP_ROUTES.HOME.INITIAL)} className="inline-flex h-11 items-center justify-center rounded-[14px] border px-5 text-sm font-bold">Ir a Eyplease+</button>
                            </div>
                        </div>
                    )}

                    {vuelta === 'pendiente' && (
                        <div className="grid justify-items-center gap-3 py-4 text-center">
                            <p className="text-lg font-bold">Estamos confirmando tu pago</p>
                            <p className="max-w-[42ch] text-sm text-muted-foreground">El banco está tardando un poco. En cuanto quede, tu plan cambia solo; no tienes que volver a pagar.</p>
                            <button type="button" onClick={() => sesion && confirmar(sesion)} className="mt-2 inline-flex h-11 items-center justify-center rounded-[14px] bg-primary-gradient px-5 text-sm font-extrabold text-white">Revisar otra vez</button>
                        </div>
                    )}

                    {!vuelta && (
                        <>
                            {cancelado && <p className="mb-4 rounded-xl bg-muted px-4 py-2.5 text-center text-sm font-semibold">No se hizo ningún cargo. Cuando quieras, aquí sigue.</p>}
                            <p className="text-[11px] font-extrabold tracking-[.16em] text-[#C0066A] uppercase dark:text-[#FF7AC0]">Tu estrategia</p>
                            <h1 className="mt-1 text-[28px] leading-tight font-extrabold tracking-tight">{nombrePlan}</h1>
                            <p className="mt-1 text-sm text-muted-foreground">Cada mes te digo qué ofrecer con lo que compraste, cuánto ganas, a quién volver a ofrecerle y te doy las piezas con tu logo, listas para WhatsApp.</p>

                            {isLoading && <div className="grid place-items-center py-10"><LoaderCircleIcon className="size-7 animate-spin text-primary" /></div>}

                            {/* Su ficha o transferencia abierta: los datos para pagarla, y cambiar de forma si quiere */}
                            {ficha && ficha.status === 'awaiting' && !cambiando && (
                                <div className="mt-6 grid gap-3">
                                    <CashPaymentCard payment={ficha} onUpdate={setFicha} onPaid={pagado} note={ACTIVA} />
                                    {cotizacion?.available && (
                                        <button type="button" onClick={() => setCambiando(true)} className="text-center text-[13px] font-semibold text-muted-foreground hover:text-foreground">Pagar de otra forma</button>
                                    )}
                                </div>
                            )}

                            {cotizacion?.available && (!ficha || ficha.status !== 'awaiting' || cambiando) && (
                                <>
                                    <div className="mt-6 rounded-2xl bg-muted/60 p-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase">Hoy pagas</p>
                                        <p className="text-[34px] leading-tight font-extrabold tabular-nums">{pesos(cotizacion.due_now, cotizacion.currency)}</p>
                                        <p className="mt-1 text-[13px] text-muted-foreground">
                                            {cotizacion.offer
                                                ? `Tus primeros ${cotizacion.offer.months} meses a ${pesos(cotizacion.offer.amount, cotizacion.currency)} y después ${pesos(cotizacion.monthly, cotizacion.currency)} al mes.`
                                                : `Después, ${pesos(cotizacion.monthly, cotizacion.currency)} al mes.`}
                                        </p>
                                        {cotizacion.offer && <p className="mt-2 inline-flex rounded-full bg-[#E5077D]/10 px-2.5 py-0.5 text-[11px] font-extrabold text-[#C0066A] dark:text-[#FF7AC0]">Precio de lanzamiento</p>}
                                    </div>
                                    {/* Con OXXO y transferencia ella paga cada mes; con tarjeta se cobra sola */}
                                    {cotizacion.methods && (cotizacion.methods.oxxo || cotizacion.methods.transfer) && (
                                        <fieldset className="mt-5">
                                            <legend className="mb-2 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">¿Cómo quieres pagar?</legend>
                                            <div className="grid gap-2">
                                                {METODOS.filter(item => cotizacion.methods?.[item.key]).map(item => {
                                                    const sinCorreo = item.key === 'oxxo' && cotizacion.methods?.oxxo_needs_email
                                                    const elegido = metodo === item.key
                                                    return (
                                                        <label key={item.key} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border-[1.5px] px-3.5 py-3 transition-colors', elegido ? 'border-[#6C47FF] bg-[#6C47FF]/[0.06]' : 'border-border hover:border-[#6C47FF]/40', sinCorreo && 'cursor-default opacity-60')}>
                                                            <input type="radio" name="metodo" value={item.key} checked={elegido} disabled={!!sinCorreo} onChange={() => setMetodo(item.key)} className="size-4 accent-[#6C47FF]" />
                                                            <item.Icon className="size-5 shrink-0 text-[#6C47FF]" />
                                                            <span className="min-w-0 flex-1 leading-tight">
                                                                <b className="block text-[14px]">{item.label}</b>
                                                                <small className="block text-[12px] text-muted-foreground">
                                                                    {sinCorreo ? <>Agrega tu correo en <Link to={`${APP_ROUTES.HOME.PROFILE}?section=personal`} className="font-semibold text-primary underline-offset-2 hover:underline">Mi perfil</Link> para pagar en OXXO</> : item.hint}
                                                                </small>
                                                            </span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                            {cambiando && ficha && (
                                                <p className="mt-2 text-[12px] text-amber-700 dark:text-amber-300">
                                                    Si pides otra forma de pago, tu ficha anterior ya no sirve. <button type="button" onClick={() => setCambiando(false)} className="font-bold underline underline-offset-2">Volver a mi ficha</button>
                                                </p>
                                            )}
                                        </fieldset>
                                    )}
                                    <button type="button" onClick={pagar} disabled={pagando} className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow disabled:opacity-70">
                                        {pagando ? <LoaderCircleIcon className="size-5 animate-spin" /> : (() => { const Icon = METODOS.find(item => item.key === metodo)?.Icon ?? CreditCardIcon; return <Icon className="size-5" /> })()}
                                        {pagando ? (metodo === 'card' ? 'Abriendo el pago…' : 'Preparando tus datos…') : METODOS.find(item => item.key === metodo)?.boton}
                                    </button>
                                    {metodo === 'card' ? (
                                        <>
                                            <p className="mt-2.5 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground"><LockIcon className="size-3" /> Pago seguro con Stripe. Tu estrategia se abre en cuanto se confirma.</p>
                                            <p className="mt-1 text-center text-xs text-muted-foreground">
                                                Se cobra solo cada mes. Lo cancelas cuando quieras desde <Link to={BILLING_PATH} className="font-semibold text-primary underline-offset-2 hover:underline">Mi perfil → Pagos</Link>.
                                            </p>
                                        </>
                                    ) : (
                                        <p className="mt-2.5 text-center text-xs text-muted-foreground">Con {metodo === 'oxxo' ? 'OXXO' : 'transferencia'} pagas tú cada mes desde Mi perfil → Pagos (no se cobra solo). {ACTIVA}</p>
                                    )}
                                </>
                            )}

                            {cotizacion && !cotizacion.available && (
                                <div className="mt-6 grid gap-3">
                                    <p className="rounded-2xl bg-muted/60 p-4 text-sm font-semibold">{cotizacion.message}</p>
                                    {cotizacion.subscription ? (
                                        <button type="button" onClick={() => navigate(BILLING_PATH)} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                                            Ver mi plan en Pagos <ArrowRightIcon className="size-4" />
                                        </button>
                                    ) : cotizacion.reason === 'ya_lo_tiene' ? (
                                        <button type="button" onClick={() => navigate(APP_ROUTES.STRATEGY)} className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                                            Ver mi estrategia <ArrowRightIcon className="size-4" />
                                        </button>
                                    ) : whatsapp && cotizacion.reason !== 'plan' && (
                                        <a href={whatsapp} target="_blank" rel="noopener" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                                            Escríbenos por WhatsApp <MessageCircleIcon className="size-4" />
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

                            {mensajeError && <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-sm font-semibold text-destructive">{mensajeError}</p>}

                            <button type="button" onClick={() => navigate(APP_ROUTES.HOME.INITIAL)} className="mt-4 w-full text-center text-sm font-semibold text-muted-foreground hover:text-foreground">Ahora no</button>
                        </>
                    )}
                </section>
            </main>
        </div>
    )
}

export default PlanStandardPage
