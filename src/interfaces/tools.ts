import { EypleaseFile } from "./files"

export enum ToolSectionTypes {
    STAY_INFORMED = 'stay_informed',
    LEARN = 'learn',
    EXPLAIN = 'explain',
    PRODUCTS = 'products',
    PROPOSALS = 'proposals',
    GET_STARTED = 'get_started',
}

export interface ITool {
    id: string
    title: string
    description: string | null
    section: ToolSectionTypes
    created_at: Date
    slug: string
    files: EypleaseFile[]
}

/**
 * Una pieza de la biblioteca que ella guardó. Es una COPIA: la biblioteca se limpia el día 15 del
 * mes siguiente y lo guardado tiene que sobrevivir a eso, así que `tool_id` puede quedar en null.
 */
export interface ISavedTool {
    id: string
    /** La herramienta original, mientras exista. Sirve para pintar «Guardada» en las historias. */
    tool_id: string | null
    title: string
    description: string | null
    section: ToolSectionTypes
    created_at: Date
    files: EypleaseFile[]
}

export interface IToolsFilters {
    section: ToolSectionTypes
    search?: string
}