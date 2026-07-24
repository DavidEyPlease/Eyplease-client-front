import { NewsletterSectionKeys } from '@/interfaces/common'
import { EypleaseFile } from '@/interfaces/files'
import { IPost, PostTypes } from '@/interfaces/posts'

const VIDEO_EXTS = ['mp4']
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'webp']

export const POST_MEDIA_TYPES = {
	IMAGE: 'image',
	VIDEO: 'video',
} as const

export type PostMediaType = (typeof POST_MEDIA_TYPES)[keyof typeof POST_MEDIA_TYPES]

export interface PostMedia {
	image?: EypleaseFile
	video?: EypleaseFile
}

/** Archivos de la publicación separados por tipo: la imagen es la miniatura por defecto. */
export const getPostMedia = (post: IPost): PostMedia => ({
	image: post.files.find(file => IMAGE_EXTS.includes(file.ext)),
	video: post.files.find(file => VIDEO_EXTS.includes(file.ext)),
})

export const getPostMediaLabel = ({ image, video }: PostMedia): string | null => {
	if (image && video) return 'Imagen + video'
	if (video) return 'Video'
	if (image) return 'Imagen'
	return null
}

export const getPostMediaFile = (media: PostMedia, type: PostMediaType): EypleaseFile | undefined =>
	type === POST_MEDIA_TYPES.VIDEO ? media.video : media.image

/** Tipo de media que se muestra al abrir: la imagen manda salvo que la publicación sea solo video. */
export const getDefaultMediaType = (media: PostMedia): PostMediaType =>
	media.image ? POST_MEDIA_TYPES.IMAGE : POST_MEDIA_TYPES.VIDEO

/** Las publicaciones de la sección "early" se fechan por metadata, no por created_at. */
export const getPostDate = (post: IPost): Date | string =>
	post.newsletter_section?.sectionKey === NewsletterSectionKeys.EARLY && post.metadata
		? post.metadata
		: post.created_at

export const isPostSent = (post: IPost): boolean => !!post.shared_at

export const isPostRegenerating = (post: IPost): boolean => !!post.is_regenerating

/** Las publicaciones de clientes de eyplease no las envía el usuario, no se marcan. */
export const canMarkPostAsSent = (post: IPost): boolean => post.type !== PostTypes.EYPLEASE_CLIENTS

/** Solo entra en la selección múltiple lo que aún se puede marcar como enviado y no está regenerándose. */
export const canSelectPost = (post: IPost): boolean =>
	canMarkPostAsSent(post) && !isPostSent(post) && !isPostRegenerating(post)
