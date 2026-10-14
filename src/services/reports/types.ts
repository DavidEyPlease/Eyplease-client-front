// Tipos compartidos del sistema de generación de boletines en segundo plano.
// Una "tarea de reporte" representa una generación (PDF, PPTX o imágenes) que corre en
// el cliente y sobrevive a la navegación: el store es global, así que el usuario
// puede cambiar de vista mientras el archivo se construye.

/** `images` = una JPEG por página en un ZIP (para WhatsApp y redes); lo arma el backend igual que el PDF. */
export type ReportTaskType = 'pdf' | 'pptx' | 'images'

export type ReportTaskStatus = 'generating' | 'ready' | 'error'

/** Recurso descargable resultante. El PDF y el ZIP de imágenes llegan como URL remota;
 *  el PPTX se genera en el cliente y se guarda como Blob (se materializa al descargar). */
export interface ReportTaskDownload {
    filename: string
    /** URL remota (PDF) o blob URL ya creada. */
    url?: string
    /** Blob generado en cliente (PPTX). */
    blob?: Blob
}

export interface ReportTask {
    id: string
    type: ReportTaskType
    /** Etiqueta legible del documento, p. ej. "Boletín de Unidad · Mayo 2026". */
    title: string
    /** Texto del paso actual mostrado al usuario. */
    statusText: string
    status: ReportTaskStatus
    /** 0–100 para progreso determinado (PPTX); null = indeterminado (PDF e imágenes). */
    progress: number | null
    download?: ReportTaskDownload
    error?: string
    createdAt: number
}
