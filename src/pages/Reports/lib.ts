import { Check, Clock, AlertTriangle, Upload, type LucideIcon } from "lucide-react"
import { IReportUpload } from "@/interfaces/reportUpload"
import { Newsletter, NewsletterSection, NewsletterSectionKeys, NewsletterTypes } from "@/interfaces/common"
import { formatDate } from "@/utils/dates"

/** Estado derivado de una sección de reporte: el upload más relevante o la ausencia de él. */
export type ReportStatus = 'completed' | 'processing' | 'failed' | 'pending'

interface ReportStatusMeta {
	label: string
	icon: LucideIcon
	/** Chip cuadrado con el icono del estado. */
	chipClass: string
	/** Píldora de estado. */
	badgeClass: string
}

/** Etiqueta, icono y clases por estado. Centralizado para no repetir strings por la UI. */
export const REPORT_STATUS_META: Record<ReportStatus, ReportStatusMeta> = {
	completed: {
		label: 'Cargado',
		icon: Check,
		chipClass: 'bg-[#ecfdf3] text-[#16a34a]',
		badgeClass: 'border-[#cdeed7] bg-[#ecfdf3] text-[#166534]',
	},
	processing: {
		label: 'Procesando',
		icon: Clock,
		chipClass: 'bg-[#eff6ff] text-[#1e40af]',
		badgeClass: 'border-[#c7ddfd] bg-[#eff6ff] text-[#1e40af]',
	},
	failed: {
		label: 'Fallido',
		icon: AlertTriangle,
		chipClass: 'bg-[#fef2f2] text-[#991b1b]',
		badgeClass: 'border-[#fbd0d0] bg-[#fef2f2] text-[#991b1b]',
	},
	pending: {
		label: 'Pendiente',
		icon: Upload,
		chipClass: 'bg-primary/10 text-primary',
		badgeClass: 'border-[#ecebf3] bg-[#faf9fe] text-muted-foreground',
	},
}

/** Etiqueta corta del boletín para el tag del panel. */
export const NEWSLETTER_TAG: Record<NewsletterTypes, string> = {
	[NewsletterTypes.UNITY]: 'Unidad',
	[NewsletterTypes.NATIONAL]: 'Nacional',
}

export interface ResolvedSectionReport {
	status: ReportStatus
	report: IReportUpload | null
}

/**
 * Resuelve el estado de una sección: prioriza el upload 'completed'; si no hay,
 * toma el más reciente (processing/failed); si no hay ninguno, queda 'pending'.
 */
export const resolveSectionReport = (reports: IReportUpload[], sectionId: string): ResolvedSectionReport => {
	const forSection = reports.filter(r => r.newsletter_section.id === sectionId)
	if (!forSection.length) {
		return { status: 'pending', report: null }
	}

	const completed = forSection.find(r => r.status === 'completed')
	if (completed) {
		return { status: 'completed', report: completed }
	}

	const latest = [...forSection].sort(
		(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
	)[0]

	return { status: latest.status, report: latest }
}

/** Secciones importables (las únicas que se suben) de un boletín. */
export const getImportableSections = (newsletter: Newsletter): NewsletterSection[] =>
	newsletter.sections.filter(s => s.canImported)

/** Nº de secciones ya cargadas (completed) de un conjunto. */
export const countCompletedReports = (sections: NewsletterSection[], reports: IReportUpload[]): number =>
	sections.filter(s => resolveSectionReport(reports, s.id).status === 'completed').length

export interface ReportsSummary {
	loaded: number
	total: number
	failed: number
}

/** Resumen global de progreso a lo largo de todos los boletines importables. */
export const summarizeReports = (newsletters: Newsletter[], reports: IReportUpload[]): ReportsSummary => {
	return newsletters.reduce<ReportsSummary>(
		(acc, newsletter) => {
			for (const section of getImportableSections(newsletter)) {
				acc.total++
				const { status } = resolveSectionReport(reports, section.id)
				if (status === 'completed') {
					acc.loaded++
				} else if (status === 'failed') {
					acc.failed++
				}
			}
			return acc
		},
		{ loaded: 0, total: 0, failed: 0 }
	)
}

/** Porcentaje de progreso (0–100) con guarda de división por cero. */
export const progressPercent = (loaded: number, total: number): number =>
	total ? Math.round((loaded / total) * 100) : 0

/** Secciones cuyo reporte pertenece al mes en curso (el resto es el mes anterior). */
export const REPORT_SECTIONS_IN_CURRENT_MONTH = [NewsletterSectionKeys.ANNIVERSARIES, NewsletterSectionKeys.BIRTHDAYS]

const CURRENT_MONTH = new Date().toLocaleDateString('es-MX', { month: 'long' })
const PREVIOUS_MONTH = new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleDateString('es-MX', { month: 'long' })

/** Mes al que corresponde el reporte de una sección: del upload si existe, o el esperado. */
export const getSectionReportMonth = (section: NewsletterSection, report: IReportUpload | null): string => {
	if (report) {
		return formatDate(report.year_month, { formatter: 'MMMM', dateOnly: true })
	}
	return REPORT_SECTIONS_IN_CURRENT_MONTH.includes(section.sectionKey) ? CURRENT_MONTH : PREVIOUS_MONTH
}

export const CONFLICT_CODES = {
	CROSS_USER_VALIDATION_ERROR: 'CROSS_USER_VALIDATION_ERROR',
	INVALID_REPORT_HEADINGS: 'INVALID_REPORT_HEADINGS'
}

type ErrorControlledBase = { success: boolean, error_code: keyof typeof CONFLICT_CODES }

export interface ConflictUser {
	id: string
	consultant_code: string
	name: string
}

export interface ConflictUsersError {
	errors: ErrorControlledBase & {
		conflict_users: ConflictUser[]
	}
}

export interface ConflictHeadingsError {
	errors: ErrorControlledBase & {
		expected_columns: string[],
		found_columns: string[]
	}
}

export const hasConflictUsersStructure = (error: unknown): error is ConflictUsersError => {
	return error !== null &&
		typeof error === 'object' &&
		'errors' in error &&
		error.errors !== null &&
		typeof error.errors === 'object' &&
		'error_code' in error.errors &&
		(error.errors as Record<string, unknown>).error_code === CONFLICT_CODES.CROSS_USER_VALIDATION_ERROR &&
		'conflict_users' in error.errors &&
		Array.isArray((error.errors as Record<string, unknown>).conflict_users)
}

export const hasConflictHeadingsStructure = (error: unknown): error is ConflictHeadingsError => {
	return error !== null &&
		typeof error === 'object' &&
		'errors' in error &&
		error.errors !== null &&
		typeof error.errors === 'object' &&
		'error_code' in error.errors &&
		(error.errors as Record<string, unknown>).error_code === CONFLICT_CODES.INVALID_REPORT_HEADINGS &&
		'expected_columns' in error.errors &&
		Array.isArray((error.errors as Record<string, unknown>).expected_columns) &&
		'found_columns' in error.errors &&
		Array.isArray((error.errors as Record<string, unknown>).found_columns)
}
