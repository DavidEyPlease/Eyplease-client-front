import { LayoutSlideSpec } from './layoutTypes'

export type ImageDims = Record<string, { w: number; h: number }>

/** Recolecta las URLs de imagen (http) presentes en los datos de todos los slides,
 *  a cualquier profundidad (soporta listados items[]). El fondo no se incluye: va
 *  full-bleed sin recorte, así que no necesita dimensiones. */
const collectImageUrls = (slides: LayoutSlideSpec[]): string[] => {
    const urls = new Set<string>()
    const walk = (v: unknown) => {
        if (typeof v === 'string') {
            if (/^https?:\/\//i.test(v)) urls.add(v)
            return
        }
        if (Array.isArray(v)) { v.forEach(walk); return }
        if (v && typeof v === 'object') { Object.values(v).forEach(walk); return }
    }
    for (const s of slides) walk(s.data)
    return Array.from(urls)
}

/** Dimensiones naturales de una imagen. Solo leemos naturalWidth/Height (no píxeles),
 *  así que NO requiere CORS. Si falla, resuelve null y el renderer cae al tamaño de caja. */
const loadDims = (url: string): Promise<{ w: number; h: number } | null> =>
    new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight })
        img.onerror = () => resolve(null)
        img.src = url
    })

/**
 * Precarga el aspecto real de cada foto (url → {w,h}). El renderer se lo pasa a
 * PptxGenJS como tamaño de imagen para que el `cover` recorte de verdad (sin esto,
 * PptxGenJS usa la caja como tamaño de imagen → ratio 1:1 → estira la foto).
 */
export const preloadImageDims = async (slides: LayoutSlideSpec[]): Promise<ImageDims> => {
    const urls = collectImageUrls(slides)
    const results = await Promise.all(urls.map(async url => [url, await loadDims(url)] as const))

    const dims: ImageDims = {}
    for (const [url, d] of results) {
        if (d && d.w > 0 && d.h > 0) dims[url] = d
    }
    return dims
}
