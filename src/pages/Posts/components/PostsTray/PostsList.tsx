import Button from '@/components/common/Button'
import InfiniteScrollTrigger from '@/components/generics/InfiniteScrollTrigger'
import { Checkbox } from '@/components/ui/checkbox'
import { IPost } from '@/interfaces/posts'
import { CheckIcon } from 'lucide-react'
import { PostsSelection } from '../../hooks/usePostsSelection'
import PostRow from './PostRow'

interface Props {
	posts: IPost[]
	total: number
	sectionLabel: string
	selection: PostsSelection
	selectedId?: string
	hasNextPage?: boolean
	loadingMore: boolean
	onSelect: (postId: string) => void
	onLoadMore: () => void
}

const PostsList = ({ posts, total, sectionLabel, selection, selectedId, hasNextPage, loadingMore, onSelect, onLoadMore }: Props) => {
	const headerChecked = selection.allSelected || (selection.selectedCount > 0 && 'indeterminate')

	return (
		<div className="overflow-hidden rounded-[20px] border bg-card shadow-card">
			<header className="flex items-center gap-2.5 border-b bg-surface-soft px-4 py-3.5">
				<Checkbox
					checked={headerChecked}
					aria-label="Seleccionar todas las publicaciones"
					onCheckedChange={selection.toggleAll}
				/>
				<p className="text-[12.5px] font-bold text-muted-foreground">
					{total} {total === 1 ? 'publicación' : 'publicaciones'}
					{sectionLabel && ` · ${sectionLabel}`}
				</p>

				{selection.selectedCount > 0 && (
					<div className="ml-auto flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/8 py-1 pr-1.5 pl-3.5 text-xs font-bold text-primary">
						{selection.selectedCount} {selection.selectedCount === 1 ? 'seleccionada' : 'seleccionadas'}
						<Button
							text={
								<>
									<CheckIcon className="size-3.5" />
									Marcar enviadas
								</>
							}
							className="rounded-full px-3 py-1.5 text-[11.5px]"
							loading={selection.marking}
							onClick={selection.markSelected}
						/>
					</div>
				)}
			</header>

			<ul>
				{posts.map(post => (
					<PostRow
						key={post.id}
						post={post}
						active={post.id === selectedId}
						selected={selection.selectedIds.has(post.id)}
						onSelect={onSelect}
						onToggleSelected={selection.toggle}
					/>
				))}
			</ul>

			<InfiniteScrollTrigger
				hasNextPage={hasNextPage}
				loading={loadingMore}
				onLoadMore={onLoadMore}
			/>
		</div>
	)
}

export default PostsList
