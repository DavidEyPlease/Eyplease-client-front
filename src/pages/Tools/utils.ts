import { BellRingIcon, BriefcaseIcon, CircleDashedIcon, ImageIcon, LucideIcon, ShoppingBagIcon, ZapIcon } from 'lucide-react'

import { ToolSectionTypes } from '@/interfaces/tools'
import { sanitizeFileName } from '@/utils'

/** Iconos por sección: el enum es cerrado, el mapa no crece solo. */
export const TOOL_SECTION_ICON: Record<ToolSectionTypes, LucideIcon> = {
    [ToolSectionTypes.PROPOSALS]: BriefcaseIcon,
    [ToolSectionTypes.PRODUCTS]: ShoppingBagIcon,
    [ToolSectionTypes.GET_STARTED]: ZapIcon,
    [ToolSectionTypes.STAY_INFORMED]: BellRingIcon,
    [ToolSectionTypes.LEARN]: ImageIcon,
    [ToolSectionTypes.EXPLAIN]: CircleDashedIcon,
}

/** Orden de las secciones en los filtros (el mismo que tenía la vista anterior). */
export const TOOL_SECTIONS_ORDER = [
    ToolSectionTypes.PROPOSALS,
    ToolSectionTypes.PRODUCTS,
    ToolSectionTypes.GET_STARTED,
    ToolSectionTypes.STAY_INFORMED,
    ToolSectionTypes.LEARN,
    ToolSectionTypes.EXPLAIN,
]

/** Proporción vertical por defecto del tile (4:5) mientras no se conoce la real. */
export const DEFAULT_TILE_ASPECT = 4 / 5
/** Tope de altura: historias verticales 9:16. */
const MIN_TILE_ASPECT = 9 / 16

/** Ajusta la proporción medida de la pieza al rango vertical que soporta el mural. */
export const clampTileAspect = (ratio: number) => Math.min(Math.max(ratio, MIN_TILE_ASPECT), DEFAULT_TILE_ASPECT)

/** Mismo nombre de descarga que usaba la vista anterior: `2-titulo.ext`. */
export const buildToolFileName = (title: string, fileIndex: number, ext: string) =>
    `${fileIndex + 1}-${sanitizeFileName(title)}.${ext}`

export const isToolNew = (createdAt: Date) => {
    const today = new Date()
    const created = new Date(createdAt)

    return created.getDate() === today.getDate() &&
        created.getMonth() === today.getMonth() &&
        created.getFullYear() === today.getFullYear()
}

export const formatFilesCount = (count: number) => `${count} ${count === 1 ? 'archivo' : 'archivos'}`

/** Botón circular de cristal sobre la pieza (flechas, cerrar). */
export const MEDIA_CONTROL_CLASSES = 'grid size-9 cursor-pointer place-content-center rounded-full border-0 bg-card/90 text-foreground shadow-md backdrop-blur-sm transition-colors hover:bg-card hover:text-primary'
