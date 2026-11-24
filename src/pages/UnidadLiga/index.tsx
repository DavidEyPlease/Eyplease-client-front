import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { AppleIcon, ArrowLeftIcon, LoaderCircleIcon, PartyPopperIcon, PlayIcon, SparklesIcon } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES, SESSION_KEY } from '@/constants/app'
import { STORE_URLS } from '@/constants/countries'
import useAuth from '@/hooks/useAuth'
import { ApiResponse, AuthResponse } from '@/interfaces/common'
import { UnitLinkOpen, UnitLinkPublic } from '@/interfaces/trainings'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import LOGO_CLARO from '@/assets/images/eyplease-logo-color.png'
import LOGO_OSCURO from '@/assets/images/eyplease-logo-fondo-oscuro.png'
import UnidadSignUpForm, { UnidadSignUpData } from './UnidadSignUpForm'

/** Su número, para no pedírselo otra vez en el registro */
const NUMERO_KEY = 'eyplease:unidad-numero'
const errorDe = (err: unknown, otro: string) => (err as { message?: string } | null)?.message || otro
const leerNumero = () => { try { return sessionStorage.getItem(NUMERO_KEY) || '' } catch { return '' } }

/**
 * La presentación que una Directora (Elite o Área) compartió con su Unidad (David, 24-nov-2026, opción C). La abre la
 * consultora con la liga del grupo, SIN cuenta: ve quién se la regala, puede dar su número (para que la salude por su
 * nombre y su Directora vea que entró) y entra a la presentación con un pase de su Directora en modo «Unidad». Desde la
 * presentación, «Crear mi cuenta» la trae a `/u/{token}/registro`: cuenta gratis ligada a esa Unidad.
 */
const UnidadLigaPage = ({ registro = false }: { registro?: boolean }) => {
    const { token = '' } = useParams()
    const navigate = useNavigate()
    const { getMe } = useAuth()
    const initialLoading = useAuthStore(state => state.initialLoading)
    const [numero, setNumero] = useState(leerNumero)
    const [enviando, setEnviando] = useState(false)
    const [error, setError] = useState<string | null>(null)
    /** Ya creó su cuenta: se le ofrece la app (ahí le llega lo que le comparte su Directora) */
    const [lista, setLista] = useState<string | null>(null)

    const { data, error: errorCarga, isLoading } = useQuery({
        queryKey: ['unidad-liga', token],
        queryFn: async () => (await HttpService.get<ApiResponse<UnitLinkPublic>>(API_ROUTES.CAPACITACION_PUBLICA.SHOW.replace('{token}', token))).data,
        enabled: !initialLoading && /^[A-Za-z0-9]{12,32}$/.test(token),
        retry: false,
        staleTime: 5 * 60 * 1000,
    })

    // Que no la indexen los buscadores: trae el nombre y la foto de la Directora
    useEffect(() => {
        const meta = document.createElement('meta')
        meta.name = 'robots'
        meta.content = 'noindex, nofollow'
        document.head.appendChild(meta)
        return () => meta.remove()
    }, [])

    useEffect(() => { window.scrollTo({ top: 0 }) }, [registro])

    const abrir = async () => {
        if (!data) return
        setEnviando(true)
        setError(null)
        const limpio = numero.trim().toUpperCase().replace(/\s+/g, '')
        let saludo: UnitLinkOpen | null = null
        try {
            saludo = (await HttpService.post<ApiResponse<UnitLinkOpen>>(API_ROUTES.CAPACITACION_PUBLICA.ABRIR.replace('{token}', token), limpio ? { account: limpio } : {})).data
        } catch { /* no detiene nada: entra sin saludo */ }
        try { if (limpio) sessionStorage.setItem(NUMERO_KEY, limpio) } catch { /* sin almacenamiento */ }
        const pase = {
            nombre: data.director.name,
            foto: data.director.photo,
            logo: data.director.logo,
            origen: location.origin,
            t: Date.now(),
            modo: 'unidad',
            consultora: saludo?.consultant?.first_name ?? null,
            // Si ya tiene cuenta, el botón de la presentación la manda a entrar; si no, a su registro de un minuto
            registro: saludo?.has_account ? `${location.origin}${APP_ROUTES.AUTH.SIGN_IN}` : `${location.origin}${APP_ROUTES.UNIDAD_REGISTRO.replace(':token', token)}`,
        }
        location.href = `${data.training.web_url}#e=${encodeURIComponent(JSON.stringify(pase))}`
    }

    const registrar = async (form: UnidadSignUpData) => {
        if (!data) return
        setEnviando(true)
        setError(null)
        try {
            const response = await HttpService.post<ApiResponse<AuthResponse>>(API_ROUTES.SIGN_UP.REGISTER, {
                email: form.email,
                password: form.password,
                name: form.name,
                username: form.username,
                country: data.country,
                planKey: 'standard',
                phone: form.phone,
                source: 'unidad',
                unitToken: token,
                accept_terms: true,
            })
            if (!response.data?.token) throw response
            localStorage.setItem(SESSION_KEY, response.data.token)
            await getMe()
            setLista(form.name.split(/\s+/)[0] || 'Listo')
            setEnviando(false)
        } catch (err) {
            setError(errorDe(err, 'No pudimos crear tu cuenta. Inténtalo otra vez.'))
            setEnviando(false)
        }
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
        // Sin conexión no es lo mismo que una liga apagada: se le dice distinto y puede reintentar
        const sinRed = !(errorCarga as { status?: number } | null)?.status && /fetch|network|red/i.test(errorDe(errorCarga, ''))
        return (
            <Marco logo={Logo}>
                <section className="mt-6 rounded-[24px] border bg-card p-6 text-center shadow-card">
                    <SparklesIcon className="mx-auto size-9 text-[#E5077D]" />
                    <h1 className="mt-3 text-[22px] font-extrabold tracking-tight">{sinRed ? 'No pudimos abrirla' : 'Esta liga ya no está disponible'}</h1>
                    <p className="mt-2 text-sm text-muted-foreground">{sinRed ? 'Revisa tu conexión e inténtalo otra vez.' : 'Pídele a tu Directora la nueva.'}</p>
                    {sinRed && <button type="button" onClick={() => location.reload()} className="mt-4 rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Reintentar</button>}
                </section>
            </Marco>
        )
    }

    const { director, training } = data
    const Directora = (
        <div className="flex items-center justify-center gap-3">
            {director.photo
                ? <img src={director.photo} alt="" className="size-14 rounded-full object-cover ring-2 ring-white shadow-md dark:ring-white/20" />
                : <span className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-lg font-extrabold text-white">{director.first_name.slice(0, 1)}</span>}
            <p className="text-left text-[11.5px] leading-tight font-extrabold tracking-[.12em] text-[#C0066A] uppercase dark:text-[#FF7AC0]">
                Te la regala tu Directora<br /><span className="text-[15px] tracking-normal normal-case text-foreground">{director.short_name}</span>
            </p>
        </div>
    )

    // Ya tiene su cuenta: la app es donde recibe lo que le comparte su Directora (la web sigue sirviendo)
    if (lista) {
        return (
            <Marco logo={Logo}>
                <section className="mt-6 grid justify-items-center gap-3 rounded-[24px] border bg-card p-6 text-center shadow-card">
                    <span className="grid size-14 place-items-center rounded-full bg-[linear-gradient(135deg,#E5077D,#6C47FF)] text-white"><PartyPopperIcon className="size-7" /></span>
                    <h1 className="text-[25px] leading-tight font-extrabold tracking-tight">¡Listo, {lista}!</h1>
                    <p className="text-[14.5px] leading-relaxed text-muted-foreground">Ya estás en la Unidad de {director.first_name}. Descarga la app de Eyplease+: ahí tienes «Tu estrategia» de este mes y, muy pronto, todo lo que te comparta.</p>
                    <p className="text-[12.5px] text-muted-foreground">Entras con tu número de consultora y la contraseña que acabas de crear.</p>
                    <div className="mt-2 grid w-full gap-2">
                        <a href={STORE_URLS.ios} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-foreground px-5 text-[15px] font-extrabold text-background"><AppleIcon className="size-5" /> Descargar para iPhone</a>
                        <a href={STORE_URLS.android} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-primary-gradient px-5 text-[15px] font-extrabold text-white shadow-primary-glow"><PlayIcon className="size-5" /> Descargar para Android</a>
                    </div>
                    <button type="button" onClick={() => navigate(APP_ROUTES.STRATEGY, { replace: true })} className="mt-2 text-[13.5px] font-bold text-[#6C47FF] underline underline-offset-2 dark:text-[#A894FF]">Seguir en la web</button>
                </section>
            </Marco>
        )
    }

    if (registro) {
        return (
            <Marco logo={Logo}>
                <button type="button" onClick={() => navigate(APP_ROUTES.UNIDAD.replace(':token', token))} className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground hover:text-foreground"><ArrowLeftIcon className="size-4" /> La presentación</button>
                <section className="mt-3 rounded-[24px] border bg-card p-5 shadow-card sm:p-6">
                    <p className="text-[11px] font-extrabold tracking-[.16em] text-[#C0066A] uppercase dark:text-[#FF7AC0]">De parte de {director.first_name}</p>
                    <h1 className="mt-1 text-[24px] leading-tight font-extrabold tracking-tight">Crea tu cuenta gratis</h1>
                    <p className="mt-1 mb-4 text-sm text-muted-foreground">Es un minuto, sin tarjeta. Quedas en la Unidad de {director.first_name} y recibes cada mes lo que te comparte.</p>
                    <UnidadSignUpForm numero={numero} directora={director.short_name} sending={enviando} error={error} onSubmit={registrar} />
                </section>
                <p className="mt-4 text-center text-[13px] text-muted-foreground">¿Ya tienes cuenta? <Link to={APP_ROUTES.AUTH.SIGN_IN} className="font-bold text-[#6C47FF] underline underline-offset-2 dark:text-[#A894FF]">Entra aquí</Link></p>
            </Marco>
        )
    }

    return (
        <Marco logo={Logo} pie={
            <button type="button" onClick={abrir} disabled={enviando} className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-primary-gradient px-5 text-[16px] font-extrabold text-white shadow-primary-glow disabled:opacity-70">
                {enviando ? <LoaderCircleIcon className="size-4 animate-spin" /> : <SparklesIcon className="size-5" />} Abrir la presentación
            </button>
        }>
            <div className="mt-6">{Directora}</div>
            <h1 className="mt-5 text-center text-[27px] leading-[1.12] font-extrabold tracking-tight text-balance">{training.title}</h1>
            <p className="mx-auto mt-3 max-w-[400px] text-center text-[14.5px] leading-relaxed text-muted-foreground">
                Una presentación interactiva que {director.first_name} compartió con su Unidad. Úsala desde tu teléfono: tiene mensajes listos, imágenes para tu estado y más.
            </p>
            <section className="mt-6 rounded-[22px] border bg-card p-5 shadow-card">
                <label className="grid gap-1.5">
                    <span className="text-[13px] font-bold">Tu número de consultora <span className="font-semibold text-muted-foreground">(opcional)</span></span>
                    <Input value={numero} onChange={e => setNumero(e.target.value.slice(0, 20))} onKeyDown={e => { if (e.key === 'Enter') abrir() }} placeholder="Ej. 186234" autoComplete="username" />
                    <span className="text-[12px] text-muted-foreground">Para que salga tu nombre y {director.first_name} sepa que la viste.</span>
                </label>
                {error && <p role="alert" className="mt-3 rounded-xl bg-destructive/10 px-4 py-2 text-center text-[13px] font-semibold text-destructive">{error}</p>}
            </section>
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

export default UnidadLigaPage
