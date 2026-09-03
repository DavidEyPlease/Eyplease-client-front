import { useEffect, useMemo, useState } from 'react'

import RestrictedSectionNotice from '@/components/billing/enforcement/RestrictedSectionNotice'
import { useBillingEnforcement } from '@/components/billing/enforcement/context'
import { API_ROUTES } from '@/constants/api'
import useInfiniteListQuery from '@/hooks/useInfiniteListQuery'
import { BillingRestrictedFeature } from '@/interfaces/billing'
import { IPost, IPostsFilters, MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import { usePostsStore } from '@/store/posts'
import { isPostRegenerating } from './lib'
import FilterPosts from './components/FilterPosts'
import PostsHeader from './components/PostsHeader'
import PostsTray from './components/PostsTray'
import usePostSections from './hooks/usePostSections'

/** Ritmo del sondeo mientras haya regeneraciones: las imágenes salen rápido, los videos tardan mucho más. */
const REGENERATE_POLL_MS = 4000
const REGENERATE_VIDEO_POLL_MS = 25000

/** Secciones que son publicaciones de cumpleaños: las que cierra la escalada por atraso. */
const BIRTHDAY_SECTIONS: string[] = [
	PostSectionTypes.BIRTHDAYS,
	PostSectionTypes.NATIONAL_BIRTHDAYS,
	PostSectionTypes.CUSTOMER_BIRTHDAYS,
]
const isBirthdaySection = (section: PostSectionTypes) => BIRTHDAY_SECTIONS.includes(section.toString())

const PostsPage = () => {
	const { filters, setFilters, getListQueryKey, regeneratingArtifacts } = usePostsStore(state => state)
	const [pollInterval, setPollInterval] = useState<number | false>(false)

	const mainSection = filters.post_type as MainPostSectionTypes
	const { sections, getDefaultSection } = usePostSections(mainSection)

	const { isFeatureRestricted, requestFeature } = useBillingEnforcement()
	/* Con cumpleaños cerrados no se pide la lista: la API respondería 403 igual */
	const birthdaysRestricted = isFeatureRestricted(BillingRestrictedFeature.BIRTHDAY_POSTS) && isBirthdaySection(filters.section)

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
			enabled: !birthdaysRestricted,
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

	/* Cambiar a una sección de cumpleaños pasa por la puerta: si está cerrada, abre el aviso y no navega */
	const onSelectSection = (section: PostSectionTypes) => {
		if (isBirthdaySection(section) && !requestFeature(BillingRestrictedFeature.BIRTHDAY_POSTS)) return
		setFilters({ section })
	}

	const filterPosts = (
		<FilterPosts
			mainSection={mainSection}
			activeSection={filters.section}
			setMainSection={section => setFilters({ post_type: section, section: getDefaultSection(section) })}
			setPostSection={onSelectSection}
		/>
	)

	if (birthdaysRestricted) {
		return (
			<div className="flex flex-col gap-4">
				<PostsHeader mainSection={mainSection} />
				{filterPosts}
				<RestrictedSectionNotice feature={BillingRestrictedFeature.BIRTHDAY_POSTS} />
			</div>
		)
	}

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
				filters={filterPosts}
			/>
		</div>
	)
}

export default PostsPage
