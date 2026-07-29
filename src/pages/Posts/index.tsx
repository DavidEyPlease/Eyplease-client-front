import { useEffect, useMemo, useState } from 'react'

import { API_ROUTES } from '@/constants/api'
import useInfiniteListQuery from '@/hooks/useInfiniteListQuery'
import { IPost, IPostsFilters, MainPostSectionTypes } from '@/interfaces/posts'
import { usePostsStore } from '@/store/posts'
import { isPostRegenerating } from './lib'
import FilterPosts from './components/FilterPosts'
import PostsHeader from './components/PostsHeader'
import PostsTray from './components/PostsTray'
import usePostSections from './hooks/usePostSections'

/** Ritmo del sondeo mientras haya regeneraciones: las imágenes salen rápido, los videos tardan mucho más. */
const REGENERATE_POLL_MS = 4000
const REGENERATE_VIDEO_POLL_MS = 25000

const PostsPage = () => {
	const { filters, setFilters, getListQueryKey, regeneratingArtifacts } = usePostsStore(state => state)
	const [pollInterval, setPollInterval] = useState<number | false>(false)

	const mainSection = filters.post_type as MainPostSectionTypes
	const { sections, getDefaultSection } = usePostSections(mainSection)

	// El filtro inicial del store es fijo: si el plan no incluye esa sección, se cae a la primera disponible.
	useEffect(() => {
		if (!sections.length) return
		if (sections.some(section => section.key.toString() === filters.section.toString())) return
		setFilters({ section: getDefaultSection(mainSection) })
	}, [sections, filters.section, mainSection, getDefaultSection, setFilters])

	const {
		data,
		isFetchingNextPage,
		isLoading,
		hasNextPage,
		fetchNextPage,
	} = useInfiniteListQuery<IPost, IPostsFilters>(
		API_ROUTES.POSTS.LIST,
		{
			queryParams: filters,
			customQueryKey: getListQueryKey(),
			enabled: true,
			staleTime: 5000,
			refetchInterval: pollInterval,
		},
	)

	const posts = useMemo(() => data?.pages.flatMap(page => page.items) ?? [], [data])
	const total = data?.pages[0]?.total_items ?? posts.length
	const sectionLabel = sections.find(section => section.key.toString() === filters.section.toString())?.label ?? ''

	// Mientras alguna publicación se esté regenerando, se sondea la lista para reflejar el artefacto nuevo.
	// El ritmo lo marca lo pendiente: si hay imágenes (o no se sabe qué es) manda el rápido; solo-videos, el lento.
	useEffect(() => {
		const regenerating = posts.filter(isPostRegenerating)
		if (!regenerating.length) {
			setPollInterval(false)
			return
		}
		const hasFastArtifact = regenerating.some(post => regeneratingArtifacts[post.id] !== 'video')
		setPollInterval(hasFastArtifact ? REGENERATE_POLL_MS : REGENERATE_VIDEO_POLL_MS)
	}, [posts, regeneratingArtifacts])

	return (
		<div className="flex flex-col gap-4">
			<PostsHeader mainSection={mainSection} />

			<PostsTray
				posts={posts}
				total={total}
				sectionLabel={sectionLabel}
				loading={isLoading}
				hasNextPage={hasNextPage}
				loadingMore={isFetchingNextPage}
				onLoadMore={fetchNextPage}
				filters={
					<FilterPosts
						mainSection={mainSection}
						activeSection={filters.section}
						setMainSection={section => setFilters({ post_type: section, section: getDefaultSection(section) })}
						setPostSection={section => setFilters({ section })}
					/>
				}
			/>
		</div>
	)
}

export default PostsPage
