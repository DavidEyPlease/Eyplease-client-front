/** Lo que el motor del boletín NACIONAL interactivo (motor.js) recibe y devuelve. Los datos son los de la API tal cual
 *  (GET reports/boletin-nacional): el motor sólo los lee. */
export interface BoletinNacionalDatos {
    mes: string
    anio: number
    mesEnCurso: string
    directora: { nombre: string | null, foto: string | null, nivel: string }
    area: { nombre: string, directoras: number }
    /** false si la Directora no es Nacional (una Élite con directoras debajo): el motor dice «del área» y su rango. */
    nacional?: boolean
    /** false si el área no trae Reconocimiento de Área: no salen los bonos ni el Camino al Éxito. */
    reconocimiento?: boolean
    personas: Array<{ id: string, nombre: string, foto: string | null }>
    ajustes?: { mensaje: string | null } | null
    [seccion: string]: unknown
}

export interface BoletinNacionalOpciones {
    /** Carpeta de las piezas de la Plantilla 9. Por omisión /boletin/p9. */
    base?: string
    /** Carpeta de las joyas de las Cortes. Por omisión /boletin/joyas27. */
    joyas?: string
    /** La dueña puede escribir su mensaje en Ajustes (y cambiar de mes). */
    editar?: boolean
    meses?: Array<{ valor: string, etiqueta: string }>
    mes?: string
    cambiarMes?: (yearMonth: string) => void
    volver?: () => void
    guardarMensaje?: (mensaje: string) => Promise<unknown>
}

export interface BoletinNacional {
    destruir(): void
}

export function crearBoletinNacional(host: HTMLElement, datos: BoletinNacionalDatos, opciones?: BoletinNacionalOpciones): BoletinNacional
