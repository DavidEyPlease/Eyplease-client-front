import { Clock, RefreshCw, Upload } from "lucide-react"
import FileSelector from "@/components/generics/FileSelector"
import Button from "@/components/common/Button"
import { NewsletterSection } from "@/interfaces/common"
import { IReportUpload } from "@/interfaces/reportUpload"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/dates"
import { getSectionReportMonth, REPORT_STATUS_META, ReportStatus, ResolvedSectionReport } from "../lib"

interface ReportItemProps {
	section: NewsletterSection
	resolved: ResolvedSectionReport
	onUploadReport: (file: File, reportSection: NewsletterSection) => void
}

/** Acción de la derecha según el estado (todas disparan el selector al burbujear el click). */
const ReportItemAction = ({ status, report }: { status: ReportStatus; report: IReportUpload | null }) => {
	if (status === 'completed') {
		return (
			<div className="flex shrink-0 items-center gap-3">
				<span className="hidden items-center gap-1.5 whitespace-nowrap text-xs font-medium text-muted-foreground sm:inline-flex">
					<Clock className="size-3.5" />
					{report && formatDate(report.created_at)}
				</span>
				<span className="grid size-9 place-content-center rounded-full bg-[#eceaf4] text-primary transition-colors group-hover:bg-primary group-hover:text-white">
					<RefreshCw className="size-4" />
				</span>
			</div>
		)
	}

	if (status === 'failed') {
		return (
			<button
				type="button"
				className="inline-flex shrink-0 items-center gap-1.5 rounded-[10px] border border-[#fbd0d0] bg-card px-3 py-2 text-xs font-semibold text-[#991b1b] transition-colors hover:bg-[#fef2f2]"
			>
				<RefreshCw className="size-3.5" />
				Reintentar
			</button>
		)
	}

	if (status === 'processing') {
		return (
			<span className="grid size-9 shrink-0 place-content-center rounded-full bg-[#eff6ff] text-[#1e40af]">
				<Clock className="size-4 animate-pulse" />
			</span>
		)
	}

	return (
		<Button
			size="sm"
			className="shrink-0"
			text={
				<span className="flex items-center gap-1.5">
					<Upload className="size-3.5" />
					Cargar
				</span>
			}
		/>
	)
}

/** Fila de una sección: chip de estado, nombre, píldora + mes, y acción por estado. */
const ReportItem = ({ section, resolved, onUploadReport }: ReportItemProps) => {
	const { status, report } = resolved
	const meta = REPORT_STATUS_META[status]
	const Icon = meta.icon
	const month = getSectionReportMonth(section, report)

	return (
		<FileSelector
			fileAccepts=".xlsx"
			onSelectedFile={file => onUploadReport(file, section)}
			fileUploaderComponent={
				<div className="group flex cursor-pointer items-center gap-3 border-b border-[#f1eff8] px-5 py-3.5 transition-colors last:border-b-0 hover:bg-[#faf9fe]">
					<span className={cn('grid size-9 shrink-0 place-content-center rounded-xl', meta.chipClass)}>
						<Icon className="size-[18px]" strokeWidth={2.2} />
					</span>
					<div className="min-w-0 flex-1">
						<p className="truncate text-sm font-semibold tracking-tight">{section.name}</p>
						<div className="mt-1.5 flex flex-wrap items-center gap-2">
							<span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11.5px] font-bold', meta.badgeClass)}>
								<span className={cn('size-1.5 rounded-full bg-current', status === 'processing' && 'animate-pulse')} />
								{meta.label}
							</span>
							<span className="text-xs font-medium text-muted-foreground">Reporte de {month}</span>
						</div>
					</div>
					<ReportItemAction status={status} report={report} />
				</div>
			}
		/>
	)
}

export default ReportItem
