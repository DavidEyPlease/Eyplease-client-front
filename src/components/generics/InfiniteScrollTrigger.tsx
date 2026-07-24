import { useEffect, useRef } from 'react'

import Spinner from '@/components/common/Spinner'
import { cn } from '@/lib/utils'

/** Margen de anticipación: la carga arranca antes de que el centinela sea visible. */
const ROOT_MARGIN = '250px'

interface Props {
	hasNextPage?: boolean
	loading?: boolean
	className?: string
	onLoadMore: () => void
}

/**
 * Centinela de scroll infinito: pide la siguiente página al acercarse al final de la lista.
 * El centinela se monta siempre para que el observer no dependa de un nodo que aparece y
 * desaparece; el observer se recrea al terminar cada carga para encadenar páginas si sigue visible.
 */
const InfiniteScrollTrigger = ({ hasNextPage, loading, className, onLoadMore }: Props) => {
	const sentinelRef = useRef<HTMLDivElement>(null)
	const loadMoreRef = useRef(onLoadMore)
	const canLoadRef = useRef(false)

	loadMoreRef.current = onLoadMore
	canLoadRef.current = !!hasNextPage && !loading

	useEffect(() => {
		const sentinel = sentinelRef.current
		if (!sentinel) return

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting && canLoadRef.current) loadMoreRef.current()
			},
			{ rootMargin: ROOT_MARGIN },
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [hasNextPage, loading])

	return (
		<div ref={sentinelRef} className={cn('flex justify-center', hasNextPage ? 'py-4' : 'h-0', className)}>
			{hasNextPage && loading && <Spinner size="xs" color="primary" />}
		</div>
	)
}

export default InfiniteScrollTrigger
