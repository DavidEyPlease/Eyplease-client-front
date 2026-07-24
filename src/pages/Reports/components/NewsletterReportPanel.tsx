import { Progress } from "@/components/ui/progress"
import { Newsletter, NewsletterSection } from "@/interfaces/common"
import { IReportUpload } from "@/interfaces/reportUpload"
import ReportItem from "./ReportItem"
import { countCompletedReports, getImportableSections, NEWSLETTER_TAG, progressPercent, resolveSectionReport } from "../lib"

interface Props {
	newsletter: Newsletter
	reports: IReportUpload[]
	onUploadReport: (file: File, reportSection: NewsletterSection) => void
}

/** Panel de un boletín: progreso propio (cargados/total) y sus secciones importables. */
const NewsletterReportPanel = ({ newsletter, reports, onUploadReport }: Props) => {
	const sections = getImportableSections(newsletter)
	const total = sections.length
	const completed = countCompletedReports(sections, reports)
	const percent = progressPercent(completed, total)

	return (
		<div className="overflow-hidden rounded-3xl border bg-card shadow-card">
			<div className="border-b bg-hero-glow px-5.5 py-5">
				<div className="mb-3.5 flex items-center justify-between gap-3">
					<div className="flex items-center gap-2.5">
						<span className="rounded-md border border-primary/15 bg-primary/[0.08] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary">
							{NEWSLETTER_TAG[newsletter.code]}
						</span>
						<h2 className="text-[16.5px] font-bold tracking-tight">{newsletter.name}</h2>
					</div>
					<span className="text-[13px] font-bold">
						<span className="text-primary">{completed}</span>/{total}
					</span>
				</div>
				<Progress
					value={percent}
					className="h-1.5 bg-primary-soft"
					indicatorClassName="bg-primary-gradient-r"
				/>
			</div>

			<div className="flex flex-col">
				{sections.map(section => (
					<ReportItem
						key={section.id}
						section={section}
						resolved={resolveSectionReport(reports, section.id)}
						onUploadReport={onUploadReport}
					/>
				))}
			</div>
		</div>
	)
}

export default NewsletterReportPanel
