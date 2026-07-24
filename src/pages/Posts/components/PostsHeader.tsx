import { MAP_MAIN_POSTS_SECTIONS } from '@/constants/app'
import { MainPostSectionTypes } from '@/interfaces/posts'
import PostsStats from './Stats'

interface Props {
	mainSection: MainPostSectionTypes
}

const PostsHeader = ({ mainSection }: Props) => {
	return (
		<header className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border bg-card bg-hero-glow px-5.5 py-5 shadow-card">
			<div>
				<h1 className="text-[19px] font-extrabold tracking-tight">
					Seguimiento de {MAP_MAIN_POSTS_SECTIONS[mainSection]}
				</h1>
				<p className="mt-0.5 text-[13.5px] font-medium text-muted-foreground">
					Revisa, regenera y marca como enviadas las publicaciones del mes.
				</p>
			</div>
			<PostsStats />
		</header>
	)
}

export default PostsHeader
