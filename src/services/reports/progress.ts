// Callback de progreso que los builders invocan en cada paso. Recibe el texto del
// paso y el porcentaje (0–100). Puede ser async para dar un pequeño respiro entre
// pasos y que la animación del toast se perciba fluida.
export type ReportProgressFn = (statusText: string, progress: number) => Promise<void> | void
