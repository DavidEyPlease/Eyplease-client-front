import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { IPost } from '@/interfaces/posts'
import { Maximize2Icon } from 'lucide-react'
import { getDefaultMediaType, getPostMedia, isPostRegenerating, PostMediaType } from '../../lib'
import MediaTypeSwitch from './MediaTypeSwitch'
import PostDetailDrawer from './PostDetailDrawer'
import PostDetailInfo from './PostDetailInfo'
import PostMedia from './PostMedia'

interface Props {
	post: IPost
	ref?: React.Ref<HTMLElement>
}

const PostDetail = ({ post, ref }: Props) => {
	const media = getPostMedia(post)
	const [mediaType, setMediaType] = useState<PostMediaType>(getDefaultMediaType(media))
	const [expanded, setExpanded] = useState(false)

	const showMediaSwitch = !!media.image && !!media.video
	const regenerating = isPostRegenerating(post)

	// El tope de altura solo entra en pantallas bajas, para que las acciones del pie sigan alcanzables
	return (
		<aside
			ref={ref}
			className="overflow-hidden rounded-[20px] border bg-card shadow-card lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
		>
			<div className="flex items-center justify-between gap-2 border-b px-3.5 py-2.5">
				{showMediaSwitch && <MediaTypeSwitch value={mediaType} onChange={setMediaType} />}
				<Button
					variant="outline"
					size="icon-sm"
					className="ml-auto rounded-lg text-muted-foreground hover:text-primary"
					aria-label="Ver publicación completa"
					onClick={() => setExpanded(true)}
				>
					<Maximize2Icon />
				</Button>
			</div>

			<PostMedia post={post} media={media} mediaType={mediaType} fit="cover" regenerating={regenerating} />

			<PostDetailInfo post={post} media={media} mediaType={mediaType} />

			<PostDetailDrawer
				post={post}
				media={media}
				mediaType={mediaType}
				open={expanded}
				showMediaSwitch={showMediaSwitch}
				onMediaTypeChange={setMediaType}
				onOpenChange={setExpanded}
			/>
		</aside>
	)
}

export default PostDetail
