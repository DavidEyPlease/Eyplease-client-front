import PptxGenJS from 'pptxgenjs'
import { animarIntro } from './animarIntro'

/** Las de premiación: el Top 3 y el podio de tres lugares. */
const ES_PREMIACION = /\/(top_3|top_podium)$/

import { sanitizeFileName } from '@/utils'
import { Layout, LayoutSlideSpec, LayoutZone, PhotoZone, TextZone, LogoZone } from './layoutTypes'
import { ImageDims } from './preloadImageDims'

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
    private imageDims: ImageDims = {}
    // Canvas del payload (px del editor, p. ej. 1920×1080). Es el fallback de escala para
    // los layouts que llegan SIN canvas propio: sus zonas siguen en px de este lienzo, así
    // que hay que escalar contra él y no contra el lienzo en pulgadas (ver renderZones).
    private canvas: { w: number; h: number } | null = null

    /** Láminas (1-based) que llevan entrada animada: las de premiación. */
    private premiacion: number[] = []

    constructor(config: { fontColor?: string } = {}) {
        this.pres = new PptxGenJS()
        this.pres.layout = 'LAYOUT_WIDE'
        this.fallbackColor = (config.fontColor || 'FFFFFF').replace('#', '')
    }

    /**
     * Construye todas las páginas del documento desde el payload del backend.
     * imageDims (url → {w,h}, precargado por preloadImageDims) permite pasar a PptxGenJS
     * el aspecto REAL de cada foto para que su `cover`/`contain` recorte bien. Sin él,
     * PptxGenJS asume imagen == caja y estira la foto (ver drawPhoto).
     */
    build(
        slides: LayoutSlideSpec[],
        layouts: Record<string, Layout>,
        imageDims: ImageDims = {},
        canvas: { w: number; h: number } | null = null,
    ): void {
        this.imageDims = imageDims
        this.canvas = canvas
        this.premiacion = []
        slides.forEach((spec, i) => {
            const slide = this.pres.addSlide()
            slide.addImage({ path: this.resolveImage(spec.bg), x: 0, y: 0, w: SLIDE_W_IN, h: SLIDE_H_IN })

            const layout = spec.layout_key ? layouts[spec.layout_key] : undefined
            const premiacion = ES_PREMIACION.test(spec.layout_key ?? '')
            if (layout) this.renderZones(slide, layout, spec.data, premiacion)
            // Las láminas de premiación llevan entrada animada (ver animarIntro).
            // i + 1 porque los slideN.xml del paquete empiezan en 1.
            if (premiacion) this.premiacion.push(i + 1)
        })
    }

    async download(fileName: string): Promise<void> {
        const blob = await this.toBlob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${sanitizeFileName(fileName)}.pptx`
        a.click()
        URL.revokeObjectURL(url)
    }

    /** Genera el .pptx como Blob (sin descargar). El nombre de archivo se aplica
     *  al momento de la descarga; aquí solo se devuelve el binario. */
    async toBlob(): Promise<Blob> {
        const blob = (await this.pres.write({ outputType: 'blob' })) as Blob
        return animarIntro(blob, this.premiacion)
    }

    // ---- Render de zonas ----

    private renderZones(slide: PptxGenJS.Slide, layout: Layout, data: Record<string, unknown>, premiacion = false): void {
        // Escala px→pulgadas: canvas propio del layout > canvas del payload > lienzo del slide.
        // OJO: NO caer a SLIDE_W_IN/SLIDE_H_IN cuando falta el canvas del layout — las zonas
        // vienen en px del canvas del payload (p. ej. 1920×1080), y usar el lienzo en pulgadas
        // deja xs=ys≈1 (trata px como pulgadas) → fuentes gigantes, cajas degeneradas y EMU
        // fraccionario que corrompe el .pptx. El payload SIEMPRE trae canvas, así que este es
        // el fallback correcto; SLIDE_* solo queda como última red de seguridad.
        const cw = layout.canvas?.w || this.canvas?.w || SLIDE_W_IN
        const ch = layout.canvas?.h || this.canvas?.h || SLIDE_H_IN
        const xs = SLIDE_W_IN / cw // px → pulgadas (horizontal)
        const ys = SLIDE_H_IN / ch // px → pulgadas (vertical, también escala fuente)

        // Índice data_key → zona, para resolver flow_below (igual que el renderer PHP).
        const byKey: Record<string, LayoutZone> = {}
        for (const z of layout.zones) {
            if (z.type !== 'logo' && z.data_key) byKey[z.data_key] = z
        }

        // Nombre + cifra que fluye bajo él → un solo cuadro (ver parejasFluidas). En la
        // premiación no: su animación hace entrar el nombre y la cifra por separado.
        const parejas = premiacion ? new Map<string, TextZone>() : this.parejasFluidas(layout.zones, data)
        const seguidoras = new Set(Array.from(parejas.values(), z => z.data_key))

        for (const zone of layout.zones) {
            if (zone.type === 'photo') this.drawPhoto(slide, zone, data, xs, ys)
            else if (zone.type === 'logo') this.drawLogo(slide, zone, data, xs, ys)
            else if (zone.type === 'text') {
                if (seguidoras.has(zone.data_key)) continue // va dentro del cuadro de su ancla
                const sigue = parejas.get(zone.data_key)
                if (sigue) this.drawPareja(slide, zone, sigue, data, xs, ys)
                else this.drawText(slide, zone, data, byKey, xs, ys)
            }
        }
    }

    /**
     * Las parejas nombre → cifra que van en UN solo cuadro de texto, con la cifra como
     * segundo párrafo.
     *
     * En cuadros separados, la cifra se coloca con el alto que aquí se CALCULA para el
     * nombre, y el cálculo no sabe cómo lo partirá PowerPoint (sólo se nombra la fuente).
     * Por eso effectiveTopPx reserva un renglón de más cuando el nombre roza el ancho, y
     * un nombre que al final cabe en una línea deja un hueco bajo él («Ma De La Luz
     * Becerra» … «1 inicio» muy abajo). En un solo cuadro es PowerPoint quien parte el
     * nombre y la cifra va justo detrás, tenga o no la fuente.
     *
     * Sólo cuando es seguro: el ancla tiene y fija, lleva UNA sola zona debajo, las dos
     * comparten anclaje (x y align) y la de abajo no es más ancha que el nombre. Las
     * estrellas (LLEVAS y FALTAN bajo el nombre, la segunda sumando el alto de la
     * primera) y las cadenas siguen por separado, como hasta ahora.
     */
    private parejasFluidas(zones: LayoutZone[], data: Record<string, unknown>): Map<string, TextZone> {
        const textos = zones.filter((z): z is TextZone => z.type === 'text' && !!z.data_key)
        const porClave = new Map(textos.map(z => [z.data_key, z]))
        const debajo = new Map<string, TextZone[]>()
        for (const z of textos) {
            if (z.flow_below) debajo.set(z.flow_below, [...(debajo.get(z.flow_below) ?? []), z])
        }
        const parejas = new Map<string, TextZone>()
        debajo.forEach((bajo, clave) => {
            const a = porClave.get(clave)
            const b = bajo[0]
            if (!a || a.flow_below || bajo.length !== 1) return
            if (Math.abs(a.x - b.x) > 2 || (a.align ?? 'left') !== (b.align ?? 'left')) return
            if ((b.w ?? 0) > (a.w ?? 0) + 4) return
            // Con uno de los dos vacío no hay nada que juntar: cada uno por su camino.
            if (this.textValue(a, data) === '' || this.textValue(b, data) === '') return
            parejas.set(clave, b)
        })
        return parejas
    }

    /** Nombre y cifra en un cuadro: dos párrafos, cada uno con su estilo, y el hueco del
     *  layout (`flow_gap`) como espacio antes del segundo. */
    private drawPareja(
        slide: PptxGenJS.Slide,
        a: TextZone,
        b: TextZone,
        data: Record<string, unknown>,
        xs: number,
        ys: number,
    ): void {
        const arriba = this.parrafosDe(a, data, ys)
        const abajo = this.parrafosDe(b, data, ys)
        const huecoPt = Math.max(0, b.flow_gap ?? 0) * ys * 72 // px → pt, como la fuente
        const runs: PptxGenJS.TextProps[] = [
            ...arriba.lineas.map(text => ({ text, options: { ...arriba.estilo, breakLine: true } })),
            ...abajo.lineas.map((text, i) => ({
                text,
                options: { ...abajo.estilo, breakLine: true, ...(i === 0 && huecoPt > 0 ? { paraSpaceBefore: huecoPt } : {}) },
            })),
        ]
        slide.addText(runs, {
            objectName: a.data_key,
            x: this.izquierdaPx(a) * xs,
            y: a.y * ys,
            w: a.w * xs,
            h: (arriba.hPx + Math.max(0, b.flow_gap ?? 0) + abajo.hPx) * ys,
            align: a.align,
            valign: 'top',
            margin: 0,
        })
    }

    /** El texto de una zona partido en renglones, con su estilo de run y el alto estimado. */
    private parrafosDe(z: TextZone, data: Record<string, unknown>, ys: number) {
        let text = this.textValue(z, data)
        if (z.uppercase) text = text.toUpperCase()
        const sizePx = this.fittedSizePx(z, text)
        return {
            lineas: text.split(/\r\n|\r|\n/),
            estilo: this.estiloDe(z, sizePx, ys),
            hPx: this.lineCount(text, z, sizePx) * sizePx * (z.line_height ?? 1.15),
        }
    }

    /** Fuente, tamaño, color e interlineado de una zona, en unidades de PptxGenJS. */
    private estiloDe(z: TextZone, sizePx: number, ys: number) {
        const fontMeta = FONT_MAP[z.font] || { family: z.font || 'Inter', italic: false }
        return {
            align: z.align,
            fontFace: fontMeta.family,
            italic: fontMeta.italic,
            bold: (z.weight ?? 400) >= 600,
            fontSize: sizePx * ys * 72, // px → pt (igual escala que la geometría vertical)
            color: Array.isArray(z.color) ? this.rgbToHex(z.color) : this.fallbackColor,
            charSpacing: z.tracking ? z.tracking * ys * 72 : 0,
            lineSpacingMultiple: z.line_height ?? 1.15,
        }
    }

    /** El layout guarda x como ancla de alineación (center→centro, right→derecha);
     *  PptxGenJS alinea dentro de [x, x+w], así que se reconstruye el borde izquierdo. */
    private izquierdaPx(z: TextZone): number {
        if (z.align === 'center') return z.x - z.w / 2
        if (z.align === 'right') return z.x - z.w
        return z.x
    }

    private drawPhoto(slide: PptxGenJS.Slide, z: PhotoZone, data: Record<string, unknown>, xs: number, ys: number): void {
        const url = this.resolve(data, z.data_key)
        if (typeof url !== 'string' || !url) return // sin foto → no se dibuja

        const boxW = z.w * xs
        const boxH = z.h * ys
        const [imgW, imgH] = this.imageSize(url, boxW, boxH)

        // 'silueta': la foto ya viene recortada del fondo y con el pie desvanecido, así
        // que va SIN marco. Aquí no se usa `sizing`: `contain` CENTRA la imagen en la caja
        // y una silueta tiene que apoyarse en el borde INFERIOR, que es donde vive el
        // desvanecido. Se calcula el encaje a mano. PptxGenJS respeta el alfa del PNG.
        //
        // Sólo si la URL es de verdad la de la silueta. El backend cambia la foto por su
        // silueta ÚNICAMENTE cuando el recorte está subido (`aplicarSiluetas`), así que la
        // ruta es el aviso exacto de que existe. Si no, se dibuja como siempre y cae al
        // círculo, igual que hace el motor del PDF: vale más un círculo que un recuadro
        // pegado con el fondo original.
        if (z.shape === 'silueta' && url.includes('/siluetas/')) {
            const esc = Math.min(boxW / imgW, boxH / imgH)
            const w = imgW * esc
            const h = imgH * esc
            slide.addImage({
                objectName: z.data_key, // lo lee animarIntro para ordenar la entrada
                path: this.resolveImage(url),
                x: z.x * xs + (boxW - w) / 2,
                y: z.y * ys + (boxH - h),
                w,
                h,
                ...(z.opacity != null ? { transparency: Math.round((1 - z.opacity) * 100) } : {}),
            })
            return
        }

        slide.addImage({
            objectName: z.data_key,
            path: this.resolveImage(url),
            x: z.x * xs,
            y: z.y * ys,
            // w/h de nivel superior = aspecto REAL de la imagen: es lo que PptxGenJS usa para
            // calcular el recorte del `sizing` (luego reasigna el tamaño mostrado a sizing.w/h).
            // Sin dimensiones reales asumiría imagen==caja y ESTIRARÍA la foto.
            w: imgW,
            h: imgH,
            sizing: { type: z.fit === 'contain' ? 'contain' : 'cover', w: boxW, h: boxH },
            // 'silueta' que llega aquí es una foto SIN recortar: círculo, como el PDF.
            rounding: z.shape === 'circle' || z.shape === 'silueta', // único recorte nativo; rounded_rect → rectángulo
            ...(z.opacity != null ? { transparency: Math.round((1 - z.opacity) * 100) } : {}),
        })
    }

    /** Aspecto real de la imagen (precargado) o la caja como fallback. Solo el ratio importa:
     *  PptxGenJS reasigna el tamaño mostrado a sizing.w/h tras calcular el recorte. */
    private imageSize(url: string, boxW: number, boxH: number): [number, number] {
        const d = this.imageDims[url]
        return d ? [d.w, d.h] : [boxW, boxH]
    }

    private drawLogo(slide: PptxGenJS.Slide, z: LogoZone, data: Record<string, unknown>, xs: number, ys: number): void {
        const dyn = z.data_key ? this.resolve(data, z.data_key) : null
        const url = typeof dyn === 'string' && dyn ? dyn : z.src
        if (!url) return // logo dinámico vacío (cliente sin logo) → no se dibuja

        const boxW = z.w * xs
        const boxH = z.h * ys
        const [imgW, imgH] = this.imageSize(url, boxW, boxH)
        slide.addImage({
            path: this.resolveImage(url),
            x: z.x * xs,
            y: z.y * ys,
            w: imgW,
            h: imgH,
            sizing: { type: z.fit === 'cover' ? 'cover' : 'contain', w: boxW, h: boxH },
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
        const topPx = this.effectiveTopPx(z, byKey, data)
        const hPx = this.lineCount(text, z, sizePx) * sizePx * (z.line_height ?? 1.15)

        // Saltos explícitos (\n) → varias líneas con breakLine.
        const runs: PptxGenJS.TextProps[] = text
            .split(/\r\n|\r|\n/)
            .map(line => ({ text: line, options: { breakLine: true } }))

        slide.addText(runs, {
            objectName: z.data_key, // lo lee animarIntro para ordenar la entrada
            x: this.izquierdaPx(z) * xs,
            y: topPx * ys,
            w: z.w * xs,
            h: hPx * ys,
            valign: 'top', // el editor exporta siempre valign top (ancla arriba)
            ...this.estiloDe(z, sizePx, ys),
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
            // Holgura para la RE-DIVISIÓN de PowerPoint. Aquí sólo se NOMBRA la fuente: si
            // el visor no tiene Lora o Poppins sustituye por otra más ancha, un nombre que
            // cabía en una línea se parte en dos y se come lo que va debajo (pasó en las
            // estrellas: los cuatro nombres partidos sobre el "LLEVAS"). Cuando el texto
            // roza el ancho de la caja se reserva una línea de más; si va holgado no se
            // toca, para no separar de balde lo que sí cabe.
            const holgado = this.measureWidthPx(aText, anchor, aSize) <= (anchor.w || 1) * 0.8
            const alto = holgado ? aH : aH + aSize * (anchor.line_height ?? 1.15)
            return anchor.y + alto + (z.flow_gap ?? 0)
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
     * Resuelve la URL final de una imagen para PptxGenJS:
     *  - Avatar por defecto (men/women-avatar) que la API sirve desde config('app.url')
     *    SIN CORS: se reemplaza por el asset LOCAL del front (/images/...), mismo origen,
     *    como hacía el generador anterior. Evita el error CORS y es más rápido (cacheado).
     *  - Cualquier otra URL externa (CDN): cache-bust para forzar una respuesta con CORS.
     */
    private resolveImage(url: string): string {
        if (!url) return url
        const m = url.match(/\/images\/(men|women)-avatar\.\w+/i)
        if (m) return `/images/${m[1].toLowerCase()}-avatar.jpg` // asset local del front (mismo origen)
        return this.bustCors(url)
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
