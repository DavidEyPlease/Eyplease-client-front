import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router'

import { API_ROUTES } from '@/constants/api'
import { APP_ROUTES } from '@/constants/app'
import useFetchQuery from '@/hooks/useFetchQuery'
import { ApiResponse, NewsletterTypes } from '@/interfaces/common'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'
import { puedeVerBoletinNacional } from '@/pages/NewsletterInteractive/acceso'
import { esMes, etiquetaMes, nombreMes, precargar, ultimosMeses } from '@/pages/NewsletterInteractive/meses'
import { BoletinNacionalDatos, crearBoletinNacional } from '@/pages/NewsletterInteractive/nacional/motor'
import PantallaDeCarga from '@/pages/NewsletterInteractive/PantallaDeCarga'
import { useAvanceDeCarga } from '@/pages/NewsletterInteractive/useAvanceDeCarga'

type Ajustes = NonNullable<BoletinNacionalDatos['ajustes']>

/** Lo primero que se ve: la portada (título, marco y silueta), el título del Cuadro de Honor y el fondo de satín. */
const PIEZAS = ['kit-titulo', 'kit-honor', 'kit-joya', 'kit-marco', 'kit-silueta']

/**
 * El boletín NACIONAL interactivo de la Directora Nacional: el cierre del mes de su Área, para presentarlo en su
 * junta. Va a pantalla completa, fuera del marco de la web, como el de unidad: trae su propia barra, su Modo junta y
 * sus Ajustes (el mes y su mensaje). Los datos salen de la API (reports/boletin-nacional) y los dibuja el motor
 * (NewsletterInteractive/nacional/motor.js) dentro de un Shadow DOM.
 */
const NewsletterNationalPage = () => {
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const { newsletters } = useAuthStore(state => state.utilData)
    const navigate = useNavigate()
    const [params, setParams] = useSearchParams()

    const months = useMemo(() => ultimosMeses(6), [])
    const pedido = params.get('mes')
    const yearMonth = esMes(pedido) ? pedido : months[0]
    const hasNational = newsletters.some(newsletter => newsletter.code === NewsletterTypes.NATIONAL)
    const abierto = puedeVerBoletinNacional(user)

    const queryParams = useMemo(() => ({ year_month: yearMonth }), [yearMonth])
    const { response, error, fetchRetry } = useFetchQuery<BoletinNacionalDatos>(API_ROUTES.REPORTS.BOLETIN_NACIONAL, {
        queryParams,
        enabled: !!user && hasNational && abierto,
        staleTime: 300_000,
    })
    const datos = response?.data ?? null

    /* Lo que el motor necesita de la web, siempre al día aunque el motor se haya armado antes */
    const web = useRef({ params, setParams, navigate, yearMonth })
    web.current = { params, setParams, navigate, yearMonth }

    /* Cuenta → datos → imágenes de la portada; el boletín se arma al llegar a 100 */
    const [imagenes, setImagenes] = useState<string | null>(null)
    useEffect(() => {
        if (!datos) return
        let vigente = true
        const fondo = window.matchMedia('(max-width: 767px)').matches ? 'kit-fondo-v' : 'kit-fondo-h'
        const urls = [...PIEZAS, fondo].map(f => `/boletin/p9/${f}.webp`).concat(datos.directora?.foto || '').filter(Boolean)
        precargar(urls).then(() => { if (vigente) setImagenes(yearMonth) })
        return () => { vigente = false }
    }, [datos, yearMonth])
    const listas = !!datos && imagenes === yearMonth
    const { avance, mostrar } = useAvanceDeCarga(listas ? 100 : datos ? 92 : user ? 72 : 18, yearMonth)

    /* sin reportes del Área cargados de ese mes no hay nada que contar: se dice, en lugar de una página vacía */
    const vacio = !!datos && !datos.personas?.length

    const hostRef = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!hostRef.current || !datos || !mostrar || vacio) return
        window.scrollTo(0, 0)
        const boletin = crearBoletinNacional(hostRef.current, datos, {
            editar: true,
            meses: months.map(valor => ({ valor, etiqueta: etiquetaMes(valor) })),
            mes: web.current.yearMonth,
            cambiarMes: valor => {
                const next = new URLSearchParams(web.current.params)
                next.set('mes', valor)
                web.current.setParams(next, { replace: true })
            },
            // se abre en su propia pestaña: «cerrar» la cierra; si el navegador no la deja, regresa al Studio
            volver: () => {
                window.close()
                setTimeout(() => web.current.navigate(APP_ROUTES.HOME.NEWSLETTER), 150)
            },
            // lo guardado se apunta también en los datos de la caché: si vuelve a abrir el mes, lo encuentra igual
            guardarMensaje: mensaje => HttpService.put<ApiResponse<Ajustes>>(API_ROUTES.REPORTS.BOLETIN_NACIONAL_AJUSTES, { year_month: web.current.yearMonth, mensaje })
                .then(res => { if (res?.data) datos.ajustes = res.data }),
        })
        return () => boletin.destruir()
    }, [datos, months, mostrar, vacio])

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    const sinPlan = !initialLoading && !!user && (!hasNational || !abierto)
    const mes = nombreMes(yearMonth)
    const aviso = sinPlan ? 'El boletín nacional interactivo viene en el plan Nacional.'
        : error && !datos ? 'No pudimos armar tu boletín nacional. Revisa tu conexión e inténtalo otra vez.'
        : vacio ? `Tu boletín nacional de ${mes} todavía no tiene datos: se arma con los reportes de tu Área. En cuanto estén cargados, aquí lo verás.`
        : null
    // con el mes vacío se le ofrece el anterior, que puede tener sus reportes
    const mesAnterior = vacio ? months[months.indexOf(yearMonth) + 1] : undefined
    const paso = avance >= 100 ? '¡Listo!'
        : !user ? 'Revisando tu cuenta…'
        : !datos ? `Juntando el mes de ${mes} de tu Área…`
        : 'Preparando la portada…'

    return (
        <div className="boletin-dinamico min-h-dvh">
            {(!mostrar || aviso) && (
                <PantallaDeCarga aviso={aviso} avance={avance} paso={paso} sello="Boletín nacional · eyplease+" acciones={<>
                    {mesAnterior && (
                        <button type="button" onClick={() => { const next = new URLSearchParams(params); next.set('mes', mesAnterior); setParams(next, { replace: true }) }} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Ver {nombreMes(mesAnterior)}</button>
                    )}
                    {!!error && !datos && !sinPlan && (
                        <button type="button" onClick={() => fetchRetry()} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Reintentar</button>
                    )}
                    <button type="button" onClick={() => navigate(APP_ROUTES.HOME.NEWSLETTER)} className="rounded-full border px-5 py-2.5 text-sm font-bold">Ir al boletín</button>
                </>} />
            )}
            <div ref={hostRef} />
        </div>
    )
}

export default NewsletterNationalPage
