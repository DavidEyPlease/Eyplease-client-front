import { useCallback } from "react"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"
import { API_ROUTES } from "@/constants/api"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { PaginationResponse } from "@/interfaces/common"
import { INotification } from "@/interfaces/notification"
import { queryKeys } from "@/utils/cache"

const QUERY_KEY = queryKeys.list('notifications')

const useNotifications = () => {
    const queryClient = useQueryClient()

    const {
        data,
        ...infiniteQuery
    } = useInfiniteListQuery<INotification>(
        API_ROUTES.NOTIFICATIONS,
        {
            customQueryKey: QUERY_KEY,
        }
    )

    const notifications = data?.pages.flatMap(page => page.items) ?? []
    const unreadCount = notifications.filter((n) => !n.read_at).length
    const unreadNotifications = notifications.filter((n) => !n.read_at)

    const { request } = useRequestQuery({
        onSuccess: () => {
            // Actualizar la cache marcando las notificaciones como leídas
            queryClient.setQueryData<InfiniteData<PaginationResponse<INotification>>>(
                QUERY_KEY,
                (oldData) => {
                    if (!oldData) return oldData
                    return {
                        ...oldData,
                        pages: oldData.pages.map((page) => ({
                            ...page,
                            items: page.items.map((n) =>
                                n.read_at ? n : { ...n, read_at: new Date().toISOString() }
                            ),
                        })),
                    }
                }
            )
        },
    })

    const markAsRead = useCallback(() => {
        if (unreadNotifications.length === 0) return

        const ids = unreadNotifications.map((n) => n.id)
        request('POST', API_ROUTES.READ_NOTIFICATIONS, { ids })
    }, [unreadNotifications])

    return {
        notifications,
        unreadCount,
        markAsRead,
        ...infiniteQuery,
    }
}

export default useNotifications