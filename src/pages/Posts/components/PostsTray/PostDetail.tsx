import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { IPost } from '@/interfaces/posts'
import { Maximize2Icon } from 'lucide-react'
import { getAvailableMediaTypes, getDefaultMediaType, getPostMedia, isPostRegenerating, PostMediaType } from '../../lib'
import MediaTypeSwitch from './MediaTypeSwitch'
import PostDetailDrawer from './PostDetailDrawer'
import PostDetailInfo from './PostDetailInfo'
import PostMedia from './PostMedia'
import VersionSwitch from './VersionSwitch'

interface Props {
	post: IPost
	/** Las versiones de esa misma noticia. Una sola cuando la sección no las maneja. */
	versions: IPost[]
	onVersionChange: (postId: string) => void
	ref?: React.Ref<HTMLElement>
}

const PostDetail = ({ post, versions, onVersionChange, ref }: Props) => {
	const media = getPostMedia(post)
	const [mediaType, setMediaType] = useState<PostMediaType>(getDefaultMediaType(media))
	const [expanded, setExpanded] = useState(false)

	const mediaTypes = getAvailableMediaTypes(media)
	const showMediaSwitch = mediaTypes.length > 1
	/* Si el formato elegido deja de existir —la publicación se regeneró sin él— se cae al primero
	   que sí tenga, en vez de quedarse enseñando un hueco. */
	const activeType = mediaTypes.includes(mediaType) ? mediaType : mediaTypes[0] ?? mediaType
	const regenerating = isPostRegenerating(post)

	// El tope de altura solo entra en pantallas bajas, para que las acciones del pie sigan alcanzables
	return (
		<aside
			ref={ref}
			className="overflow-hidden rounded-[20px] border bg-card shadow-card lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
		>
			<div className="flex flex-wrap items-center justify-between gap-2 border-b px-3.5 py-2.5">
				{showMediaSwitch && <MediaTypeSwitch value={activeType} types={mediaTypes} onChange={setMediaType} />}
				{versions.length > 1 && (
					<VersionSwitch value={post.id} versions={versions} onChange={onVersionChange} />
				)}
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

			<PostMedia post={post} media={media} mediaType={activeType} fit="cover" regenerating={regenerating} />

			<PostDetailInfo post={post} media={media} mediaType={activeType} />

			<PostDetailDrawer
				post={post}
				media={media}
				mediaType={activeType}
				mediaTypes={mediaTypes}
				open={expanded}
				showMediaSwitch={showMediaSwitch}
				onMediaTypeChange={setMediaType}
				onOpenChange={setExpanded}
			/>
		</aside>
	)
}

export default PostDetail
