import { useEffect, useMemo, useRef } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ApiResponse, NewsletterTypes } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { BoletinDinamicoDatos, crearBoletinDinamico } from './dinamico/motor'
import './dinamico/pantalla.css'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/** El mes del boletín por defecto es el anterior, igual que el PDF (`getReportDates`). */
const lastMonths = (count: number): string[] => {
    const date = new Date()
    date.setDate(1)
    return Array.from({ length: count }, () => {
        date.setMonth(date.getMonth() - 1)
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    })
}
const monthLabel = (yearMonth: string) => {
    const [year, month] = yearMonth.split('-').map(Number)
    const nombre = MESES[month - 1]
    return `${nombre[0].toUpperCase()}${nombre.slice(1)} ${year}`
}

type Ajustes = NonNullable<BoletinDinamicoDatos['ajustes']>

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

    const months = useMemo(() => lastMonths(6), [])
    const pedido = params.get('mes')
    const yearMonth = pedido && /^\d{4}-(0[1-9]|1[0-2])$/.test(pedido) ? pedido : months[0]
    const hasUnity = newsletters.some(newsletter => newsletter.code === NewsletterTypes.UNITY)

    const queryParams = useMemo(() => ({ year_month: yearMonth }), [yearMonth])
    const { response, loading, error, fetchRetry } = useFetchQuery<BoletinDinamicoDatos>(API_ROUTES.REPORTS.BOLETIN_DINAMICO, {
        queryParams,
        enabled: !!user && hasUnity,
        staleTime: 300_000,
    })
    const datos = response?.data ?? null

    /* Lo que el motor necesita de la web, siempre al día aunque el motor se haya armado antes */
    const web = useRef({ params, setParams, navigate, yearMonth })
    web.current = { params, setParams, navigate, yearMonth }

    const hostRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!hostRef.current || !datos) return
        window.scrollTo(0, 0)
        /* Lo guardado se apunta también en los datos de la caché: si vuelve a abrir el mes, lo encuentra igual */
        const guardar = (cambios: Record<string, unknown>) =>
            HttpService.put<ApiResponse<Ajustes>>(API_ROUTES.REPORTS.BOLETIN_DINAMICO_AJUSTES, { year_month: web.current.yearMonth, ...cambios })
                .then(res => { if (res?.data) datos.ajustes = res.data })
        const boletin = crearBoletinDinamico(hostRef.current, datos, {
            meses: months.map(valor => ({ valor, etiqueta: monthLabel(valor) })),
            mes: web.current.yearMonth,
            cambiarMes: valor => {
                const next = new URLSearchParams(web.current.params)
                next.set('mes', valor)
                web.current.setParams(next, { replace: true })
            },
            volver: () => web.current.navigate(APP_ROUTES.HOME.NEWSLETTER),
            guardarAjustes: cambios => guardar(cambios),
            guardarMensaje: mensaje => guardar({ mensaje }),
        })
        return () => boletin.destruir()
    }, [datos, months])

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    const sinPlan = !initialLoading && !!user && !hasUnity
    const cargando = !sinPlan && !datos && !error && (initialLoading || loading || !response)

    return (
        <div className="boletin-dinamico">
            {cargando && (
                <div className="bd-pantalla" role="status">
                    <span className="bd-aro" aria-hidden />
                    <p>Armando tu boletín de {monthLabel(yearMonth).toLowerCase()}…</p>
                </div>
            )}
            {sinPlan && (
                <div className="bd-pantalla">
                    <p>Tu plan no incluye el boletín de unidad.</p>
                    <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER)}>Volver</button>
                </div>
            )}
            {!!error && !datos && (
                <div className="bd-pantalla">
                    <p>No pudimos armar tu boletín. Revisa tu conexión e inténtalo otra vez.</p>
                    <div className="bd-botones">
                        <button type="button" onClick={() => fetchRetry()}>Reintentar</button>
                        <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER)}>Volver</button>
                    </div>
                </div>
            )}
            <div ref={hostRef} />
        </div>
    )
}

export default NewsletterInteractivePage
