import dayjs from 'dayjs'

/** El reporte anual (cierre del año) solo se ofrece en junio. */
export const ANNUAL_REPORT_MONTH = 6

/** Clave (por año) que recuerda en localStorage que el usuario ya vio el popup. */
export const ANNUAL_POPUP_SEEN_KEY = 'annual-report-popup-seen'

/** Escape hatch para previsualizar el reporte anual fuera de junio:
 *  localStorage.setItem('annual-report-preview', '1'). */
export const ANNUAL_REPORT_PREVIEW_KEY = 'annual-report-preview'

/** Disponible solo en junio (o con el flag de previsualización). */
export const isAnnualReportAvailable = (): boolean =>
    dayjs().month() === ANNUAL_REPORT_MONTH || localStorage.getItem(ANNUAL_REPORT_PREVIEW_KEY) === '1'
