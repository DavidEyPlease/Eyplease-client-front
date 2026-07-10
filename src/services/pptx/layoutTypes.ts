// Esquema de layout del editor (idéntico a admin-eyplease/EditorReports/layout-types.ts
// y al intérprete PHP BoletinRenderService). El backend (planUnityPptx) nos manda estos
// layouts + la lista ordenada de slides; el front solo los renderiza con PptxGenJS.

export type RGB = [number, number, number]
export type RGBA = [number, number, number, number]

export interface Border { color: RGB; width: number; double?: boolean; gap?: number; inner_width?: number }
export interface Shadow { blur: number; color: RGBA; offset: [number, number] }

export interface PhotoZone {
    id?: string; type: 'photo'; data_key: string
    x: number; y: number; w: number; h: number
    shape: 'circle' | 'rounded_rect' | 'rect'; radius?: number; fit?: 'cover' | 'contain'
    border?: Border; shadow?: Shadow; opacity?: number
}
export interface TextZone {
    id?: string; type: 'text'; data_key: string
    x: number; y: number; w: number
    align: 'left' | 'center' | 'right'; valign: 'top' | 'middle' | 'bottom'
    font: string; weight: number; size: number; color: RGB
    line_height?: number; tracking?: number; uppercase?: boolean; static?: string
    flow_below?: string; flow_gap?: number
    auto_fit?: boolean; min_size?: number
}
export interface LogoZone {
    id?: string; type: 'logo'; src?: string; data_key?: string
    x: number; y: number; w: number; h: number; fit?: 'contain' | 'cover'; opacity?: number
}
export type LayoutZone = PhotoZone | TextZone | LogoZone

// `canvas` puede llegar null desde el backend (layouts guardados sin lienzo propio); en ese
// caso el renderer escala contra el canvas del payload (ver LayoutPptxRenderer.renderZones).
export interface Layout { name: string; canvas: { w: number; h: number } | null; zones: LayoutZone[] }

/** Un slide del documento: fondo full-bleed + (opcional) zonas del layout rellenas con data. */
export interface LayoutSlideSpec {
    bg: string
    layout_key: string | null
    data: Record<string, unknown>
}

/** Payload que devuelve /reports/generate-pptx para UNIDAD y NACIONAL (mode: 'layout'). */
export interface LayoutPptxPayload {
    type: 'unity' | 'national'
    mode: 'layout'
    font_color: string
    canvas: { w: number; h: number }
    slides: LayoutSlideSpec[]
    layouts: Record<string, Layout>
}
