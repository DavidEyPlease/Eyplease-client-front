import { useEffect, useState } from 'react'
import { useQueries } from '@tanstack/react-query'

import { API_ROUTES } from '@/constants/api'
import { StrategySlide } from '@/interfaces/strategy'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'

export interface SlideImage {
    key: string
    blob: Blob | null
    /** Para pintarla en un <img> (de este componente: se libera al desmontar) */
    src: string | null
}

/**
 * Las láminas de una pieza de su estrategia. Piden sesión, así que no van en un <img src> directo: se bajan con el
 * mismo cliente de la API y se guardan en caché (la API las deja una hora).
 */
const useSlideImages = (slides: StrategySlide[] | undefined, enabled = true) => {
    const ready = useAuthStore(state => enabled && !!state.user && !state.initialLoading)
    const queries = useQueries({
        queries: (slides ?? []).map(slide => ({
            queryKey: ['consultant', 'strategy-image', slide.key],
            queryFn: () => HttpService.get<Blob>(API_ROUTES.CONSULTANT.STRATEGY_IMAGE.replace('{key}', slide.key), { responseType: 'blob' }),
            staleTime: 50 * 60 * 1000,
            gcTime: 60 * 60 * 1000,
            retry: 1,
            enabled: ready,
        })),
    })

    const blobs = queries.map(query => query.data ?? null)
    const signature = blobs.map(blob => (blob ? `${blob.size}` : '-')).join('|')
    // Las direcciones locales se crean y se liberan en el mismo efecto (en desarrollo React lo corre dos veces)
    const [sources, setSources] = useState<Array<string | null>>([])
    useEffect(() => {
        const urls = blobs.map(blob => (blob ? URL.createObjectURL(blob) : null))
        setSources(urls)
        // Se liberan un momento después: la pantalla todavía puede estar pintando las de antes
        return () => { setTimeout(() => urls.forEach(src => src && URL.revokeObjectURL(src)), 1500) }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- se rearma sólo cuando llega o cambia alguna imagen
    }, [signature])

    const images: SlideImage[] = (slides ?? []).map((slide, index) => ({ key: slide.key, blob: blobs[index], src: sources[index] ?? null }))
    return {
        images,
        loading: queries.some(query => query.isLoading),
        failed: queries.some(query => query.isError),
        ready: images.length > 0 && images.every(image => !!image.blob),
    }
}

export default useSlideImages
