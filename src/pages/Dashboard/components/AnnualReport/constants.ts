import dayjs from 'dayjs'

/**
 * Meses en los que se ofrece el reporte anual (cierre de junio): julio y agosto.
 * OJO: dayjs().month() es 0-indexado → 6 = julio, 7 = agosto. El backend resuelve solo
 * el cierre (último junio cerrado), así que en ambos meses se usan los datos de junio.
 */
export const ANNUAL_REPORT_MONTHS = [6, 7]

/** Clave (por año) que recuerda en localStorage que el usuario ya vio el popup. */
export const ANNUAL_POPUP_SEEN_KEY = 'annual-report-popup-seen'

/** Escape hatch para previsualizar el reporte anual fuera de la ventana:
 *  localStorage.setItem('annual-report-preview', '1'). */
export const ANNUAL_REPORT_PREVIEW_KEY = 'annual-report-preview'

/** Disponible en julio-agosto (o con el flag de previsualización). */
export const isAnnualReportAvailable = (): boolean =>
	ANNUAL_REPORT_MONTHS.includes(dayjs().month()) || localStorage.getItem(ANNUAL_REPORT_PREVIEW_KEY) === '1'
