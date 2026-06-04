import PptxGenJS from 'pptxgenjs'

import { sanitizeFileName } from '@/utils'
import { Layout, LayoutSlideSpec, LayoutZone, PhotoZone, TextZone, LogoZone } from './layoutTypes'

/**
 * Renderer genérico de boletín a PowerPoint. NO conoce secciones: recibe del backend
 * (planUnityPptx) la lista ordenada de slides { bg, layout_key, data } + el mapa de
 * layouts del editor, y por cada slide pinta el fondo full-bleed y rellena las zonas
 * del layout. Es el espejo PptxGenJS de BoletinRenderService (PHP/Imagick del PDF):
 * misma fuente de verdad (el backend) → PDF y PPTX siempre sincronizados.
 *
 * Soporta geometría + estilos básicos de texto. Limitantes conocidas de PptxGenJS
 * (se difieren): borde de foto, sombra de foto, esquinas redondeadas (rounded_rect
 * cae a rectángulo; solo el círculo es nativo vía `rounding`).
 */

// Lienzo PptxGenJS LAYOUT_WIDE (16:9). Las posiciones del layout vienen en px sobre
// canvas.{w,h}; se escalan a pulgadas contra este lienzo (el fondo va full-bleed, así
// que el resultado es WYSIWYG respecto al editor).
const SLIDE_W_IN = 13.333
const SLIDE_H_IN = 7.5

// Familias reales por slug de fuente (igual que el editor). PptxGenJS solo NOMBRA la
// fuente; si el visor no la tiene, PowerPoint sustituye.
const FONT_MAP: Record<string, { family: string; italic: boolean }> = {
    PlayfairDisplay: { family: 'Playfair Display', italic: false },
    'PlayfairDisplay-Italic': { family: 'Playfair Display', italic: true },
    Inter: { family: 'Inter', italic: false },
    DancingScript: { family: 'Dancing Script', italic: false },
}

class LayoutPptxRenderer {
    private pres: PptxGenJS
    private fallbackColor: string
    private measureCtx: CanvasRenderingContext2D | null = null

    constructor(config: { fontColor?: string } = {}) {
        this.pres = new PptxGenJS()
        this.pres.layout = 'LAYOUT_WIDE'
        this.fallbackColor = (config.fontColor || 'FFFFFF').replace('#', '')
    }

    /** Construye todas las páginas del documento desde el payload del backend. */
    build(slides: LayoutSlideSpec[], layouts: Record<string, Layout>): void {
        for (const spec of slides) {
            const slide = this.pres.addSlide()
            slide.addImage({ path: this.bustCors(spec.bg), x: 0, y: 0, w: SLIDE_W_IN, h: SLIDE_H_IN })

            const layout = spec.layout_key ? layouts[spec.layout_key] : undefined
            if (layout) this.renderZones(slide, layout, spec.data)
        }
    }

    async download(fileName: string): Promise<void> {
        await this.pres.writeFile({ fileName: `${sanitizeFileName(fileName)}.pptx` })
    }

    // ---- Render de zonas ----

    private renderZones(slide: PptxGenJS.Slide, layout: Layout, data: Record<string, unknown>): void {
        const cw = layout.canvas?.w || SLIDE_W_IN
        const ch = layout.canvas?.h || SLIDE_H_IN
        const xs = SLIDE_W_IN / cw // px → pulgadas (horizontal)
        const ys = SLIDE_H_IN / ch // px → pulgadas (vertical, también escala fuente)

        // Índice data_key → zona, para resolver flow_below (igual que el renderer PHP).
        const byKey: Record<string, LayoutZone> = {}
        for (const z of layout.zones) {
            if (z.type !== 'logo' && z.data_key) byKey[z.data_key] = z
        }

        for (const zone of layout.zones) {
            if (zone.type === 'photo') this.drawPhoto(slide, zone, data, xs, ys)
            else if (zone.type === 'logo') this.drawLogo(slide, zone, data, xs, ys)
            else if (zone.type === 'text') this.drawText(slide, zone, data, byKey, xs, ys)
        }
    }

    private drawPhoto(slide: PptxGenJS.Slide, z: PhotoZone, data: Record<string, unknown>, xs: number, ys: number): void {
        const url = this.resolve(data, z.data_key)
        if (typeof url !== 'string' || !url) return // sin foto → no se dibuja

        const w = z.w * xs
        const h = z.h * ys
        slide.addImage({
            path: this.bustCors(url),
            x: z.x * xs,
            y: z.y * ys,
            w,
            h,
            sizing: { type: z.fit === 'contain' ? 'contain' : 'cover', w, h },
            rounding: z.shape === 'circle', // único recorte nativo; rounded_rect → rectángulo
            ...(z.opacity != null ? { transparency: Math.round((1 - z.opacity) * 100) } : {}),
        })
    }

    private drawLogo(slide: PptxGenJS.Slide, z: LogoZone, data: Record<string, unknown>, xs: number, ys: number): void {
        const dyn = z.data_key ? this.resolve(data, z.data_key) : null
        const url = typeof dyn === 'string' && dyn ? dyn : z.src
        if (!url) return // logo dinámico vacío (cliente sin logo) → no se dibuja

        const w = z.w * xs
        const h = z.h * ys
        slide.addImage({
            path: this.bustCors(url),
            x: z.x * xs,
            y: z.y * ys,
            w,
            h,
            sizing: { type: z.fit === 'cover' ? 'cover' : 'contain', w, h },
            ...(z.opacity != null ? { transparency: Math.round((1 - z.opacity) * 100) } : {}),
        })
    }

    private drawText(
        slide: PptxGenJS.Slide,
        z: TextZone,
        data: Record<string, unknown>,
        byKey: Record<string, LayoutZone>,
        xs: number,
        ys: number,
    ): void {
        let text = this.textValue(z, data)
        if (text === '') return
        if (z.uppercase) text = text.toUpperCase()

        const sizePx = this.fittedSizePx(z, text) // auto_fit: encoge en JS (fit:'shrink' no aplica al abrir)
        const lineHeight = z.line_height ?? 1.15

        // Caja: el layout guarda x como ancla de alineación (center→centro, right→derecha).
        // PptxGenJS centra/alinea dentro de [x, x+w], así que reconstruimos el x izquierdo.
        let boxLeftPx = z.x
        if (z.align === 'center') boxLeftPx = z.x - z.w / 2
        else if (z.align === 'right') boxLeftPx = z.x - z.w

        const topPx = this.effectiveTopPx(z, byKey, data)
        const hPx = this.lineCount(text, z, sizePx) * sizePx * lineHeight

        const fontMeta = FONT_MAP[z.font] || { family: z.font || 'Inter', italic: false }
        const color = Array.isArray(z.color) ? this.rgbToHex(z.color) : this.fallbackColor

        // Saltos explícitos (\n) → varias líneas con breakLine.
        const runs: PptxGenJS.TextProps[] = text
            .split(/\r\n|\r|\n/)
            .map(line => ({ text: line, options: { breakLine: true } }))

        slide.addText(runs, {
            x: boxLeftPx * xs,
            y: topPx * ys,
            w: z.w * xs,
            h: hPx * ys,
            align: z.align,
            valign: 'top', // el editor exporta siempre valign top (ancla arriba)
            fontFace: fontMeta.family,
            italic: fontMeta.italic,
            bold: (z.weight ?? 400) >= 600,
            fontSize: sizePx * ys * 72, // px → pt (igual escala que la geometría vertical)
            color,
            charSpacing: z.tracking ? z.tracking * ys * 72 : 0,
            lineSpacingMultiple: lineHeight,
            margin: 0, // sin inset; el layout ya posiciona exacto
        })
    }

    // ---- Medición (auto_fit + flow_below), en px del lienzo del layout ----

    /** auto_fit: encoge el tamaño hasta que el texto cabe en el ancho de la caja. */
    private fittedSizePx(z: TextZone, text: string): number {
        const base = z.size || 32
        if (!z.auto_fit || !z.w) return base
        const w = this.measureWidthPx(text, z, base)
        if (w <= z.w || w === 0) return base
        return Math.max(z.min_size ?? 8, Math.floor((base * z.w) / w))
    }

    /** y efectivo: si flow_below, se sienta bajo la zona ancla usando su alto real + gap. */
    private effectiveTopPx(z: TextZone, byKey: Record<string, LayoutZone>, data: Record<string, unknown>): number {
        if (!z.flow_below) return z.y
        const anchor = byKey[z.flow_below]
        if (!anchor) return z.y
        if (anchor.type === 'text') {
            const aText = this.textValue(anchor, data)
            const aSize = this.fittedSizePx(anchor, aText)
            const aH = this.lineCount(aText, anchor, aSize) * aSize * (anchor.line_height ?? 1.15)
            return anchor.y + aH + (z.flow_gap ?? 0)
        }
        return anchor.y + ((anchor as PhotoZone | LogoZone).h ?? 0) + (z.flow_gap ?? 0)
    }

    /** Nº de líneas tras envolver: respeta saltos explícitos y aproxima el wrap por ancho. */
    private lineCount(text: string, z: TextZone, sizePx: number): number {
        const paragraphs = text.split(/\r\n|\r|\n/)
        let lines = 0
        for (const p of paragraphs) {
            if (p.trim() === '' || !z.w) {
                lines += 1
                continue
            }
            const w = this.measureWidthPx(p, z, sizePx)
            lines += Math.max(1, Math.ceil(w / z.w))
        }
        return Math.max(1, lines)
    }

    private measureWidthPx(text: string, z: TextZone, sizePx: number): number {
        if (!this.measureCtx) this.measureCtx = document.createElement('canvas').getContext('2d')
        const fm = FONT_MAP[z.font] || { family: z.font || 'Inter', italic: false }
        if (!this.measureCtx) return text.length * sizePx * 0.5
        this.measureCtx.font = `${fm.italic ? 'italic ' : ''}${z.weight || 400} ${sizePx}px ${fm.family}`
        let w = this.measureCtx.measureText(text).width
        if (z.tracking) w += z.tracking * Math.max(0, text.length - 1)
        return w
    }

    // ---- Helpers ----

    /** Resuelve un data_key (formato plano o items[i].campo), igual que el renderer PHP. */
    private resolve(data: Record<string, unknown>, key?: string): unknown {
        if (!key) return null
        if (key.startsWith('items[') && key.includes('].')) {
            const idx = parseInt(key.slice(6, key.indexOf(']')), 10)
            const field = key.slice(key.indexOf('].') + 2)
            const items = data?.items as Array<Record<string, unknown>> | undefined
            return items?.[idx]?.[field] ?? null
        }
        return data?.[key] ?? null
    }

    /** Texto que muestra una zona: valor del data_key, o su `static`. */
    private textValue(z: TextZone, data: Record<string, unknown>): string {
        const v = this.resolve(data, z.data_key)
        if (v !== null && v !== undefined) return String(v)
        return z.static ?? ''
    }

    private rgbToHex([r, g, b]: [number, number, number]): string {
        const h = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0')
        return `${h(r)}${h(g)}${h(b)}`.toUpperCase()
    }

    /**
     * Evita que el navegador sirva una respuesta cacheada (de un <img> previo) sin
     * cabeceras CORS, lo que rompería el XHR de PptxGenJS. Solo para URLs externas.
     */
    private bustCors(url: string): string {
        if (!url || !url.startsWith('http')) return url
        const sep = url.includes('?') ? '&' : '?'
        return `${url}${sep}cb=${Date.now()}`
    }
}

export default LayoutPptxRenderer
