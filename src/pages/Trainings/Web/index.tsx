import { useEffect, useRef } from "react"
import { ArrowLeftIcon } from "lucide-react"
import { Link, Navigate, useParams } from "react-router"

import PageLoader from "@/components/generics/PageLoader"
import { API_ROUTES } from "@/constants/api"
import { APP_ROUTES } from "@/constants/app"
import useFetchQuery from "@/hooks/useFetchQuery"
import { ITraining } from "@/interfaces/trainings"
import useAuthStore from "@/store/auth"

/**
 * Presentación interactiva de un tema: una página web aparte (paquete en el CDN) que se abre a
 * pantalla completa DENTRO de la sesión. La página no pinta nada por su cuenta: avisa que está
 * lista y espera a que la plataforma le mande de quién es (nombre, foto y logo). Abierta fuera de
 * aquí —con la liga copiada— sólo enseña «inicia sesión».
 */
const TrainingWebPage = () => {
    const { id = '' } = useParams()
    const user = useAuthStore(state => state.user)
    const initialLoading = useAuthStore(state => state.initialLoading)
    const frame = useRef<HTMLIFrameElement>(null)

    const { response, loading } = useFetchQuery<ITraining>(
        API_ROUTES.TRAININGS.DETAIL.replace('{id}', id),
        { customQueryKey: ['training', id], enabled: !!id },
    )
    const webUrl = response?.data?.web_url ?? null

    useEffect(() => {
        if (!webUrl || !user) return
        const origin = new URL(webUrl, location.href).origin

        const onMessage = (event: MessageEvent) => {
            if (event.origin !== origin || event.data?.type !== 'eyplease:presentacion:lista') return
            frame.current?.contentWindow?.postMessage({
                type: 'eyplease:presentacion:directora',
                nombre: user.name,
                foto: user.profile_picture?.has_photo ? user.profile_picture.url : null,
                logo: user.logotype?.url ?? null,
            }, origin)
        }

        window.addEventListener('message', onMessage)
        return () => window.removeEventListener('message', onMessage)
    }, [webUrl, user])

    if (!initialLoading && !user) return <Navigate to={APP_ROUTES.AUTH.SIGN_IN} replace />

    if (initialLoading || !user || loading) {
        return (
            <div className="grid h-dvh place-content-center">
                <PageLoader />
            </div>
        )
    }

    /* Un tema sin presentación (o que su plan no trae) regresa al listado */
    if (!webUrl) return <Navigate to={APP_ROUTES.TRAININGS.LIST} replace />

    return (
        <div className="fixed inset-0 bg-black">
            <iframe
                ref={frame}
                src={webUrl}
                title={response?.data?.title ?? 'Presentación'}
                className="size-full border-0"
                allow="fullscreen"
            />
            <Link
                to={APP_ROUTES.TRAININGS.LIST}
                aria-label="Volver a Entrenamientos"
                className="fixed bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/80"
            >
                <ArrowLeftIcon className="size-3.5" />
                Salir
            </Link>
        </div>
    )
}

export default TrainingWebPage
