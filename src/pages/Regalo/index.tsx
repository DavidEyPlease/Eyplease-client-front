import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeftIcon, ArrowRightIcon, BellRingIcon, GiftIcon, ImageIcon, LightbulbIcon, LoaderCircleIcon, PartyPopperIcon } from 'lucide-react'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES, GIFT_WELCOME_KEY, PENDING_GIFT_KEY, SESSION_KEY } from '@/constants/app'
import useAuth from '@/hooks/useAuth'
import { ApiResponse, AuthResponse } from '@/interfaces/common'
import { GiftClaim, GiftView } from '@/interfaces/invitations'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import LOGO_CLARO from '@/assets/images/eyplease-logo-color.png'
import LOGO_OSCURO from '@/assets/images/eyplease-logo-fondo-oscuro.png'
import GiftPreviewCard from './GiftPreviewCard'
import GiftSignUpForm, { GiftSignUpData } from './GiftSignUpForm'

const PASOS = [
    { Icon: LightbulbIcon, texto: 'Te decimos qué ofrecer esta semana con lo que ya tienes.' },
    { Icon: ImageIcon, texto: 'Imágenes con tu nombre, listas para WhatsApp.' },
    { Icon: BellRingIcon, texto: 'Anotas quién te compró y te recuerda a quién volver a ofrecerle.' },
]

const pesos = (valor: number) => `$${valor.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
const errorDe = (err: unknown, otro: string) => (err as { message?: string } | null)?.message || otro

/**
 * La página del regalo («Invitar con regalo», David, 29-oct-2026). La abre la consultora con la liga que le mandó su
 * Directora, SIN cuenta: en 60 segundos ve que su estrategia del mes ya está armada con sus pedidos (borrosa y sin
 * montos), una guía de 3 pasos y un solo botón. Al activarlo se registra en un minuto (nombre, número y Directora ya
 * puestos) y entra directo a su estrategia. Si ya tiene cuenta, entra y lo activa con su sesión.
 */
const RegaloPage = () => {
    const { token = '' } = useParams()
    const navigate = useNavigate()
    const { getMe } = useAuth()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const [vista, setVista] = useState<'regalo' | 'registro'>('regalo')
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Con sesión, la API sabe si es ella (o su Directora viendo cómo se ve): se pide cuando ya se sabe
    const { data, error: errorCarga, isLoading, refetch } = useQuery({
        queryKey: ['gift', token, user?.user_id ?? null],
        queryFn: async () => (await HttpService.get<ApiResponse<GiftView>>(API_ROUTES.GIFTS.SHOW.replace('{token}', token))).data,
        enabled: !initialLoading && !!token,
        retry: false,
        staleTime: 5 * 60 * 1000,
    })

    // «Abrió»: una vez por visita (la de su Directora no cuenta: lo decide la API con su sesión)
    const marcada = useRef(false)
    useEffect(() => {
        if (!data || marcada.current || data.status === 'activated') return
        marcada.current = true
        HttpService.post(API_ROUTES.GIFTS.OPEN.replace('{token}', token), {}).catch(() => { /* no detiene nada */ })
    }, [data, token])

    useEffect(() => { window.scrollTo({ top: 0 }) }, [vista])

    const alEntrar = (aplicado: boolean, termina: string | null) => {
        try {
            sessionStorage.removeItem(PENDING_GIFT_KEY)
            if (aplicado) sessionStorage.setItem(GIFT_WELCOME_KEY, JSON.stringify({ hasta: termina, de: data?.director.name ?? null }))
        } catch { /* sin almacenamiento: sólo no sale el aviso */ }
        navigate(APP_ROUTES.STRATEGY, { replace: true })
    }

    const registrar = async (form: GiftSignUpData) => {
        if (!data?.signup) return
        setEnviando(true)
        setError(null)
        try {
            const response = await HttpService.post<ApiResponse<AuthResponse>>(API_ROUTES.SIGN_UP.REGISTER, {
                email: form.email,
                password: form.password,
                name: data.signup.name,
                username: data.signup.username,
                country: data.signup.country,
                planKey: 'standard',
                phone: form.phone,
                source: 'regalo',
                giftToken: token,
            })
            if (!response.data?.token) throw response
            localStorage.setItem(SESSION_KEY, response.data.token)
            await getMe()
            const hasta = useAuthStore.getState().user?.trial_ends_at
            alEntrar(data.gift.available, hasta ? new Date(hasta).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }) : null)
        } catch (err) {
            setError(errorDe(err, 'No pudimos crear tu cuenta. Inténtalo otra vez.'))
            setEnviando(false)
        }
    }

    const activarConSesion = async () => {
        setEnviando(true)
        setError(null)
        try {
            const response = await HttpService.post<ApiResponse<GiftClaim>>(API_ROUTES.GIFTS.CLAIM.replace('{token}', token), {})
            await getMe()
            alEntrar(!!response.data?.applied, response.data?.ends_label ?? null)
        } catch (err) {
            setError(errorDe(err, 'No pudimos activar tu regalo. Inténtalo otra vez.'))
            setEnviando(false)
            refetch()
        }
    }

    const entrar = () => {
        try { sessionStorage.setItem(PENDING_GIFT_KEY, token) } catch { /* sin almacenamiento: entra a su Inicio */ }
        navigate(APP_ROUTES.AUTH.SIGN_IN)
    }

    const Logo = (
        <>
            <img src={LOGO_CLARO} alt="Eyplease+" className="mx-auto w-16 dark:hidden" />
            <img src={LOGO_OSCURO} alt="Eyplease+" className="mx-auto hidden w-16 dark:block" />
        </>
    )

    if (isLoading || initialLoading) {
        return <Marco logo={Logo}><div className="grid place-items-center py-24"><LoaderCircleIcon className="size-8 animate-spin text-primary" /></div></Marco>
    }

    if (errorCarga || !data) {
        return (
            <Marco logo={Logo}>
                <section className="mt-6 rounded-[24px] border bg-card p-6 text-center shadow-card">
                    <GiftIcon className="mx-auto size-9 text-[#E5077D]" />
                    <h1 className="mt-3 text-[22px] font-extrabold tracking-tight">No encontramos este regalo</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{errorDe(errorCarga, 'Pídele a tu Directora que te mande la liga otra vez.')}</p>
                </section>
            </Marco>
        )
    }

    const { consultant, director, gift, preview } = data
    const nombre = consultant.first_name
    const conRegalo = gift.available
    const Directora = (
        <div className="flex items-center justify-center gap-2.5">
            {director.photo
                ? <img src={director.photo} alt="" className="size-11 rounded-full object-cover ring-2 ring-white shadow-md dark:ring-white/20" />
                : <span className="grid size-11 place-items-center rounded-full bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-[15px] font-extrabold text-white">{director.initials}</span>}
            <p className="text-left text-[11.5px] leading-tight font-extrabold tracking-[.12em] text-[#C0066A] uppercase dark:text-[#FF7AC0]">
                {conRegalo || data.status === 'activated' ? 'Un regalo de' : 'Te invita'}<br /><span className="text-[13px] tracking-normal normal-case text-foreground">{director.name}</span>
            </p>
        </div>
    )

    // Ya lo activó
    if (data.status === 'activated') {
        return (
            <Marco logo={Logo}>
                <section className="mt-6 grid justify-items-center gap-3 rounded-[24px] border bg-card p-6 text-center shadow-card">
                    <span className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white"><PartyPopperIcon className="size-7" /></span>
                    <h1 className="text-[24px] leading-tight font-extrabold tracking-tight">{nombre}, tu regalo ya está activo</h1>
                    <p className="text-sm text-muted-foreground">{gift.ends_label ? `Tienes «Tu estrategia» hasta el ${gift.ends_label}.` : 'Ya tienes tu cuenta de Eyplease+.'}</p>
                    <button type="button" onClick={() => (user ? navigate(APP_ROUTES.STRATEGY) : entrar())} className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow">
                        {user ? 'Ver mi estrategia' : 'Entrar a mi cuenta'} <ArrowRightIcon className="size-4" />
                    </button>
                </section>
            </Marco>
        )
    }

    // El registro de un minuto
    if (vista === 'registro' && data.signup) {
        return (
            <Marco logo={Logo}>
                <button type="button" onClick={() => setVista('regalo')} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground hover:text-foreground"><ArrowLeftIcon className="size-4" /> Mi regalo</button>
                <section className="mt-3 rounded-[24px] border bg-card p-5 shadow-card sm:p-6">
                    <p className="text-[11px] font-extrabold tracking-[.16em] text-[#C0066A] uppercase dark:text-[#FF7AC0]">{conRegalo ? `Regalo de ${director.name}` : 'Tu cuenta'}</p>
                    <h1 className="mt-1 text-[24px] leading-tight font-extrabold tracking-tight">{conRegalo ? 'Activa tu regalo' : 'Crea tu cuenta gratis'}</h1>
                    <p className="mt-1 mb-4 text-sm text-muted-foreground">{conRegalo ? 'Es un minuto. Sin tarjeta.' : 'Es un minuto.'}</p>
                    <GiftSignUpForm signup={data.signup} withGift={conRegalo} sending={enviando} error={error} onSubmit={registrar} />
                </section>
                <p className="mt-4 text-center text-[13px] text-muted-foreground">¿Ya tienes cuenta? <button type="button" onClick={entrar} className="font-bold text-[#6C47FF] underline underline-offset-2 dark:text-[#A894FF]">Entra aquí</button></p>
            </Marco>
        )
    }

    // La página del regalo (o, si ya tiene cuenta, entrar o activarlo con su sesión)
    const tieneCuenta = data.status === 'has_account'
    const titulo = !conRegalo
        ? `${nombre}, tu Directora te invita a Eyplease+`
        : preview?.ready ? `${nombre}, tu estrategia de ${preview.month} ya está lista` : `${nombre}, te regalaron un mes de «Tu estrategia»`
    const boton = tieneCuenta
        ? data.is_mine
            ? { texto: conRegalo ? 'Activar mi regalo' : 'Ver mi estrategia', accion: conRegalo ? activarConSesion : () => navigate(APP_ROUTES.STRATEGY) }
            : { texto: 'Entrar para activarlo', accion: entrar }
        : { texto: conRegalo ? 'Activar mi regalo' : 'Crear mi cuenta gratis', accion: () => setVista('registro') }

    return (
        <Marco logo={Logo} pie={
            <div className="grid gap-2">
                {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2 text-center text-[13px] font-semibold text-destructive">{error}</p>}
                <button type="button" onClick={boton.accion} disabled={enviando} className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-primary-gradient px-5 text-[16px] font-extrabold text-white shadow-primary-glow disabled:opacity-70">
                    {enviando ? <LoaderCircleIcon className="size-4 animate-spin" /> : <GiftIcon className="size-5" />} {boton.texto}
                </button>
            </div>
        }>
            <div className="mt-5">{Directora}</div>
            <h1 className="mt-4 text-center text-[27px] leading-[1.12] font-extrabold tracking-tight text-balance">{titulo}</h1>

            {conRegalo
                ? (
                    <div className="mx-auto mt-4 flex max-w-[400px] items-center gap-3 rounded-[20px] bg-[linear-gradient(135deg,#4E31C0,#6C47FF_55%,#2CD4D9)] p-4 text-white shadow-[0_18px_40px_-22px_rgba(78,49,192,.9)]">
                        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/15"><GiftIcon className="size-6" /></span>
                        <span className="grid flex-1 gap-0.5">
                            <span className="text-[17px] leading-tight font-extrabold">{gift.months === 1 ? '1 mes' : `${gift.months} meses`} de «{gift.name}» gratis</span>
                            <span className="text-[12.5px] font-semibold text-white/85">Valor {pesos(gift.value)} · Sin tarjeta · De parte de {director.first_name}</span>
                        </span>
                    </div>
                )
                : gift.message && <p className="mx-auto mt-3 max-w-[400px] rounded-xl bg-muted px-4 py-2.5 text-center text-[13px] font-semibold">{gift.message}</p>}

            {tieneCuenta && (
                <p className="mx-auto mt-3 max-w-[400px] text-center text-[13.5px] text-muted-foreground">
                    {data.is_mine
                        ? conRegalo ? 'Ya tienes tu cuenta: actívalo y se abre tu estrategia.' : gift.message
                        : `Ya tienes tu cuenta de Eyplease+. Entra con tu número de consultora y tu contraseña para ${conRegalo ? 'activar tu regalo' : 'verla'}.`}
                </p>
            )}

            {preview && <div className="mt-5"><GiftPreviewCard preview={preview} /></div>}

            <section className="mt-5 rounded-[22px] border bg-card p-5 shadow-card">
                <p className="text-[11px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">Así funciona</p>
                <ol className="mt-3 grid gap-3">
                    {PASOS.map(({ Icon, texto }, index) => (
                        <li key={texto} className="flex items-start gap-3">
                            <span className="relative grid size-10 shrink-0 place-items-center rounded-2xl bg-[#6C47FF]/10 text-[#4E31C0] dark:text-[#C9BDFF]">
                                <Icon className="size-5" />
                                <span className="absolute -top-1.5 -right-1.5 grid size-5 place-items-center rounded-full bg-[#E5077D] text-[10.5px] font-extrabold text-white">{index + 1}</span>
                            </span>
                            <span className="pt-2 text-[14px] leading-snug font-semibold">{texto}</span>
                        </li>
                    ))}
                </ol>
            </section>

            {conRegalo && (
                <p className="mt-4 text-center text-[12.5px] leading-relaxed text-muted-foreground">
                    Es un regalo: no te pedimos tarjeta. Al terminar tu mes, tu cuenta sigue gratis y tú decides si continúas.
                </p>
            )}
        </Marco>
    )
}

/** Una columna angosta (se lee como en el teléfono) con el botón pegado abajo. */
const Marco = ({ logo, pie, children }: { logo: React.ReactNode, pie?: React.ReactNode, children: React.ReactNode }) => (
    <div className="min-h-dvh bg-[radial-gradient(120%_60%_at_50%_0%,rgba(108,71,255,.12),transparent_70%)] bg-background text-foreground">
        <main className={`mx-auto w-full max-w-[480px] px-4 pt-6 ${pie ? 'pb-36' : 'pb-10'}`}>
            {logo}
            {children}
        </main>
        {pie && (
            <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border/60 bg-background/90 backdrop-blur-md">
                <div className="mx-auto w-full max-w-[480px] px-4 pt-3 pb-[max(14px,env(safe-area-inset-bottom))]">{pie}</div>
            </div>
        )}
    </div>
)

export default RegaloPage
