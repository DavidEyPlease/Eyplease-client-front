import { MAP_MAIN_POSTS_SECTIONS } from '@/constants/app'
import { MainPostSectionTypes } from '@/interfaces/posts'
import PageHead from '@/layouts/TopShell/PageHead'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import PostsStats from './Stats'
import { useCompany } from '@/utils/company'

interface Props {
	mainSection: MainPostSectionTypes
}

const PostsHeader = ({ mainSection }: Props) => {
	const { can, t } = useCompany()
	/* La sección de su gente con el nombre que le da su empresa («Grupo» en Zermat) */
	const sectionName = mainSection === MainPostSectionTypes.UNITY
		? t('group').charAt(0).toUpperCase() + t('group').slice(1)
		: MAP_MAIN_POSTS_SECTIONS[mainSection]
	if (isNewShell()) {
		return (
			<PageHead
				eyebrow="Mi negocio"
				title={<>Publicaciones · <em>{sectionName}</em></>}
				sub={can('regenerate') ? 'Todas las piezas del mes, sección por sección: revisa, vuelve a generar y marca las que ya enviaste.' : 'Todas las piezas del mes, sección por sección: revisa, descarga y marca las que ya enviaste.'}
			>
				<PostsStats />
			</PageHead>
		)
	}

	return (
		<header className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border bg-card bg-hero-glow px-5.5 py-5 shadow-card">
			<div>
				<h1 className="text-[19px] font-extrabold tracking-tight">
					Seguimiento de {sectionName}
				</h1>
				<p className="mt-0.5 text-[13.5px] font-medium text-muted-foreground">
					Revisa, regenera y marca como enviadas las publicaciones del mes.
				</p>
			</div>
			<PostsStats />
		</header>
	)
}

export default PostsHeader
