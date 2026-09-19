import { useMemo } from 'react'

import { API_ROUTES } from '@/constants/api'
import useFetchQuery from '@/hooks/useFetchQuery'
import { MainPostSectionTypes } from '@/interfaces/posts'
import usePostSections from '@/pages/Posts/hooks/usePostSections'
import { queryKeys } from '@/utils/cache'

interface SectionStats {
	section_key: string
	posts_count: number
	posts_sent_count: number
	posts_live_today_count?: number
	/** Nunca ha enviado nada de esta sección, mirando toda su historia y no solo el mes. */
	never_sent?: boolean
}

export interface Cobertura {
	people_count: number
	people_reached: number
	percent: number
}

/**
 * La escalera, en el idioma que ya hablan: Mary Kay vive de escalones.
 *
 * El primero va en 25% a proposito. La mediana de cobertura en septiembre de 2026 fue del
 * 10%, asi que un primer escalon alto dejaria a casi todas fuera el primer mes y el marcador
 * nace muerto.
 */
export const ESCALONES = [
	{ pct: 25, nombre: 'Constante' },
	{ pct: 50, nombre: 'Cercana' },
	{ pct: 75, nombre: 'Presente' },
	{ pct: 100, nombre: 'Unidad completa' },
]

export interface Pendiente {
	key: string
	label: string
	pendientes: number
	hoy: number
	/** No ha enviado NUNCA de esta sección: es donde está el hueco grande. */
	virgen: boolean
}

/**
 * Los datos del seguimiento de unidad: qué le falta por mandar, por sección, y a cuántas
 * personas ha llegado este mes. Los comparten la tarjeta del Inicio de siempre y el Hoy nuevo.
 */
const useUnitFollowUp = () => {
	const { sections } = usePostSections(MainPostSectionTypes.UNITY)

	const sectionKeys = useMemo(() => sections.map(section => section.key.toString()), [sections])

	const { response, loading } = useFetchQuery<SectionStats[]>(API_ROUTES.POSTS.STATS_MONTH, {
		customQueryKey: queryKeys.list('posts-stats-followup', { sections: sectionKeys.join(',') }),
		enabled: !!sectionKeys.length,
		staleTime: 60_000,
		refetchOnWindowFocus: true,
		queryParams: {
			sections: sectionKeys.join(','),
			post_type: MainPostSectionTypes.UNITY,
		},
	})

	const { response: coberturaResp } = useFetchQuery<Cobertura>(API_ROUTES.POSTS.COVERAGE, {
		customQueryKey: queryKeys.detail('posts-coverage', MainPostSectionTypes.UNITY),
		enabled: !!sectionKeys.length,
		staleTime: 60_000,
		refetchOnWindowFocus: true,
		queryParams: { post_type: MainPostSectionTypes.UNITY },
	})

	const { pendientes, enviadas } = useMemo(() => {
		const stats = response?.data ?? []
		const etiquetas = new Map(sections.map(section => [section.key.toString(), section.label]))

		const filas: Pendiente[] = stats
			.map(stat => ({
				key: stat.section_key,
				label: etiquetas.get(stat.section_key) ?? stat.section_key,
				pendientes: Math.max(stat.posts_count - stat.posts_sent_count, 0),
				hoy: stat.posts_live_today_count ?? 0,
				virgen: stat.posts_sent_count === 0 && stat.posts_count > 0,
			}))
			.filter(fila => fila.pendientes > 0)
			/*
			 * El orden no es por volumen: primero lo que caduca —un cumpleaños mandado
			 * mañana no sirve—, después lo que nunca ha tocado, y al final lo demás por
			 * cuánto tiene esperando.
			 */
			.sort((a, b) =>
				(b.hoy > 0 ? 1 : 0) - (a.hoy > 0 ? 1 : 0)
				|| (b.virgen ? 1 : 0) - (a.virgen ? 1 : 0)
				|| b.pendientes - a.pendientes,
			)

		return {
			pendientes: filas,
			enviadas: stats.reduce((total, stat) => total + stat.posts_sent_count, 0),
		}
	}, [response, sections])

	return { loading, pendientes, enviadas, cobertura: coberturaResp?.data }
}

export default useUnitFollowUp
