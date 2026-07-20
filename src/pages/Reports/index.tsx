import { useState } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import useAuthStore from "@/store/auth"
import useFetchQuery from "@/hooks/useFetchQuery"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/app"
import { queryKeys } from "@/utils/cache"
import { publishEvent } from "@/utils/events"
import { reportMonthLabel } from "@/utils/dates"
import { IReportUpload } from "@/interfaces/reportUpload"
import { NewsletterSection } from "@/interfaces/common"
import PageLoader from "@/components/generics/PageLoader"
import FeedbackUploadReport from "./components/FeedbackUploadReport"
import ReportsProgressCard from "./components/ReportsProgressCard"
import NewsletterReportPanel from "./components/NewsletterReportPanel"
import {
	ConflictHeadingsError,
	ConflictUsersError,
	hasConflictHeadingsStructure,
	hasConflictUsersStructure,
	summarizeReports,
} from "./lib"

/**
 * Página de carga de reportes: cada boletín es un panel con su propio progreso y sus
 * secciones importables. Subir un .xlsx corre en segundo plano; el resultado se refleja
 * al invalidar la query de uploads. Los conflictos se muestran en el modal de feedback.
 */
const ReportsPage = () => {
	const [uploadError, setUploadError] = useState<ConflictUsersError | ConflictHeadingsError | null>(null)

	const { utilData } = useAuthStore(state => state)

	const { response, loading } = useFetchQuery<IReportUpload[]>(API_ROUTES.REPORTS.LIST_UPLOADS, {
		customQueryKey: queryKeys.list('report-uploads'),
		enabled: !!utilData.newsletters.length,
	})

	const { request, requestState } = useRequestQuery({
		invalidateQueries: [queryKeys.list('report-uploads')],
		onSuccess: () => {
			setUploadError(null)
			toast.success('Reporte cargado correctamente')
			publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
		},
		onError: (e) => {
			publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
			if (hasConflictUsersStructure(e) || hasConflictHeadingsStructure(e)) {
				setUploadError(e)
			}
		}
	})

	const onUploadReport = async (file: File, reportSection: NewsletterSection) => {
		if (!file || !reportSection) {
			return
		}

		const formData = new FormData()
		formData.append('newsletter_section_id', reportSection.id)
		formData.append('file', file)

		await request('POST', API_ROUTES.REPORTS.UPLOAD, formData)
	}

	const reports = response?.data || []
	const summary = summarizeReports(utilData.newsletters, reports)

	return (
		<div className="mx-auto w-full max-w-6xl">
			<header className="mb-6 flex flex-wrap items-center justify-between gap-4">
				<div className="flex items-center gap-3.5">
					<span className="grid size-11 shrink-0 place-content-center rounded-[13px] bg-gradient-to-br from-[#6B4FE3] to-[#4E31C0] text-white shadow-[0_10px_24px_-8px_rgba(78,49,192,0.55)]">
						<Upload className="size-[22px]" />
					</span>
					<div>
						<h1 className="text-xl font-bold tracking-tight sm:text-[21px]">Carga de reportes</h1>
						<p className="text-sm font-medium text-muted-foreground">
							Sube el .xlsx de cada sección para armar los boletines del mes.
						</p>
					</div>
				</div>
				<span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-[13px] font-semibold text-primary">
					{reportMonthLabel()}
				</span>
			</header>

			{loading ? (
				<div className="relative grid min-h-64 place-content-center">
					<PageLoader />
				</div>
			) : (
				<div className="flex flex-col gap-5">
					<ReportsProgressCard {...summary} />
					<div className="grid gap-5 lg:grid-cols-2">
						{utilData.newsletters.map(newsletter => (
							<NewsletterReportPanel
								key={newsletter.id}
								newsletter={newsletter}
								reports={reports}
								onUploadReport={onUploadReport}
							/>
						))}
					</div>
				</div>
			)}

			<FeedbackUploadReport
				loading={requestState.loading}
				open={!!uploadError || requestState.loading}
				uploadError={uploadError}
				onClose={() => setUploadError(null)}
			/>
		</div>
	)
}

export default ReportsPage
