import LayoutPptxRenderer from '@/services/pptx/LayoutPptxRenderer'
import { LayoutPptxPayload } from '@/services/pptx/layoutTypes'
import { ReportProgressFn } from './progress'

// Boletín NACIONAL (horizontal): igual que Unidad, el backend (planNationalPptx) ya
// resolvió secciones, datos y paginación; el front solo pinta el payload de layout zona
// por zona con PptxGenJS (renderer genérico). Devuelve el .pptx como Blob para descarga
// diferida (no auto-descarga).
export const buildNationalPptx = async (
    payload: LayoutPptxPayload,
    onProgress: ReportProgressFn
): Promise<Blob> => {
    await onProgress('Preparando diapositivas...', 15)

    const renderer = new LayoutPptxRenderer({ fontColor: payload.font_color })

    await onProgress('Dibujando contenido...', 45)
    renderer.build(payload.slides, payload.layouts)

    await onProgress('Empaquetando presentación...', 80)
    return renderer.toBlob()
}
