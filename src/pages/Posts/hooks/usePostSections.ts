import { useMemo } from 'react'

import { PermissionKeys } from '@/interfaces/permissions'
import { MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import useAuthStore from '@/store/auth'

const MAIN_POST_SECTION_KEYS = [
	PermissionKeys.POSTS_UNITY,
	PermissionKeys.POSTS_DIRECTORS,
	PermissionKeys.POSTS_CLIENTS,
]

/** Sección preferida de cada pestaña; solo se usa si el plan la incluye. */
const PREFERRED_SECTION = {
	[MainPostSectionTypes.CLIENTS]: PostSectionTypes.CUSTOMER_BIRTHDAYS,
	[MainPostSectionTypes.DIRECTORS]: PostSectionTypes.NATIONAL_BIRTHDAYS,
	[MainPostSectionTypes.UNITY]: PostSectionTypes.BIRTHDAYS,
}

/** Secciones de publicaciones habilitadas por el plan: pestañas principales y sus filtros. */
const usePostSections = (mainSection: MainPostSectionTypes) => {
	const { user } = useAuthStore(state => state)

	const accesses = useMemo(() => user?.plan.accesses || [], [user])

	const mainSections = useMemo(
		() => accesses.filter(access =>
			!!access.is_submodule
			&& access.parent_module_key === PermissionKeys.POSTS
			&& MAIN_POST_SECTION_KEYS.includes(access.permission_key),
		),
		[accesses],
	)

	const sectionsOf = useMemo(
		() => (target: MainPostSectionTypes) =>
			mainSections.find(access => access.permission_key.toString() === target.toString())?.custom_permissions || [],
		[mainSections],
	)

	const sections = useMemo(() => sectionsOf(mainSection), [sectionsOf, mainSection])

	/** Primer filtro con el que abrir una pestaña: la sección preferida si el plan la trae, si no la primera disponible. */
	const getDefaultSection = useMemo(
		() => (target: MainPostSectionTypes): PostSectionTypes => {
			const available = sectionsOf(target)
			const preferred = PREFERRED_SECTION[target]
			const hasPreferred = available.some(section => section.key.toString() === preferred.toString())

			if (hasPreferred || !available.length) return preferred
			return available[0].key.toString() as PostSectionTypes
		},
		[sectionsOf],
	)

	return { mainSections, sections, getDefaultSection }
}

export default usePostSections
