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
    ajustes?: BoletinNacionalAjustes | null
    [seccion: string]: unknown
}

/** Una directora adoptiva: alguien que no viene en los reportes del Área y que la Nacional reconoce (sólo en el boletín). */
export interface BoletinAdoptiva {
    id: string
    nombre: string
    foto: string | null
    /** Lo que capturó por sección; el motor calcula lo demás (bono, estrella, escalón, lugares). */
    datos: Record<string, unknown>
    /** En «anteriores»: el mes en que la agregó. */
    mes?: string
}

/** Lo que la Directora decide de su boletín de un mes (PUT ajustes y las rutas de adoptivas devuelven lo mismo). */
export interface BoletinNacionalAjustes {
    mensaje: string | null
    adoptivas?: BoletinAdoptiva[]
    /** Las de los 3 meses anteriores que no ha vuelto a agregar a este. */
    anteriores?: BoletinAdoptiva[]
    maxAdoptivas?: number
}

/** Lo que el formulario de Ajustes manda al guardar una adoptiva. */
export interface BoletinAdoptivaGuardar {
    /** null = nueva */
    id: string | null
    nombre: string
    datos: Record<string, unknown>
    /** La foto nueva, ya achicada (JPG). */
    foto: Blob | null
    /** Reusar la foto de cuando la agregó otro mes. */
    fotoDe: string | null
    quitarFoto: boolean
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
    /** Con esto Ajustes deja agregar directoras adoptivas. Cada una devuelve los ajustes del mes ya guardados. */
    adoptivas?: {
        guardar: (adoptiva: BoletinAdoptivaGuardar) => Promise<BoletinNacionalAjustes>
        quitar: (id: string) => Promise<BoletinNacionalAjustes>
    }
}

export interface BoletinNacional {
    destruir(): void
}

export function crearBoletinNacional(host: HTMLElement, datos: BoletinNacionalDatos, opciones?: BoletinNacionalOpciones): BoletinNacional
