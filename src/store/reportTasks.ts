import { create } from 'zustand'

import { ReportTask, ReportTaskDownload } from '@/services/reports/types'

// Store global de tareas de generación de boletines. Es deliberadamente "tonto":
// solo guarda el estado de cada tarea y expone reducers para su ciclo de vida.
// Toda la lógica de negocio (fetch + construcción del archivo) vive en
// services/reports/reportGenerator y dirige este store vía getState(), de modo
// que la generación no depende de ningún componente montado.

type ReportTaskInput = Pick<ReportTask, 'type' | 'title'> & Partial<Pick<ReportTask, 'statusText' | 'progress'>>

type State = {
    tasks: ReportTask[]
}

type Actions = {
    /** Crea una tarea en estado "generating" y devuelve su id. */
    addTask: (input: ReportTaskInput) => string
    /** Actualiza el progreso (0–100) y, opcionalmente, el texto del paso. */
    setProgress: (id: string, progress: number | null, statusText?: string) => void
    /** Marca la tarea como lista para descargar. */
    markReady: (id: string, download: ReportTaskDownload, statusText?: string) => void
    /** Marca la tarea como fallida. */
    markError: (id: string, error: string) => void
    /** Quita la tarea de la lista (cerrar/descartar el toast). */
    removeTask: (id: string) => void
}

const createId = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `task-${Date.now()}-${Math.round(Math.random() * 1e6)}`

const useReportTasksStore = create<State & Actions>((set) => ({
    tasks: [],

    addTask: ({ type, title, statusText = 'Preparando...', progress = null }) => {
        const id = createId()
        const task: ReportTask = {
            id,
            type,
            title,
            statusText,
            status: 'generating',
            progress,
            createdAt: Date.now(),
        }
        set(state => ({ tasks: [...state.tasks, task] }))
        return id
    },

    setProgress: (id, progress, statusText) =>
        set(state => ({
            tasks: state.tasks.map(task =>
                task.id === id
                    ? { ...task, progress, ...(statusText !== undefined ? { statusText } : {}) }
                    : task
            ),
        })),

    markReady: (id, download, statusText = 'Listo para descargar') =>
        set(state => ({
            tasks: state.tasks.map(task =>
                task.id === id
                    ? { ...task, status: 'ready', progress: 100, statusText, download }
                    : task
            ),
        })),

    markError: (id, error) =>
        set(state => ({
            tasks: state.tasks.map(task =>
                task.id === id
                    ? { ...task, status: 'error', statusText: 'No se pudo generar', error }
                    : task
            ),
        })),

    removeTask: (id) =>
        set(state => ({ tasks: state.tasks.filter(task => task.id !== id) })),
}))

export default useReportTasksStore
