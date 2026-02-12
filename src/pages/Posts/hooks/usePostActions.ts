import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { PaginationResponse } from "@/interfaces/common"
import { IPost } from "@/interfaces/posts"
import { usePostsStore } from "@/store/posts"
import { queryKeys } from "@/utils/cache"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"

const usePostActions = () => {
    const { getListQueryKey } = usePostsStore(state => state)
    const queryClient = useQueryClient()
    const { request, requestState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('posts-stats')]
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
        try {
            updateCachedPost(itemId, { shared_at: new Date() })
            await request('PATCH', API_ROUTES.POSTS.MARK_AS_SENT.replace('{id}', itemId))
        } catch (error) {
            console.error(error)
            updateCachedPost(itemId, { shared_at: null })
        }
    }

    return {
        requestState,
        updateCachedPost,
        markAsSent
    }
}

export default usePostActions
