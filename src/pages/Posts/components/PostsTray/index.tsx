import { useRef, useState } from 'react'

import { EmptySection } from '@/components/generics/EmptySection'
import PageLoader from '@/components/generics/PageLoader'
import { IconPosts } from '@/components/Svg/IconPosts'
import { IPost } from '@/interfaces/posts'
import { cn } from '@/lib/utils'
import usePostsSelection from '../../hooks/usePostsSelection'
import PostDetail from './PostDetail'
import PostsList from './PostsList'

/** Punto en el que la bandeja pasa a dos columnas (lg de Tailwind). */
const TWO_COLUMN_QUERY = '(min-width: 1024px)'

interface Props {
	posts: IPost[]
	total: number
	sectionLabel: string
	loading: boolean
	filters: React.ReactNode
	hasNextPage?: boolean
	loadingMore: boolean
	onLoadMore: () => void
}

/**
 * Área de trabajo de publicaciones: filtros y lista en la columna izquierda, previsualización
 * fija en la derecha. La fila activa se resuelve contra la lista actual, así al cambiar de
 * filtro cae sola en la primera.
 */
const PostsTray = ({ posts, total, sectionLabel, loading, filters, hasNextPage, loadingMore, onLoadMore }: Props) => {
	const [selectedId, setSelectedId] = useState<string>()
	const detailRef = useRef<HTMLElement>(null)
	const selection = usePostsSelection(posts)

	const selectedPost = posts.find(post => post.id === selectedId) ?? posts[0]
	const showDetail = !loading && !!selectedPost
	// Se mantienen las dos columnas mientras carga para que los filtros no cambien de ancho al llegar los datos
	const twoColumns = loading || posts.length > 0

	// En una sola columna la previsualización queda debajo de la lista: hay que llevar la vista hasta ella.
	const handleSelect = (postId: string) => {
		setSelectedId(postId)
		if (window.matchMedia(TWO_COLUMN_QUERY).matches) return
		detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
	}

	return (
		<div className={cn('grid items-start gap-4', twoColumns && 'lg:grid-cols-[minmax(0,1fr)_400px]')}>
			<div className="flex min-w-0 flex-col gap-4">
				{filters}

				{loading && (
					<div className="relative grid min-h-64 place-content-center">
						<PageLoader />
					</div>
				)}

				{!loading && posts.length === 0 && (
					<EmptySection
						title="No hay resultados"
						description="Intenta ajustar los filtros o buscar con otras palabras clave."
						media={<IconPosts />}
					/>
				)}

				{!loading && posts.length > 0 && (
					<PostsList
						posts={posts}
						total={total}
						sectionLabel={sectionLabel}
						selection={selection}
						selectedId={selectedPost?.id}
						hasNextPage={hasNextPage}
						loadingMore={loadingMore}
						onSelect={handleSelect}
						onLoadMore={onLoadMore}
					/>
				)}
			</div>

			{/* El envoltorio se estira a la altura de la fila: es lo que le da recorrido al sticky del detalle */}
			{showDetail && (
				<div className="lg:self-stretch">
					<PostDetail key={selectedPost.id} ref={detailRef} post={selectedPost} />
				</div>
			)}
		</div>
	)
}

export default PostsTray
