/** Lo que el motor del boletín dinámico (motor.js) recibe y devuelve. Los datos son los de la API tal cual
 *  (GET reports/boletin-dinamico): el motor sólo los lee. */
export interface BoletinDinamicoDatos {
    mes: string
    anio: number
    dias: number
    unidad: string
    personas: Array<{ id: string, nombre: string, foto: string | null, fotoOriginal?: string | null }>
    eventos: Array<{ dia: number, p: string, pts: number, tipo: 'compra' | 'inicio' | 'otra', n: number }>
    ajustes?: { tempraneras: { activa: boolean, hasta: number }, mensaje: string | null } | null
    [seccion: string]: unknown
}

export interface BoletinDinamicoOpciones {
    /** Carpeta de las piezas de la plantilla (letras y laurel). Por omisión /boletin/p10. */
    base?: string
    /** Meses que se pueden elegir en Ajustes y el que se está viendo (AAAA-MM). */
    meses?: Array<{ valor: string, etiqueta: string }>
    mes?: string
    cambiarMes?: (yearMonth: string) => void
    volver?: () => void
    guardarAjustes?: (cambios: { tempraneras_activa: boolean, tempraneras_hasta: number }) => Promise<unknown>
    guardarMensaje?: (mensaje: string) => Promise<unknown>
}

export interface BoletinDinamico {
    destruir(): void
}

export function crearBoletinDinamico(host: HTMLElement, datos: BoletinDinamicoDatos, opciones?: BoletinDinamicoOpciones): BoletinDinamico
