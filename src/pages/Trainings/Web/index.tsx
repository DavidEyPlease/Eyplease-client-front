import { useEffect, useMemo, useState } from "react"
import { Link, Navigate, useParams } from "react-router"

import { API_ROUTES } from "@/constants/api"
import { APP_ROUTES } from "@/constants/app"
import useFetchQuery from "@/hooks/useFetchQuery"
import { ITraining } from "@/interfaces/trainings"
import useAuthStore from "@/store/auth"

/**
 * Presentación interactiva de un tema: una página web aparte (paquete en el CDN). Esta ruta es
 * la PUERTA: exige sesión y manda a la página con un pase en el fragmento de la liga —de quién
 * es (nombre, foto, logo) y la hora—. La página guarda el pase, lo borra de la barra y sin él
 * sólo enseña «inicia sesión»: la liga copiada no abre nada.
 *
 * No va en un marco: el CDN responde `X-Frame-Options: SAMEORIGIN`.
 *
 * La puerta nunca se queda muda: enseña su avance de 0 a 100 (la página de la presentación
 * sigue la cuenta desde donde ésta la deja) y, si el salto tarda, ofrece abrirla a mano.
 */
const TARDA_MS = 6000
/** Hasta dónde llega la cuenta aquí; lo demás lo cuenta la presentación mientras baja sus imágenes. */
const TOPE = 30

const TrainingWebPage = () => {
    const { id = '' } = useParams()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const [tarda, setTarda] = useState(false)
    const [avance, setAvance] = useState(4)

    const { response, loading, error, fetchRetry } = useFetchQuery<ITraining>(
        API_ROUTES.TRAININGS.DETAIL.replace('{id}', id),
        { customQueryKey: ['training', id], enabled: !!id },
    )
    const webUrl = response?.data?.web_url ?? null

    const destino = useMemo(() => {
        if (!webUrl || !user) return null
        const pass = {
            nombre: user.name,
            foto: user.profile_picture?.has_photo ? user.profile_picture.url : null,
            logo: user.logotype?.url ?? null,
            origen: location.origin,
            t: Date.now(),
        }
        return `${webUrl}#e=${encodeURIComponent(JSON.stringify(pass))}`
    }, [webUrl, user])

    /* La cuenta avanza por pasos reales (sesión → tema → salto) y entre uno y otro se arrastra
       despacio, para que nunca parezca detenida. */
    const meta = destino ? TOPE : user ? 18 : 10
    useEffect(() => {
        const t = setInterval(() => setAvance(a => (a < meta ? Math.min(meta, a + Math.max(1, (meta - a) / 6)) : a)), 120)
        return () => clearInterval(t)
    }, [meta])

    useEffect(() => {
        if (!destino) return
        /* replace: «atrás» desde la presentación regresa al listado, no a esta puerta */
        location.replace(destino)
        const t = setTimeout(() => setTarda(true), TARDA_MS)
        return () => clearTimeout(t)
    }, [destino])

    /* Si la sesión o el tema no llegan, tampoco se deja la pantalla girando sin fin */
    useEffect(() => {
        const t = setTimeout(() => setTarda(true), TARDA_MS * 2)
        return () => clearTimeout(t)
    }, [])

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    /* Un tema sin presentación (o que su plan no trae) regresa al listado */
    if (!initialLoading && user && !loading && !error && response && !webUrl) return <Navigate to={APP_ROUTES.TRAININGS.LIST} replace />

    const paso = error ? 'No pudimos traer tu presentación'
        : destino ? 'Abriendo tu presentación…'
        : user ? 'Preparando tu presentación…'
        : 'Revisando tu cuenta…'

    return (
        <div className="grid h-dvh place-content-center bg-background px-6">
            <div className="flex w-[min(360px,86vw)] flex-col items-center gap-5 text-center">
                <div className="text-[64px] leading-none font-extrabold tracking-tight tabular-nums text-primary">
                    {Math.round(avance)}<span className="text-3xl">%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                    <div className="h-full rounded-full bg-primary-gradient transition-[width] duration-300" style={{ width: `${avance}%` }} />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">{paso}</p>

                {error && (
                    <div className="flex flex-wrap justify-center gap-2">
                        <button type="button" onClick={() => fetchRetry()} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">
                            Reintentar
                        </button>
                        <Link to={APP_ROUTES.TRAININGS.LIST} className="rounded-full border px-5 py-2.5 text-sm font-bold">Volver</Link>
                    </div>
                )}

                {!error && tarda && (
                    <div className="flex flex-col items-center gap-3">
                        <p className="text-sm text-muted-foreground">¿Tarda más de lo normal? Ábrela con este botón.</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {destino
                                ? <a href={destino} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Abrir presentación</a>
                                : <button type="button" onClick={() => location.reload()} className="rounded-full bg-primary-gradient px-5 py-2.5 text-sm font-bold text-white shadow-primary-glow">Reintentar</button>}
                            <Link to={APP_ROUTES.TRAININGS.LIST} className="rounded-full border px-5 py-2.5 text-sm font-bold">Volver</Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TrainingWebPage
