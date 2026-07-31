import { BookOpenIcon, EyeIcon, FileTextIcon, PresentationIcon, type LucideIcon } from "lucide-react"

import { EypleaseFile, FileTypes } from "@/interfaces/files"
import { ITraining } from "@/interfaces/trainings"

export const getTrainingFileByType = (files: EypleaseFile[], type: FileTypes) => {
    return files.find(file => file.type === type) || null
}

export const TRAINING_FILE_NAME = {
    [FileTypes.TRAINING_PPTX]: 'Presentación PowerPoint',
    [FileTypes.TRAINING_PPTX_TO_PDF]: 'PDF PowerPoint',
    [FileTypes.TRAINING_PDF_READING]: 'Guía',
    [FileTypes.TRAINING_PDF_PREVIEW]: 'Prevista PowerPoint en PDF',
}

/** Etiqueta corta: los botones de descarga viven dentro de la tarjeta y el nombre largo no cabe. */
export const TRAINING_FILE_SHORT_NAME = {
    [FileTypes.TRAINING_PPTX]: 'Presentación PPT',
    [FileTypes.TRAINING_PPTX_TO_PDF]: 'PDF PPT',
    [FileTypes.TRAINING_PDF_READING]: 'Guía',
    [FileTypes.TRAINING_PDF_PREVIEW]: 'Prevista',
}

/** Un icono por tipo de archivo para distinguirlos de un vistazo (el tipo es un enum cerrado). */
export const TRAINING_FILE_ICON: Partial<Record<FileTypes, LucideIcon>> = {
    [FileTypes.TRAINING_PPTX]: PresentationIcon,
    [FileTypes.TRAINING_PPTX_TO_PDF]: FileTextIcon,
    [FileTypes.TRAINING_PDF_READING]: BookOpenIcon,
    [FileTypes.TRAINING_PDF_PREVIEW]: EyeIcon,
}

/** Orden fijo: las tarjetas se ven iguales entre sí aunque el API devuelva otro orden. */
const TRAINING_FILE_ORDER = [
    FileTypes.TRAINING_PPTX,
    FileTypes.TRAINING_PPTX_TO_PDF,
    FileTypes.TRAINING_PDF_READING,
    FileTypes.TRAINING_PDF_PREVIEW,
]

/** Archivos que la clienta puede descargar: la portada se excluye porque es la imagen de la tarjeta. */
export const getDownloadableFiles = (files: EypleaseFile[]): EypleaseFile[] =>
    files
        .filter(file => file.type !== FileTypes.TRAINING_COVER)
        .sort((a, b) => TRAINING_FILE_ORDER.indexOf(a.type) - TRAINING_FILE_ORDER.indexOf(b.type))

/** Comparación sin tildes ni mayúsculas: buscar "guia" encuentra "guía". */
const normalize = (value: string) => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

export const matchesTrainingSearch = (training: ITraining, search: string): boolean =>
    !search.trim() || normalize(training.title).includes(normalize(search))
