import DynamicTabs from '@/components/generics/DynamicTabs'
import FilterChip from '@/components/generics/FilterChip'
import { IconBySection } from '@/components/generics/IconBySection'
import useAuth from '@/hooks/useAuth'
import { MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import usePostSections from '../hooks/usePostSections'

interface Props {
	mainSection: MainPostSectionTypes
	activeSection: PostSectionTypes
	setMainSection: (key: MainPostSectionTypes) => void
	setPostSection: (key: PostSectionTypes) => void
}

const FilterPosts = ({ mainSection, activeSection, setMainSection, setPostSection }: Props) => {
	const { hasAccess } = useAuth()
	const { mainSections, sections } = usePostSections(mainSection)

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
						active={section.key.toString() === activeSection.toString()}
						onClick={() => setPostSection(section.key.toString() as PostSectionTypes)}
					/>
				))}
			</div>
		</div>
	)
}

export default FilterPosts
