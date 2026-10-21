/**
 * Lo que entiende el reproductor del boletín interactivo. Es la data del boletín ya
 * repartida en secciones (ver `../normalize.ts`), sin nada de diseño: la piel y la
 * coreografía las pone el reproductor.
 */

export type GemKey = 'sapphire' | 'ruby' | 'diamond' | 'emerald' | 'pearl'

export interface Persona {
    nombre: string
    /** Sólo si la consultora tiene foto propia; si no, se pintan sus iniciales */
    foto?: string
}

interface SeccionBase {
    key: string
    titulo: string
    sub: string
}

export interface SeccionTramos extends SeccionBase {
    tipo: 'tramos'
    grupos: Array<{ label: string, medal: string, items: Array<{ p: string, v: number }> }>
}

export interface SeccionEscalera extends SeccionBase {
    tipo: 'escalera'
    grupos: Array<{ club: number, items: Array<{ p: string, v: number, pos: number }> }>
}

export interface SeccionPodio extends SeccionBase {
    tipo: 'podio'
    /** Siempre en orden de lugar; null = ese lugar quedó vacío (mínimo de puntos de la Directora) */
    items: Array<{ p: string, v: number } | null>
}

export interface SeccionCamino extends SeccionBase {
    tipo: 'camino'
    paradas: Array<{ label: string, rango: string, items: Array<{ p: string, a?: number }> }>
}

export interface SeccionBienvenida extends SeccionBase {
    tipo: 'bienvenida'
    /** `por` = la iniciadora si también sale en el boletín; si no, sólo su nombre */
    items: Array<{ p: string, por?: string, porNombre?: string }>
}

export interface SeccionEstrellas extends SeccionBase {
    tipo: 'estrellas'
    /** true el último mes del trimestre: ya no se dice «Llevas / Faltan» sino «Ha ganado con» */
    cierre: boolean
    grupos: Array<{ gema: GemKey, items: Array<{ p: string, v: number }> }>
}

export interface SeccionLuminarias extends SeccionBase {
    tipo: 'luminarias'
    items: Array<{ p: string, v: number, gema: GemKey }>
}

export interface SeccionCirculo extends SeccionBase {
    tipo: 'circulo'
    grupos: Array<{ label: string, rango: string, items: Array<{ p: string, m: number }> }>
}

export interface SeccionCumple extends SeccionBase {
    tipo: 'cumple'
    anio: number
    mes: number
    mesNombre: string
    items: Array<{ p: string, d: number }>
}

export interface SeccionAniversario extends SeccionBase {
    tipo: 'aniversario'
    mesNombre: string
    items: Array<{ p: string, y: number }>
}

export type Seccion =
    | SeccionTramos | SeccionEscalera | SeccionPodio | SeccionCamino | SeccionBienvenida
    | SeccionEstrellas | SeccionLuminarias | SeccionCirculo | SeccionCumple | SeccionAniversario

export interface BoletinData {
    tipo: 'Unidad' | 'Nacional'
    /** «Septiembre 2026» */
    mes: string
    /** «septiembre» */
    mesNombre: string
    /** Colombia escribe «2.182» y su programa de Estrellas es el Círculo del Éxito, sin Perla */
    colombia: boolean
    directora: { nombre: string, unidad: string, foto?: string }
    personas: Record<string, Persona>
    secciones: Seccion[]
    /**
     * Carpeta del arte de la plantilla elegida (…/public/templates/{slug}/unidad). Con ella la
     * piel «Tu plantilla» usa las mismas portadas que el PDF.
     */
    arte?: string
}

export type SkinKey = 'plantilla' | 'gala' | 'rosa' | 'eyplease' | 'marmol'
export type FormatKey = 'wide' | 'phone'
