import { NewsletterTypes } from '@/interfaces/common'
import { IMonthlyReportResponse } from '@/interfaces/monthlyReports'
import { sectionId, subSectionId } from '@/components/reportPreferences/utils'
import { BoletinData, GemKey, Persona, Seccion } from './engine/types'

/**
 * De `GET /reports/unity` (la data cruda de cada sección, la misma que alimenta el PDF) a las
 * secciones del reproductor. Repite aquí las decisiones que el backend toma al armar las láminas
 * (BoletinSectionDataService), para que la versión interactiva diga lo mismo que el PDF:
 *  - Iniciadoras por TRAMOS de inicios (1 a 2 · 3 a 4 · 5 o más), juntando reinas y princesas.
 *  - Club de puntos con su lugar global: el 4.º en adelante (los tres primeros son el Cuadro de Honor).
 *  - Estrellas con «Llevas / Faltan» y, el último mes del trimestre, «Ha ganado con».
 *  - Lo que la Directora ocultó en «Personalizar contenido» no sale (el endpoint no lo filtra).
 */

type Raw = IMonthlyReportResponse<Record<string, unknown> | null> & {
    alternative_photo_url?: string
    /** Estrellas: puntos del trimestre y si ya cerró */
    points?: number
    is_quarter_end?: boolean
}
type Groups = Record<string, Raw[] | undefined>

export interface UnityRaw {
    honor_roll?: Array<Raw | null>
    initiation_cut?: Groups
    points_club?: Groups
    road_to_success?: Groups
    new_beginnings?: Raw[]
    stars?: Groups
    group_production?: Groups
    pink_circle?: Groups
    birthdays?: Raw[]
    anniversaries?: Raw[]
}

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/* Los cortes de Iniciadoras de UNIDAD son los de iniciación personal (MonthlyReportService::TRAMOS_INICIACION_PERSONAL) */
const TRAMOS: Array<{ desde: number, hasta: number | null, label: string, medal: string }> = [
    { desde: 5, hasta: null, label: '5 o más inicios', medal: '5+' },
    { desde: 3, hasta: 4, label: '3 a 4 inicios', medal: '3–4' },
    { desde: 1, hasta: 2, label: '1 a 2 inicios', medal: '1–2' },
]
/* Del club más alto al más bajo: así cuenta el backend el lugar global. `club_1000` agrupa 1,200 a 1,499 */
const CLUBS: Array<[string, number]> = [
    ['club_3000', 3000], ['club_2500', 2500], ['club_2000', 2000], ['club_1500', 1500],
    ['club_1000', 1200], ['club_900', 900], ['club_600', 600], ['club_300', 300],
]
const PARADAS: Array<[string, string, string]> = [
    ['target_future_director', 'Target a Futura Directora', '1 a 4 activas'],
    ['future_director', 'Futura Directora', '5 a 9 activas'],
    ['target_diqs', 'Target a DIQ', '10 o más activas'],
]
const GEMAS: GemKey[] = ['sapphire', 'ruby', 'diamond', 'emerald', 'pearl']
const LUMINARIAS: Array<[string, GemKey]> = [['l_pearl', 'pearl'], ['l_emerald', 'emerald'], ['l_diamond', 'diamond'], ['l_ruby', 'ruby'], ['l_sapphire', 'sapphire']]
const CIRCULO: Array<[string, string, string]> = [
    ['gold', 'VIP Gold', '12 meses o más'],
    ['vip', 'VIP', '6 a 11 meses'],
    ['pink', 'Círculo Rosa', '3 a 5 meses'],
    ['pink_target', 'Target a Círculo Rosa', '1 a 2 meses'],
]

interface Contexto {
    /** «YYYY-MM» del boletín */
    yearMonth: string
    /** Claves ocultas de «Personalizar contenido» (`code|section` y `code|section|sub`) */
    hidden: Set<string>
    colombia: boolean
    directora: { nombre: string, foto?: string }
    arte?: string
    /** Cumpleaños y aniversarios son del mes en que se GENERA (así los pide el backend) */
    hoy?: Date
}

const words = (n: string) => n.split(/\s+/).filter(Boolean)
const shortName = (n: string) => { const w = words(n); return w.length >= 3 ? `${w[0]} ${w[w.length - 2]}` : n }
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim()

export function normalizeUnity(raw: UnityRaw, ctx: Contexto): BoletinData {
    const code = NewsletterTypes.UNITY
    const oculta = (section: string) => ctx.hidden.has(sectionId(code, section))
    const bloques = (section: string, groups?: Groups): Groups => {
        if (!groups) return {}
        return Object.fromEntries(Object.entries(groups).filter(([sub]) => !ctx.hidden.has(subSectionId(code, section, sub))))
    }

    const [anio, mes] = ctx.yearMonth.split('-').map(Number)
    const mesNombre = MESES[mes - 1] ?? ''
    const hoy = ctx.hoy ?? new Date()
    const mesEnCurso = MESES[hoy.getMonth()]

    const personas: Record<string, Persona> = {}
    const persona = (r: Raw): string => {
        const id = r.sponsored_id || r.id
        if (!personas[id]) {
            const foto = r.has_photo ? (r.alternative_photo_url || r.photo_url || undefined) : undefined
            personas[id] = { nombre: (r.sponsored_name || '').trim(), foto }
        }
        return id
    }
    const valor = (r: Raw) => Number(r.report_value) || 0
    const lista = (l?: Raw[] | null) => (Array.isArray(l) ? l.filter(Boolean) : [])

    const secciones: Seccion[] = []

    /* Iniciadoras del mes */
    if (!oculta('initiation_cut')) {
        const gente = Object.values(bloques('initiation_cut', raw.initiation_cut)).flatMap(lista)
        const grupos = TRAMOS.map(t => ({
            label: t.label,
            medal: t.medal,
            items: gente
                .filter(r => valor(r) >= t.desde && (t.hasta === null || valor(r) <= t.hasta))
                .sort((a, b) => valor(b) - valor(a))
                .map(r => ({ p: persona(r), v: valor(r) })),
        }))
        if (grupos.some(g => g.items.length)) {
            secciones.push({ key: 'initiators', tipo: 'tramos', titulo: 'Iniciadoras del mes', sub: 'Por tramos de inicios del mes', grupos })
        }
    }

    /* Club de puntos */
    if (!oculta('points_club')) {
        const visibles = bloques('points_club', raw.points_club)
        let lugar = 4
        const lugares = new Map<Raw, number>()
        /* Igual que el PDF: el lugar se cuenta sobre los clubes que se ven, no sobre los ocultos */
        CLUBS.forEach(([key]) => lista(visibles[key]).forEach(r => lugares.set(r, lugar++)))
        const grupos = CLUBS
            .map(([key, club]) => ({ club, items: lista(visibles[key]).map(r => ({ p: persona(r), v: valor(r), pos: lugares.get(r) ?? 0 })) }))
            .filter(g => g.items.length)
        if (grupos.length) {
            secciones.push({ key: 'points_club', tipo: 'escalera', titulo: 'Club de puntos', sub: 'Puntos de ventas personales del mes · del lugar 4 en adelante', grupos })
        }
    }

    /* Cuadro de Honor: los tres lugares en orden; un lugar sin nadie se conserva vacío */
    if (!oculta('honor_roll')) {
        const items = (raw.honor_roll ?? []).slice(0, 3).map(r => (r ? { p: persona(r), v: valor(r) } : null))
        if (items.some(Boolean)) {
            secciones.push({ key: 'honor_roll', tipo: 'podio', titulo: 'Cuadro de Honor', sub: 'Las tres con más puntos de ventas personales del mes', items })
        }
    }

    /* Camino al éxito */
    if (!oculta('road_to_success')) {
        const visibles = bloques('road_to_success', raw.road_to_success)
        const paradas = PARADAS
            .filter(([key]) => key in visibles)
            .map(([key, label, rango]) => ({
                label,
                rango,
                items: lista(visibles[key]).map(r => {
                    const activas = Number((r.extra_data as Record<string, unknown> | null)?.activas)
                    return { p: persona(r), a: Number.isFinite(activas) && activas > 0 ? activas : undefined }
                }),
            }))
        if (paradas.some(p => p.items.length)) {
            secciones.push({ key: 'road_to_success', tipo: 'camino', titulo: 'Camino al éxito', sub: 'Según sus consultoras activas', paradas })
        }
    }

    /* Nuevos comienzos: la iniciadora llega como NOMBRE; se enlaza si también sale en el boletín */
    const nuevos = oculta('new_beginnings') ? [] : lista(raw.new_beginnings)

    /* Estrellas */
    if (!oculta('stars')) {
        const visibles = bloques('stars', raw.stars)
        const todas = GEMAS.flatMap(g => lista(visibles[g]))
        const cierre = todas.length ? todas.some(r => r.is_quarter_end) : mes % 3 === 0
        const grupos = GEMAS
            .map(gema => ({ gema, items: lista(visibles[gema]).map(r => ({ p: persona(r), v: Number(r.points ?? r.report_value) || 0 })).sort((a, b) => b.v - a.v) }))
            .filter(g => g.items.length)
        if (grupos.length) {
            const inicio = Math.floor((mes - 1) / 3) * 3
            const trimestre = `${MESES[inicio]} – ${MESES[inicio + 2]}`
            secciones.push({
                key: 'stars',
                tipo: 'estrellas',
                titulo: ctx.colombia ? 'Círculo del Éxito' : 'Estrellas trimestrales',
                sub: `Puntos del trimestre ${trimestre} · ${cierre ? 'cierre del trimestre' : 'el trimestre sigue en curso'}`,
                cierre,
                grupos,
            })
        }
    }

    /* Luminarias (Producción de grupo) */
    if (!oculta('group_production')) {
        const visibles = bloques('group_production', raw.group_production)
        const items = LUMINARIAS.flatMap(([key, gema]) => lista(visibles[key]).map(r => ({ p: persona(r), v: valor(r), gema })))
        if (items.length) {
            secciones.push({ key: 'group_production', tipo: 'luminarias', titulo: 'Luminarias del mes', sub: 'Producción de grupo del mes', items })
        }
    }

    /* Círculo Rosa */
    if (!oculta('pink_circle')) {
        const visibles = bloques('pink_circle', raw.pink_circle)
        const grupos = CIRCULO
            .map(([key, label, rango]) => ({ label, rango, items: lista(visibles[key]).map(r => ({ p: persona(r), m: valor(r) })) }))
            .filter(g => g.items.length)
        if (grupos.length) {
            secciones.push({ key: 'pink_circle', tipo: 'circulo', titulo: 'Círculo Rosa', sub: 'Meses seguidos en el programa', grupos })
        }
    }

    /* Cumpleaños: el valor viene como «Y-m-d» */
    if (!oculta('birthdays')) {
        const cumple = lista(raw.birthdays)
            .map(r => ({ r, fecha: String(r.report_value ?? '').split('-').map(Number) }))
            .filter(({ fecha }) => fecha.length === 3 && fecha[2] > 0)
        if (cumple.length) {
            const [y, m] = cumple[0].fecha
            const mesCumple = MESES[m - 1] ?? mesEnCurso
            secciones.push({
                key: 'birthdays', tipo: 'cumple', titulo: '¡Feliz cumpleaños!', sub: `Cumpleaños de ${mesCumple}`,
                anio: y || hoy.getFullYear(), mes: m || hoy.getMonth() + 1, mesNombre: mesCumple,
                items: cumple.map(({ r, fecha }) => ({ p: persona(r), d: fecha[2] })).sort((a, b) => a.d - b.d),
            })
        }
    }

    /* Aniversarios (no es configurable) */
    const aniversarios = lista(raw.anniversaries).filter(r => valor(r) > 0)
    if (aniversarios.length) {
        secciones.push({
            key: 'anniversaries', tipo: 'aniversario', titulo: 'Aniversarios del mes', sub: `Aniversarios de ${mesEnCurso}`, mesNombre: mesEnCurso,
            items: aniversarios.map(r => ({ p: persona(r), y: valor(r) })).sort((a, b) => b.y - a.y),
        })
    }

    /* Nuevos comienzos va después de Camino al éxito, como en el PDF; se arma al final porque
       necesita conocer a toda la gente del boletín para enlazar a su iniciadora */
    if (nuevos.length) {
        const porNombre = new Map(Object.entries(personas).map(([id, p]) => [norm(p.nombre), id]))
        const items = nuevos.map(r => {
            const p = persona(r)
            const iniciadora = String((r.extra_data as Record<string, unknown> | null)?.nombre_completo_iniciadora ?? '').trim()
            const por = iniciadora ? porNombre.get(norm(iniciadora)) : undefined
            return { p, por: por && por !== p ? por : undefined, porNombre: iniciadora || undefined }
        })
        const despuesDe = secciones.findIndex(s => s.key === 'road_to_success')
        const antesDe = secciones.findIndex(s => ['stars', 'group_production', 'pink_circle', 'birthdays', 'anniversaries'].includes(s.key))
        const en = despuesDe >= 0 ? despuesDe + 1 : antesDe >= 0 ? antesDe : secciones.length
        secciones.splice(en, 0, { key: 'new_beginnings', tipo: 'bienvenida', titulo: 'Nuevos comienzos', sub: `Empezaron su negocio en ${mesNombre}`, items })
    }

    return {
        tipo: 'Unidad',
        mes: `${capital(mesNombre)} ${anio}`,
        mesNombre,
        colombia: ctx.colombia,
        directora: { nombre: ctx.directora.nombre, unidad: `Unidad ${shortName(ctx.directora.nombre)}`, foto: ctx.directora.foto },
        personas,
        secciones,
        arte: ctx.arte,
    }
}

/** Carpeta del arte de unidad de una plantilla, a partir de la dirección de su portada. */
export function templateArtBase(pictureUrl?: string): string | undefined {
    const match = pictureUrl?.match(/^(https?:\/\/[^/]+\/public\/templates\/[^/]+)\//)
    return match ? `${match[1]}/unidad` : undefined
}
