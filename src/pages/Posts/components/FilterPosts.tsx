import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { queryKeys } from '@/utils/cache'
import DynamicTabs from '@/components/generics/DynamicTabs'
import FilterChip from '@/components/generics/FilterChip'
import { IconBySection } from '@/components/generics/IconBySection'
import useAuth from '@/hooks/useAuth'
import { MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import usePostSections from '../hooks/usePostSections'

interface SectionStats {
	section_key: string
	posts_live_today_count?: number
}

interface Props {
	mainSection: MainPostSectionTypes
	activeSection: PostSectionTypes
	setMainSection: (key: MainPostSectionTypes) => void
	setPostSection: (key: PostSectionTypes) => void
}

const FilterPosts = ({ mainSection, activeSection, setMainSection, setPostSection }: Props) => {
	const { hasAccess } = useAuth()
	const { mainSections, sections } = usePostSections(mainSection)

	/*
	 * Los contadores de TODAS las secciones, no solo la abierta: la clienta entra
	 * en Cumpleaños y si la novedad está en Estrellas no tiene cómo enterarse
	 * salvo que el chip se lo diga.
	 */
	const sectionKeys = sections.map(section => section.key.toString())

	const { response } = useFetchQuery<SectionStats[]>(API_ROUTES.POSTS.STATS_MONTH, {
		customQueryKey: queryKeys.list('posts-stats-live', { mainSection, sections: sectionKeys.join(',') }),
		enabled: !!sectionKeys.length,
		// Sin sondeo: el aviso es lo que la trae a la app, y al volver a la
		// pestaña el contador se refresca solo. Sondear cada minuto sería una
		// consulta por clienta abierta para un número que casi nunca cambia.
		staleTime: 60_000,
		refetchOnWindowFocus: true,
		queryParams: {
			sections: sectionKeys.join(','),
			post_type: mainSection,
		},
	})

	const liveBySection = new Map(
		(response?.data ?? []).map(stat => [stat.section_key, stat.posts_live_today_count ?? 0]),
	)

	return (
		<div className="flex flex-col gap-3">
			<DynamicTabs
				items={mainSections.map(section => ({
					value: section.permission_key,
					label: section.name,
					disabled: !hasAccess(section.permission_key),
					icon: <IconBySection sectionKey={section.permission_key} />,
				}))}
				value={mainSection.toString()}
				onValueChange={value => setMainSection(value as MainPostSectionTypes)}
			/>

			<div className="flex flex-wrap gap-2">
				{sections.map(section => (
					<FilterChip
						key={section.key}
						label={section.label}
						icon={<IconBySection sectionKey={section.key} />}
						badge={liveBySection.get(section.key.toString())}
						active={section.key.toString() === activeSection.toString()}
						onClick={() => setPostSection(section.key.toString() as PostSectionTypes)}
					/>
				))}
			</div>
		</div>
	)
}

export default FilterPosts
