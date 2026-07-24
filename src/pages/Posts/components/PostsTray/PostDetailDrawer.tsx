import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'
import { IPost } from '@/interfaces/posts'
import { XIcon } from 'lucide-react'
import { isPostRegenerating, PostMedia as PostMediaFiles, PostMediaType } from '../../lib'
import MediaTypeSwitch from './MediaTypeSwitch'
import PostDetailInfo from './PostDetailInfo'
import PostMedia from './PostMedia'

interface Props {
	post: IPost
	media: PostMediaFiles
	mediaType: PostMediaType
	open: boolean
	showMediaSwitch: boolean
	onMediaTypeChange: (value: PostMediaType) => void
	onOpenChange: (open: boolean) => void
}

/** Vista ampliada de la publicación: la pieza completa sin recortar, con scroll propio. */
const PostDetailDrawer = ({ post, media, mediaType, open, showMediaSwitch, onMediaTypeChange, onOpenChange }: Props) => {
	return (
		<Drawer direction="right" open={open} onOpenChange={onOpenChange}>
			<DrawerContent className="w-full">
				<DrawerHeader className="flex flex-row items-center justify-between gap-2 border-b p-3.5">
					<DrawerTitle className="sr-only">{post.title}</DrawerTitle>
					{showMediaSwitch ? (
						<MediaTypeSwitch value={mediaType} onChange={onMediaTypeChange} />
					) : (
						<span className="truncate text-sm font-bold tracking-tight">{post.title}</span>
					)}
					<DrawerClose asChild>
						<Button variant="ghost" size="icon-sm" className="shrink-0 text-muted-foreground" aria-label="Cerrar">
							<XIcon />
						</Button>
					</DrawerClose>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto">
					<PostMedia post={post} media={media} mediaType={mediaType} fit="contain" regenerating={isPostRegenerating(post)} />
					<PostDetailInfo post={post} media={media} mediaType={mediaType} />
				</div>
			</DrawerContent>
		</Drawer>
	)
}

export default PostDetailDrawer
