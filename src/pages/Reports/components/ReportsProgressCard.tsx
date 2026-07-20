import { ClipboardCheck } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { progressPercent, ReportsSummary } from "../lib"

/** Tira de progreso global: total cargados/total y estado resumido. */
const ReportsProgressCard = ({ loaded, total, failed }: ReportsSummary) => {
	const percent = progressPercent(loaded, total)
	const pending = Math.max(0, total - loaded - failed)

	const buildHint = () => {
		if (total > 0 && loaded === total) {
			return '¡Todos tus reportes están cargados!'
		}
		const parts: string[] = []
		if (pending > 0) {
			parts.push(`Te ${pending === 1 ? 'falta' : 'faltan'} ${pending} por subir`)
		}
		if (failed > 0) {
			parts.push(`${failed} con error que revisar`)
		}
		return parts.length ? `${parts.join(' y ')}.` : 'Sube el reporte de cada sección.'
	}

	return (
		<div className="flex flex-wrap items-center gap-4 rounded-3xl border border-[#ecebf3] bg-card px-5.5 py-4 shadow-[0_10px_30px_-12px_rgba(41,27,105,0.22)]">
			<span className="grid size-9 shrink-0 place-content-center rounded-[10px] bg-[#ecfdf3] text-[#16a34a]">
				<ClipboardCheck className="size-[18px]" />
			</span>
			<div className="min-w-0">
				<p className="text-[15px] font-bold tracking-tight">
					{loaded} de {total} reportes cargados
				</p>
				<p className="text-xs font-medium text-muted-foreground">{buildHint()}</p>
			</div>
			<div className="ml-auto w-full min-w-45 sm:w-auto sm:max-w-80 sm:flex-1">
				<Progress
					value={percent}
					className="h-1.5 bg-[#eceaf6]"
					indicatorClassName="bg-gradient-to-r from-[#6B4FE3] to-[#4E31C0]"
				/>
			</div>
		</div>
	)
}

export default ReportsProgressCard
