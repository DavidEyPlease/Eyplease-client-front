import { API_ROUTES } from "@/constants/api"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { INotification } from "@/interfaces/notification"
import { queryKeys } from "@/utils/cache"

const useNotifications = () => {
    const {
        data,
        ...infiniteQuery
    } = useInfiniteListQuery<INotification>(
        API_ROUTES.NOTIFICATIONS,
        {
            customQueryKey: queryKeys.list('notifications'),
        }
    )

    const notifications = data?.pages.flatMap(page => page.items) ?? []
    const unreadCount = notifications.filter((n) => !n.read_at).length

    return {
        notifications,
        unreadCount,
        ...infiniteQuery,
    }
}

export default useNotifications