import PrimaryButton from '@/components/common/Button'
import { Button } from '@/components/ui/button'
import useFiles from '@/hooks/useFiles'
import { IPost } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/dates'
import { CalendarIcon, CheckIcon, DownloadIcon, ImageIcon, RefreshCwIcon, VideoIcon } from 'lucide-react'
import usePostActions from '../../hooks/usePostActions'
import { canMarkPostAsSent, getPostDate, getPostMediaFile, getPostMediaLabel, isPostRegenerating, isPostSent, PostMedia, PostMediaType } from '../../lib'

const PILL_CLASSES = 'inline-flex items-center gap-1.5 rounded-full border bg-surface-soft px-2.5 py-1 text-[11px] font-bold text-muted-foreground [&_svg]:size-3'
const ACTION_CLASSES = 'h-auto rounded-xl py-2.5 text-[12.5px] font-semibold text-muted-foreground hover:bg-surface-soft hover:text-primary'

interface Props {
	post: IPost
	media: PostMedia
	mediaType: PostMediaType
}

/** Título, metadatos y acciones de una publicación. Compartido por la tarjeta lateral y el drawer. */
const PostDetailInfo = ({ post, media, mediaType }: Props) => {
	const { requestState, markAsSent, regenerate } = usePostActions()
	const { executing, downloadFile } = useFiles()

	const sent = isPostSent(post)
	const regenerating = isPostRegenerating(post)
	const activeFile = getPostMediaFile(media, mediaType)
	const mediaLabel = getPostMediaLabel(media)
	const MediaLabelIcon = media.image ? ImageIcon : VideoIcon

	return (
		<div className="p-3.5">
			<h2 className="text-[15px] font-extrabold leading-snug tracking-tight">{post.title}</h2>

			<div className="mt-2 flex flex-wrap items-center gap-2">
				<span className={PILL_CLASSES}>
					<CalendarIcon />
					{formatDate(getPostDate(post), { formatter: { date: 'medium' }, dateOnly: true })}
				</span>
				{mediaLabel && (
					<span className={PILL_CLASSES}>
						<MediaLabelIcon />
						{mediaLabel}
					</span>
				)}
			</div>

			<div className="mt-3.5 flex flex-col gap-2">
				{canMarkPostAsSent(post) && (
					<Button
						variant="outline"
						disabled={sent || regenerating || requestState.loading}
						onClick={() => markAsSent(post.id)}
						className={cn(ACTION_CLASSES, 'w-full', sent && 'border-green-200 bg-green-50 text-green-700 disabled:opacity-100')}
					>
						<CheckIcon />
						{sent ? 'Enviada' : 'Marcar como enviada'}
					</Button>
				)}

				<div className="flex gap-2">
					<Button
						variant="outline"
						disabled={regenerating}
						onClick={() => regenerate(post.id, mediaType)}
						className={cn(ACTION_CLASSES, 'flex-1')}
					>
						<RefreshCwIcon className={cn(regenerating && 'animate-spin')} />
						{regenerating ? 'Generando…' : 'Volver a generar'}
					</Button>
					<PrimaryButton
						text={
							<>
								<DownloadIcon className="size-4" />
								Descargar
							</>
						}
						className="w-full flex-1 justify-center rounded-xl px-3 py-2.5 text-[12.5px]"
						loading={executing}
						disabled={!activeFile || regenerating}
						onClick={() => activeFile && downloadFile(activeFile.uri)}
					/>
				</div>
			</div>
		</div>
	)
}

export default PostDetailInfo
