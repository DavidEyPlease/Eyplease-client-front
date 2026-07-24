import { IPost } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { POST_MEDIA_TYPES, PostMedia as PostMediaFiles, PostMediaType } from '../../lib'

interface Props {
	post: IPost
	media: PostMediaFiles
	mediaType: PostMediaType
	/** 'cover' recorta al 4/5 de la tarjeta; 'contain' muestra la pieza completa (drawer). */
	fit: 'cover' | 'contain'
	regenerating?: boolean
}

const PostMedia = ({ post, media, mediaType, fit, regenerating }: Props) => {
	const showVideo = mediaType === POST_MEDIA_TYPES.VIDEO && !!media.video

	return (
		<div className="relative bg-surface-soft">
			{showVideo ? (
				<video
					src={media.video!.url}
					controls
					className={cn('w-full bg-black object-contain', fit === 'cover' ? 'aspect-4/5' : 'max-h-[80vh]')}
				/>
			) : (
				media.image && (
					<img
						src={media.image.url}
						alt={post.title}
						className={cn('w-full', fit === 'cover' ? 'aspect-4/5 object-cover' : 'h-auto object-contain')}
					/>
				)
			)}

			{regenerating && (
				<div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/60 text-center text-white backdrop-blur-sm">
					<span className="size-7 animate-spin rounded-full border-[3px] border-white/30 border-t-white" />
					<span className="text-[12.5px] font-semibold">Generando nuevo diseño…</span>
				</div>
			)}
		</div>
	)
}

export default PostMedia
