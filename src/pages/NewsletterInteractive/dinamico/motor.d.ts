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
    /** La plantilla del mes: la 9 («CELEBRA») o la 10 («Papel en relieve»). Por omisión, la 9. */
    piel?: 'p9' | 'p10'
    /** Carpeta de las piezas de la plantilla. Por omisión /boletin/<piel>. */
    base?: string
    /** Quién hace el scroll cuando no es el documento (la app del teléfono: un contenedor fijo). Por omisión, la ventana. */
    scroller?: HTMLElement
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
