import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ApiResponse, NewsletterTypes } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { LIGA_LO_QUIERO, MES_DEL_EJEMPLO, ofrecerBoletinDinamico, planConBoletinDinamico, puedeVerBoletinDinamico } from './acceso'
import { BoletinDinamicoDatos, crearBoletinDinamico } from './dinamico/motor'
import { esMes, etiquetaMes as monthLabel, precargar, ultimosMeses as lastMonths } from './meses'
import PantallaDeCarga from './PantallaDeCarga'
import { useAvanceDeCarga } from './useAvanceDeCarga'

type Ajustes = NonNullable<BoletinDinamicoDatos['ajustes']>
type Persona = { foto?: string | null, fotoOriginal?: string | null }

/** Lo primero que se ve: las piezas de la portada y del Cuadro de Honor y la foto de la Directora. */
const PIEZAS: Record<'p9' | 'p10', string[]> = {
    p9: ['kit-titulo', 'kit-honor', 'kit-joya', 'kit-marco', 'kit-silueta'],
    p10: ['portada_titulo', 'portada_filete', 'honor_linea1', 'honor_linea2', 'honor_emblema'],
}

/** La piel es la plantilla del mes: la 9 («CELEBRA») hasta septiembre; la 10 («Papel en relieve») sale en
 *  noviembre, con el boletín de octubre. */
const pielDelMes = (yearMonth: string): 'p9' | 'p10' => (yearMonth >= '2026-10' ? 'p10' : 'p9')

/**
 * El boletín dinámico de la Directora: el cierre del mes contado cómo pasó, para presentarlo en su junta.
 * Va a pantalla completa, fuera del marco de la web (como la presentación de un entrenamiento): la página trae su
 * propia barra, su Modo junta y sus Ajustes. Los datos salen de la API (reports/boletin-dinamico) y los dibuja el
 * motor (dinamico/motor.js) dentro de un Shadow DOM.
 */
const NewsletterInteractivePage = () => {
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const { newsletters } = useAuthStore(state => state.utilData)
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()

    /* `?ejemplo=1`: la unidad de ejemplo, para que los planes que no lo traen vean cómo es (no se pide nada a la API) */
    const ejemplo = params.get('ejemplo') === '1'
    const months = useMemo(() => lastMonths(6), [])
    const pedido = params.get('mes')
    const yearMonth = ejemplo ? MES_DEL_EJEMPLO : esMes(pedido) ? pedido : months[0]
    const hasUnity = newsletters.some(newsletter => newsletter.code === NewsletterTypes.UNITY)
    const conPlan = planConBoletinDinamico(user)
    const abierto = puedeVerBoletinDinamico(user)

    const queryParams = useMemo(() => ({ year_month: yearMonth }), [yearMonth])
    const { response, error, fetchRetry } = useFetchQuery<BoletinDinamicoDatos>(API_ROUTES.REPORTS.BOLETIN_DINAMICO, {
        queryParams,
        enabled: !ejemplo && !!user && hasUnity && abierto,
        staleTime: 300_000,
    })
    const [deEjemplo, setDeEjemplo] = useState<BoletinDinamicoDatos | null>(null)
    useEffect(() => {
        if (!ejemplo || deEjemplo) return
        import('./ejemplo').then(m => setDeEjemplo(m.boletinDeEjemplo()))
    }, [ejemplo, deEjemplo])
    const datos = ejemplo ? deEjemplo : response?.data ?? null

    /* Lo que el motor necesita de la web, siempre al día aunque el motor se haya armado antes */
    const web = useRef({ params, setParams, navigate, yearMonth })
    web.current = { params, setParams, navigate, yearMonth }

    /* la piel la elige la plantilla desde la que se abrió (`?piel=`), o la del mes */
    const pielPedida = params.get('piel')
    const piel = !ejemplo && (pielPedida === 'p9' || pielPedida === 'p10') ? pielPedida : pielDelMes(yearMonth)
    /* lo que se está armando: el mes, o el ejemplo */
    const clave = ejemplo ? 'ejemplo' : yearMonth
    const [imagenes, setImagenes] = useState<string | null>(null)
    useEffect(() => {
        if (!datos) return
        let vigente = true
        const dir = (datos.directora ?? {}) as Persona
        // la 9 trae además su fondo de satín: el de pantalla o el de teléfono
        const fondo = piel === 'p9' ? [window.matchMedia('(max-width: 767px)').matches ? 'kit-fondo-v' : 'kit-fondo-h'] : []
        const urls = [...PIEZAS[piel], ...fondo].map(f => `/boletin/${piel}/${f}.webp`).concat(dir.foto || dir.fotoOriginal || '').filter(Boolean)
        precargar(urls).then(() => { if (vigente) setImagenes(clave) })
        return () => { vigente = false }
    }, [datos, piel, clave])
    const listas = !!datos && imagenes === clave
    /* El boletín se arma al llegar a 100: así su portada se anima ya a la vista */
    const { avance, mostrar } = useAvanceDeCarga(listas ? 100 : datos ? 92 : user ? 72 : 18, clave)

    /* sin reportes cargados de ese mes no hay unidad que contar: se dice, en lugar de una página vacía */
    const vacio = !ejemplo && !!datos && !datos.personas?.length

    const hostRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!hostRef.current || !datos || !mostrar || vacio) return
        window.scrollTo(0, 0)
        /* Lo guardado se apunta también en los datos de la caché: si vuelve a abrir el mes, lo encuentra igual */
        const guardar = (cambios: Record<string, unknown>) =>
            HttpService.put<ApiResponse<Ajustes>>(API_ROUTES.REPORTS.BOLETIN_DINAMICO_AJUSTES, { year_month: web.current.yearMonth, ...cambios })
                .then(res => { if (res?.data) datos.ajustes = res.data })
        const boletin = crearBoletinDinamico(hostRef.current, datos, {
            piel,
            // el ejemplo no cambia de mes ni guarda: sus Ajustes sólo se prueban en pantalla
            meses: ejemplo ? [] : months.map(valor => ({ valor, etiqueta: monthLabel(valor) })),
            mes: web.current.yearMonth,
            cambiarMes: valor => {
                const next = new URLSearchParams(web.current.params)
                next.set('mes', valor)
                web.current.setParams(next, { replace: true })
            },
            // se abre en su propia pestaña: «cerrar» la cierra y la plataforma sigue donde estaba; si el navegador no
            // la deja cerrar (se llegó escribiendo la dirección), regresa al Studio
            volver: () => {
                window.close()
                setTimeout(() => web.current.navigate(APP_ROUTES.HOME.NEWSLETTER), 150)
            },
            guardarAjustes: ejemplo ? undefined : cambios => guardar(cambios),
            guardarMensaje: ejemplo ? undefined : mensaje => guardar({ mensaje }),
        })
        return () => boletin.destruir()
    }, [datos, ejemplo, months, mostrar, piel, vacio])

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    const sinPlan = !ejemplo && !initialLoading && !!user && (!hasUnity || !conPlan)
    const enPrueba = !ejemplo && !initialLoading && !!user && !sinPlan && !abierto
    const verEjemplo = sinPlan && hasUnity && ofrecerBoletinDinamico(user)
    const aviso = sinPlan ? 'El boletín interactivo viene en los planes Elite y Nacional.'
        : enPrueba ? 'Muy pronto: el boletín dinámico de tu unidad está en sus últimas pruebas.'
        : error && !datos ? 'No pudimos armar tu boletín. Revisa tu conexión e inténtalo otra vez.'
        : vacio ? `Tu boletín de ${monthLabel(yearMonth).split(' ')[0].toLowerCase()} todavía no tiene datos: se arma con los reportes de tu unidad. En cuanto estén cargados, aquí lo verás.`
        : null
    // con el mes vacío se le ofrece el anterior, que puede tener sus reportes
    const mesAnterior = vacio ? months[months.indexOf(yearMonth) + 1] : undefined
    const paso = avance >= 100 ? '¡Listo!'
        : !user ? 'Revisando tu cuenta…'
        : !datos ? `Juntando tu mes de ${monthLabel(yearMonth).split(' ')[0].toLowerCase()}…`
        : 'Preparando la portada…'

    return (
        <div className="boletin-dinamico min-h-dvh">
            {(!mostrar || aviso) && (
                <PantallaDeCarga aviso={aviso} avance={avance} paso={paso} sello="Boletín interactivo · eyplease+" acciones={<>
                    {verEjemplo && (
                        <button type="button" onClick={() => navigate(`${APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE}?ejemplo=1`)} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Ver un ejemplo</button>
                    )}
                    {mesAnterior && (
                        <button type="button" onClick={() => { const next = new URLSearchParams(params); next.set('mes', mesAnterior); setParams(next, { replace: true }) }} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Ver {monthLabel(mesAnterior).split(' ')[0].toLowerCase()}</button>
                    )}
                    {!!error && !datos && !sinPlan && !enPrueba && (
                        <button type="button" onClick={() => fetchRetry()} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Reintentar</button>
                    )}
                    <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER)} className="rounded-full border px-5 py-2.5 text-sm font-bold">Ir al boletín</button>
                </>} />
            )}
            <div ref={hostRef} />
            {/* El ejemplo se dice ejemplo todo el tiempo, y desde ahí se pide (o se abre el suyo, si ya lo tiene) */}
            {ejemplo && mostrar && (
                <aside className="fixed inset-x-3 top-[70px] z-50 flex items-center justify-between gap-3 rounded-2xl bg-[#1b0f2b]/88 py-1.5 pr-1.5 pl-3.5 md:py-2 md:pr-2 md:pl-4 text-white shadow-[0_18px_40px_-18px_rgba(0,0,0,.9)] ring-1 ring-white/15 backdrop-blur-md md:inset-x-auto md:top-[80px] md:right-[max(10px,calc((100vw-1280px)/2))]">
                    <p className="min-w-0 text-[11.5px] leading-snug text-white/85 md:text-[12.5px]">
                        <b className="mr-1.5 text-[10.5px] font-extrabold tracking-[.16em] text-[#F2C46D] uppercase">Ejemplo</b>
                        Así se vería con tu unidad
                    </p>
                    {abierto ? (
                        <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER_INTERACTIVE)} className="shrink-0 rounded-xl bg-white px-3.5 py-1.5 text-[12.5px] font-extrabold text-[#4E31C0] md:py-2">Abrir el mío</button>
                    ) : !conPlan && (
                        <button type="button" onClick={() => navigate(LIGA_LO_QUIERO)} className="shrink-0 rounded-xl bg-white px-3.5 py-1.5 text-center text-[12.5px] font-extrabold text-[#4E31C0] md:py-2">Lo quiero<span className="hidden md:inline"> en mi unidad</span></button>
                    )}
                </aside>
            )}
        </div>
    )
}

export default NewsletterInteractivePage
