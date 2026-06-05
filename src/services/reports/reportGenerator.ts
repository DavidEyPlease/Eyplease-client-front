import { API_ROUTES } from '@/constants/api'
import {
    ApiResponse,
    NationalBackgrounds,
    NewsletterSectionKeys,
    NewsletterTypes,
    ReportBackgrounds,
} from '@/interfaces/common'
import { INationalMonthlyReport, IUnityMonthlyReport } from '@/interfaces/monthlyReports'
import HttpService from '@/services/http'
import { LayoutPptxPayload } from '@/services/pptx/layoutTypes'
import useAuthStore from '@/store/auth'
import useReportTasksStore from '@/store/reportTasks'
import { objectToQueryParams, sanitizeFileName } from '@/utils'
import { buildNationalPptx } from './buildNationalPptx'
import { buildUnityPptx } from './buildUnityPptx'
import { ReportProgressFn } from './progress'

// Orquestador de generación de boletines en segundo plano. Cada función crea una
// tarea en el store (que pinta el toast), hace el fetch al backend y dirige el
// progreso hasta dejar el archivo listo para descargar. No vive en ningún
// componente, así que la generación continúa aunque el usuario navegue de vista.

interface ReportParams {
    templateId: string
    reportType: NewsletterTypes
    sections: NewsletterSectionKeys[]
    title: string
}

type PptxResponse = ApiResponse<{
    template_resources: ReportBackgrounds & { font_color: string }
    report: IUnityMonthlyReport | INationalMonthlyReport
}>

type PdfResponse = ApiResponse<{ url: string; filename: string }>

const errorMessage = (error: unknown): string => {
    if (error && typeof error === 'object') {
        const e = error as { message?: string; error?: string }
        return e.message || e.error || 'Error al generar el boletín. Inténtalo de nuevo.'
    }
    return 'Error al generar el boletín. Inténtalo de nuevo.'
}

const buildReportUrl = (route: string, { templateId, reportType, sections }: ReportParams) => {
    const query = objectToQueryParams({ sections: sections.join(',') })
    return route.replace('{templateId}', templateId).replace('{reportType}', reportType) + `?${query}`
}

/** PDF: el backend lo genera de forma síncrona y devuelve una URL ya alojada. */
export const generatePdfReport = async (params: ReportParams): Promise<void> => {
    const { addTask, markReady, markError } = useReportTasksStore.getState()
    const id = addTask({ type: 'pdf', title: params.title, statusText: 'Solicitando documento...' })

    try {
        const url = buildReportUrl(API_ROUTES.REPORTS.GENERATE_REPORT_PDF, params)
        const response = await HttpService.get<PdfResponse>(url)

        if (response.success && response.data) {
            markReady(id, { url: response.data.url, filename: response.data.filename })
        } else {
            markError(id, response.message || 'No se recibió el documento.')
        }
    } catch (error) {
        console.error('Failed to generate PDF report:', error)
        markError(id, errorMessage(error))
    }
}

/** PPTX: el backend entrega datos + recursos de plantilla y el archivo se arma
 *  íntegramente en el cliente, paso a paso. */
export const generatePptxReport = async (params: ReportParams): Promise<void> => {
    const { addTask, setProgress, markReady, markError } = useReportTasksStore.getState()
    const id = addTask({ type: 'pptx', title: params.title, statusText: 'Solicitando datos...', progress: 5 })

    try {
        const url = buildReportUrl(API_ROUTES.REPORTS.GENERATE_REPORT_PPTX, params)
        const response = await HttpService.get<PptxResponse>(url)
        const user = useAuthStore.getState().user

        if (!response.success || !response.data || !user) {
            markError(id, response.message || 'No se recibieron los datos del boletín.')
            return
        }

        const { template_resources, report } = response.data

        // Pequeña pausa entre pasos para que la animación del toast se perciba fluida.
        const onProgress: ReportProgressFn = (statusText, progress) => {
            setProgress(id, progress, statusText)
            return new Promise(resolve => setTimeout(resolve, 250))
        }

        let blob: Blob
        let base: string

        if (template_resources.type === NewsletterTypes.UNITY) {
            base = `${user.account}-Boletín-Unidad-${report.year_month}`
            blob = await buildUnityPptx(template_resources as unknown as LayoutPptxPayload, onProgress)
        } else {
            base = `${user.account}-Boletín-Nacional-${report.year_month}`
            blob = await buildNationalPptx(template_resources as unknown as LayoutPptxPayload, onProgress)
        }

        markReady(id, { blob, filename: `${sanitizeFileName(base)}.pptx` })
    } catch (error) {
        console.error('Failed to generate PPTX report:', error)
        markError(id, errorMessage(error))
    }
}
