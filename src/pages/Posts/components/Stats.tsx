import StatTile from '@/components/generics/StatTile'
import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { usePostsStore } from '@/store/posts'
import { queryKeys } from '@/utils/cache'
import { CalendarIcon, FileTextIcon, SendIcon } from 'lucide-react'

interface PostsStatsResponse {
	posts_count: number
	posts_sent_count: number
}

const PostsStats = () => {
	const { filters } = usePostsStore(state => state)

	const { response } = useFetchQuery<PostsStatsResponse[]>(
		API_ROUTES.POSTS.STATS_MONTH,
		{
			customQueryKey: queryKeys.detail('posts-stats', `${filters.post_type}-${filters.section}`),
			enabled: !!filters.section,
			queryParams: {
				section: filters.section,
				post_type: filters.post_type,
			},
		},
	)

	const stats = response?.data?.[0]
	const published = stats?.posts_count ?? 0
	const sent = stats?.posts_sent_count ?? 0
	const pending = Math.max(published - sent, 0)

	return (
		<div className="flex flex-wrap gap-2.5">
			<StatTile
				tone="cyan"
				icon={<FileTextIcon />}
				label="Publicados"
				value={published}
				hint="En el mes"
			/>
			<StatTile
				tone="success"
				icon={<SendIcon />}
				label="Enviadas"
				value={sent}
				hint="En el mes"
			/>
			<StatTile
				tone="primary"
				icon={<CalendarIcon />}
				label="Por enviar"
				value={pending}
				hint="Pendientes"
			/>
		</div>
	)
}

export default PostsStats
