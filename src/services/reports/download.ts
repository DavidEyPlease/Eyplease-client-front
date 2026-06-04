import { anchorDownload, downloadBlob } from '@/utils'
import { ReportTaskDownload } from './types'

// Descarga el archivo de una tarea lista. El PDF llega como URL remota; el PPTX
// como Blob generado en cliente. Unifica ambos casos en una sola llamada.
export const downloadReportTask = (download: ReportTaskDownload) => {
    if (download.blob) {
        downloadBlob(download.blob, download.filename)
        return
    }
    if (download.url) {
        anchorDownload(download.url, download.filename, '_blank')
    }
}
