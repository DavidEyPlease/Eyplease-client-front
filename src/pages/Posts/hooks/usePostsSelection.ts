import { useMemo, useState } from 'react'

import { IPost } from '@/interfaces/posts'
import { canSelectPost } from '../lib'
import usePostActions from './usePostActions'

export interface PostsSelection {
	selectedIds: ReadonlySet<string>
	selectedCount: number
	allSelected: boolean
	marking: boolean
	toggle: (postId: string) => void
	toggleAll: () => void
	markSelected: () => void
}

/**
 * Selección múltiple de la bandeja para marcar varias publicaciones como enviadas.
 * La selección se cruza siempre con lo que sigue siendo seleccionable, así una publicación
 * que se marca por su cuenta desde el detalle sale sola de la selección.
 */
const usePostsSelection = (posts: IPost[]): PostsSelection => {
	const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(new Set())
	const { markingMany, markManyAsSent } = usePostActions()

	const selectableIds = useMemo(() => posts.filter(canSelectPost).map(post => post.id), [posts])

	const effectiveSelectedIds = useMemo(
		() => new Set(selectableIds.filter(postId => selectedIds.has(postId))),
		[selectableIds, selectedIds],
	)

	const allSelected = selectableIds.length > 0 && selectableIds.every(postId => effectiveSelectedIds.has(postId))

	const toggle = (postId: string) => {
		setSelectedIds(current => {
			const next = new Set(current)
			if (!next.delete(postId)) next.add(postId)
			return next
		})
	}

	const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(selectableIds))

	const markSelected = async () => {
		const failedIds = await markManyAsSent([...effectiveSelectedIds])
		setSelectedIds(new Set(failedIds))
	}

	return {
		selectedIds: effectiveSelectedIds,
		selectedCount: effectiveSelectedIds.size,
		allSelected,
		marking: markingMany,
		toggle,
		toggleAll,
		markSelected,
	}
}

export default usePostsSelection
