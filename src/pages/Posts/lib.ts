import { NewsletterSectionKeys } from '@/interfaces/common'
import { ARTIFACT_TYPES, EypleaseFile, artifactOf } from '@/interfaces/files'
import { IPost, PostArtifactType, PostTypes } from '@/interfaces/posts'
import { RectangleVerticalIcon, SquareIcon, VideoIcon } from 'lucide-react'

export const POST_MEDIA_TYPES = ARTIFACT_TYPES

export type PostMediaType = PostArtifactType

/** Orden en que se ofrecen los formatos: la vertical primero, que es la que más se publica. */
export const MEDIA_TYPE_ORDER: PostMediaType[] = [
	POST_MEDIA_TYPES.IMAGE,
	POST_MEDIA_TYPES.IMAGE_SQUARE,
	POST_MEDIA_TYPES.VIDEO,
]

export const MEDIA_TYPE_LABELS: Record<PostMediaType, string> = {
	[POST_MEDIA_TYPES.IMAGE]: 'Vertical',
	[POST_MEDIA_TYPES.IMAGE_SQUARE]: 'Cuadrada',
	[POST_MEDIA_TYPES.VIDEO]: 'Video',
}

/** El icono dice la forma del artefacto: la etiqueta y el dibujo cuentan lo mismo. */
export const MEDIA_TYPE_ICONS = {
	[POST_MEDIA_TYPES.IMAGE]: RectangleVerticalIcon,
	[POST_MEDIA_TYPES.IMAGE_SQUARE]: SquareIcon,
	[POST_MEDIA_TYPES.VIDEO]: VideoIcon,
}

export interface PostMedia {
	image?: EypleaseFile
	imageSquare?: EypleaseFile
	video?: EypleaseFile
}

/**
 * Archivos de la publicación separados por ARTEFACTO, no por extensión.
 *
 * Separar por extensión funcionó mientras sólo había dos: uno acababa en .jpeg y el otro en
 * .mp4. Con la imagen cuadrada hay DOS archivos con la misma extensión, así que un `find`
 * por extensión se queda con el primero y el otro no se ve nunca.
 */
export const getPostMedia = (post: IPost): PostMedia => {
	const de = (artifact: PostMediaType) => post.files.find(file => artifactOf(file) === artifact)
	return {
		image: de(POST_MEDIA_TYPES.IMAGE),
		imageSquare: de(POST_MEDIA_TYPES.IMAGE_SQUARE),
		video: de(POST_MEDIA_TYPES.VIDEO),
	}
}

export const getPostMediaFile = (media: PostMedia, type: PostMediaType): EypleaseFile | undefined => {
	if (type === POST_MEDIA_TYPES.VIDEO) return media.video
	if (type === POST_MEDIA_TYPES.IMAGE_SQUARE) return media.imageSquare
	return media.image
}

/** Los formatos que la publicación tiene de verdad: una pestaña que lleva a un hueco no se ofrece. */
export const getAvailableMediaTypes = (media: PostMedia): PostMediaType[] =>
	MEDIA_TYPE_ORDER.filter(type => !!getPostMediaFile(media, type))

/** Con un solo formato se nombra; con varios el conmutador ya dice cuáles, aquí basta cuántos. */
export const getPostMediaLabel = (media: PostMedia): string | null => {
	const types = getAvailableMediaTypes(media)
	if (!types.length) return null
	return types.length === 1 ? MEDIA_TYPE_LABELS[types[0]] : `${types.length} formatos`
}

/** Tipo de media que se muestra al abrir: la vertical manda salvo que la publicación no la tenga. */
export const getDefaultMediaType = (media: PostMedia): PostMediaType =>
	getAvailableMediaTypes(media)[0] ?? POST_MEDIA_TYPES.IMAGE

/** Las publicaciones de la sección "early" se fechan por metadata, no por created_at. */
export const getPostDate = (post: IPost): Date | string =>
	post.newsletter_section?.sectionKey === NewsletterSectionKeys.EARLY && post.metadata
		? post.metadata
		: post.created_at

export const isPostSent = (post: IPost): boolean => !!post.shared_at

/**
 * Pieza que celebra algo que ACABA de pasar, no el cierre del mes.
 *
 * Viene marcada desde la API: deducirlo de `created_at` no sirve porque el día
 * que corre el lote mensual todas sus piezas son de hoy.
 */
export const isPostLive = (post: IPost): boolean => !!post.live_event_at

/** Pasó hoy — es lo que justifica el aviso, no solo que sea reciente. */
export const isLiveToday = (post: IPost): boolean => {
	if (!post.live_event_at) return false

	const event = new Date(post.live_event_at)
	if (Number.isNaN(event.getTime())) return false

	const today = new Date()
	return (
		event.getFullYear() === today.getFullYear() &&
		event.getMonth() === today.getMonth() &&
		event.getDate() === today.getDate()
	)
}

export const isPostRegenerating = (post: IPost): boolean => !!post.is_regenerating

/** Las publicaciones de clientes de eyplease no las envía el usuario, no se marcan. */
export const canMarkPostAsSent = (post: IPost): boolean => post.type !== PostTypes.EYPLEASE_CLIENTS

/** Solo entra en la selección múltiple lo que aún se puede marcar como enviado y no está regenerándose. */
export const canSelectPost = (post: IPost): boolean =>
	canMarkPostAsSent(post) && !isPostSent(post) && !isPostRegenerating(post)
