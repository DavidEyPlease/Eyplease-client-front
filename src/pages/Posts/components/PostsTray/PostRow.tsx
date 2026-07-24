import { Checkbox } from '@/components/ui/checkbox'
import { IPost } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/dates'
import { CheckIcon, ImageIcon, VideoIcon } from 'lucide-react'
import { canSelectPost, getPostDate, getPostMedia, isPostRegenerating, isPostSent } from '../../lib'

interface Props {
	post: IPost
	active: boolean
	selected: boolean
	onSelect: (postId: string) => void
	onToggleSelected: (postId: string) => void
}

const PostRow = ({ post, active, selected, onSelect, onToggleSelected }: Props) => {
	const media = getPostMedia(post)
	const sent = isPostSent(post)
	const regenerating = isPostRegenerating(post)

	return (
		<li
			className={cn(
				'relative flex items-center gap-3 border-b px-4 transition-colors last:border-b-0 hover:bg-surface-soft',
				active && 'bg-primary/6 hover:bg-primary/6',
			)}
		>
			{active && <span className="absolute inset-y-0 left-0 w-0.75 bg-primary-gradient" />}

			<Checkbox
				checked={selected}
				disabled={!canSelectPost(post)}
				aria-label={`Seleccionar ${post.title}`}
				className="shrink-0"
				onCheckedChange={() => onToggleSelected(post.id)}
			/>

			<button
				type="button"
				aria-current={active || undefined}
				onClick={() => onSelect(post.id)}
				className="flex flex-1 cursor-pointer items-center gap-3 py-2.5 text-left focus-visible:outline-none"
			>
				<span className="h-13.25 w-10.5 shrink-0 overflow-hidden rounded-[9px] border bg-surface-soft">
					{media.image ? (
						<img src={media.image.url} alt="" loading="lazy" className="size-full object-cover" />
					) : (
						<span className="grid size-full place-content-center text-muted-foreground">
							<VideoIcon className="size-4" />
						</span>
					)}
				</span>

				<span className="flex min-w-0 flex-1 flex-col gap-0.5">
					<span className="truncate text-sm font-semibold tracking-tight">{post.title}</span>
					<span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
						{formatDate(getPostDate(post), { formatter: { date: 'medium' }, dateOnly: true })}
						<span className="flex items-center gap-1.5 text-muted-foreground/60">
							{media.image && <ImageIcon className="size-4" />}
							{media.video && <VideoIcon className="size-4" />}
						</span>
					</span>
				</span>

				{regenerating ? (
					<span className="grid size-5.5 shrink-0 place-content-center rounded-full bg-primary/10">
						<span className="size-3.5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
					</span>
				) : sent ? (
					<span className="grid size-5.5 shrink-0 place-content-center rounded-full bg-green-50 text-green-600">
						<CheckIcon className="size-3" />
					</span>
				) : (
					<span className="size-2.5 shrink-0 rounded-full bg-primary-soft" />
				)}
			</button>
		</li>
	)
}

export default PostRow
