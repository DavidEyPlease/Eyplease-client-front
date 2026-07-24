import { useState } from 'react'

import { API_ROUTES } from '@/constants/api'
import useRequestQuery from '@/hooks/useRequestQuery'
import { PaginationResponse } from '@/interfaces/common'
import { IPost } from '@/interfaces/posts'
import { PostMediaType } from '../lib'
import { usePostsStore } from '@/store/posts'
import { queryKeys } from '@/utils/cache'
import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const markAsSentUrl = (postId: string) => API_ROUTES.POSTS.MARK_AS_SENT.replace('{id}', postId)

const usePostActions = () => {
    const { getListQueryKey } = usePostsStore(state => state)
    const queryClient = useQueryClient()
    const [markingMany, setMarkingMany] = useState(false)

    // Las stats se cachean por sección (queryKeys.detail), así que se invalida la entidad completa.
    // El error se silencia aquí para reportarlo una sola vez por acción, no una por petición.
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.entity('posts-stats')],
        onError: () => { }
    })

    const listQueryKey = getListQueryKey()

    const updateCachedPost = (itemId: string, data?: Partial<IPost>) => {
        queryClient.setQueryData<InfiniteData<PaginationResponse<IPost>>>(listQueryKey, (current) => {
            if (!current) return current

            const pages = current.pages.map((page) => {
                const items = data
                    ? page.items.map((item) => item.id === itemId ? { ...item, ...data } : item)
                    : page.items.filter((item) => item.id !== itemId)

                return { ...page, items }
            })

            return { ...current, pages }
        })
    }

    const markAsSent = async (itemId: string) => {
        updateCachedPost(itemId, { shared_at: new Date() })
        try {
            await request('PATCH', markAsSentUrl(itemId))
        } catch (error) {
            console.error(error)
            updateCachedPost(itemId, { shared_at: null })
            toast.error('No se pudo marcar la publicación como enviada')
        }
    }

    /** Reencola la generación del artefacto (imagen o video) que está viendo la persona. */
    const regenerate = async (itemId: string, artifact: PostMediaType) => {
        updateCachedPost(itemId, { is_regenerating: true })
        try {
            await request('POST', API_ROUTES.POSTS.REGENERATE.replace('{id}', itemId), { artifact })
        } catch (error) {
            console.error(error)
            updateCachedPost(itemId, { is_regenerating: false })
            toast.error('No se pudo enviar a generar de nuevo')
        }
    }

    /** Marca varias en paralelo y revierte solo las que fallen. Devuelve los ids fallidos. */
    const markManyAsSent = async (itemIds: string[]): Promise<string[]> => {
        if (!itemIds.length) return []

        const sharedAt = new Date()
        itemIds.forEach(itemId => updateCachedPost(itemId, { shared_at: sharedAt }))
        setMarkingMany(true)

        const results = await Promise.allSettled(itemIds.map(itemId => request('PATCH', markAsSentUrl(itemId))))
        setMarkingMany(false)

        const failedIds = itemIds.filter((_, index) => results[index].status === 'rejected')
        failedIds.forEach(itemId => updateCachedPost(itemId, { shared_at: null }))

        if (failedIds.length) {
            toast.error(`No se pudieron marcar ${failedIds.length} de ${itemIds.length} publicaciones`)
        } else {
            toast.success(`${itemIds.length} ${itemIds.length === 1 ? 'publicación marcada' : 'publicaciones marcadas'} como enviadas`)
        }

        return failedIds
    }

    return {
        requestState,
        markingMany,
        updateCachedPost,
        markAsSent,
        markManyAsSent,
        regenerate
    }
}

export default usePostActions
