import { titleCaseName } from '@/pages/Hoy/lib'

/*
 * El apodo que la Directora le pone a una consultora (David, 26-nov-2026, opción A): es SÓLO de ella y sólo para su
 * seguimiento (Galería, Mi unidad, la tabla de un reto y los mensajes a UNA consultora). Sus piezas, el boletín y lo
 * que ve la consultora en su cuenta siguen con su nombre completo. Mismo criterio que la app (MyUnit/helpers.ts).
 */

/** Cómo la ve su Directora en su seguimiento: su apodo si le puso uno, si no su nombre completo. */
export const shownName = (name: string, nickname?: string | null) => nickname?.trim() || titleCaseName(name.trim())

/** Cómo le habla en un mensaje a ella sola: su apodo, o su primer nombre. */
export const callName = (name: string, nickname?: string | null) => nickname?.trim() || titleCaseName(name.trim().split(/\s+/)[0] ?? '')

/** El apodo, si tiene uno que valga (los espacios solos no cuentan). */
export const nicknameOf = (nickname?: string | null) => nickname?.trim() || null
