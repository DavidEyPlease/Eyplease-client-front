import { useEffect } from "react"
import { Navigate, useParams } from "react-router"

import PageLoader from "@/components/generics/PageLoader"
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
 */
const TrainingWebPage = () => {
    const { id = '' } = useParams()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)

    const { response, loading } = useFetchQuery<ITraining>(
        API_ROUTES.TRAININGS.DETAIL.replace('{id}', id),
        { customQueryKey: ['training', id], enabled: !!id },
    )
    const webUrl = response?.data?.web_url ?? null

    useEffect(() => {
        if (!webUrl || !user) return

        const pass = {
            nombre: user.name,
            foto: user.profile_picture?.has_photo ? user.profile_picture.url : null,
            logo: user.logotype?.url ?? null,
            origen: location.origin,
            t: Date.now(),
        }
        /* replace: «atrás» desde la presentación regresa al listado, no a esta puerta */
        location.replace(`${webUrl}#e=${encodeURIComponent(JSON.stringify(pass))}`)
    }, [webUrl, user])

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    /* Un tema sin presentación (o que su plan no trae) regresa al listado */
    if (!initialLoading && user && !loading && !webUrl) return <Navigate to={APP_ROUTES.TRAININGS.LIST} replace />

    return (
        <div className="grid h-dvh place-content-center">
            <PageLoader />
        </div>
    )
}

export default TrainingWebPage
