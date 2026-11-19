import { IChatConversation } from '@/interfaces/chat'

/*
 * «Seguir donde se quedó» (opción A, David 19-nov-2026: «Sí, me late la opción A»). Revisión del 11-nov: de 253
 * conversaciones sólo 8 se retomaron otro día, 51 veces abrieron una nueva menos de una hora después de la anterior y en
 * muchas el Asistente se quedó esperando su respuesta («¿Se lo pido así?»). Ahora (web y app, igual):
 *  - si su última conversación es de HOY, el Asistente abre en ésa;
 *  - si es de otro día, empieza en blanco y arriba sale «Seguir: …» para volver a ella con un toque.
 * Para un tema nuevo el mismo día está «+», como antes.
 */

/** Cuándo habló por última vez en esa conversación */
export const lastActivity = (conversation: Pick<IChatConversation, 'last_message_at' | 'created_at'>) =>
	conversation.last_message_at ?? conversation.created_at

/** ¿Es del mismo día, en la hora de su computadora o teléfono? */
export const sameDay = (iso: string | null | undefined, now = new Date()) => {
	if (!iso) return false
	const date = new Date(iso)
	return !Number.isNaN(date.getTime()) && date.toDateString() === now.toDateString()
}

/** «hoy», «ayer», «el martes» (en la última semana) o «el 12 de octubre» */
export const whenLabel = (iso: string, now = new Date()) => {
	const date = new Date(iso)
	const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
	const days = Math.round((start(now) - start(date)) / 86_400_000)
	if (days <= 0) return 'hoy'
	if (days === 1) return 'ayer'
	if (days < 7) return `el ${date.toLocaleDateString('es-MX', { weekday: 'long' })}`
	return `el ${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', ...(date.getFullYear() !== now.getFullYear() ? { year: 'numeric' } : {}) })}`
}
