import { StatCard } from "@/components/generics/StatCard"
import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { usePostsStore } from "@/store/posts"
import { queryKeys } from "@/utils/cache"
import { FileTextIcon, SendIcon } from "lucide-react"

const PostsStats = () => {
    const { filters } = usePostsStore(state => state)

    const { response } = useFetchQuery<{ posts_count: number, posts_sent_count: number }>(
        API_ROUTES.POSTS.STATS_MONTH,
        {
            customQueryKey: queryKeys.detail('posts-stats', `${filters.post_type}-${filters.section}`),
            enabled: !!filters.section,
            queryParams: {
                section: filters.section,
                post_type: filters.post_type
            }
        }
    )

    return (
        <div className="grid md:grid-cols-2 gap-x-4">
            <StatCard
                title='Publicados'
                color="cyan"
                startContent={<FileTextIcon className="size-6 text-secondary" />}
            >
                <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-secondary">
                        {response?.data?.posts_count ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        En el mes
                    </p>
                </div>
            </StatCard>
            <StatCard
                title='Publicaciones Enviadas'
                color="primary"
                startContent={<SendIcon className="size-6 text-primary" />}
            >
                <div className="flex items-center gap-1">
                    <p className="text-2xl font-bold text-primary">
                        {response?.data?.posts_sent_count ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        En el mes
                    </p>
                </div>
            </StatCard>
        </div>
    )
}

export default PostsStats