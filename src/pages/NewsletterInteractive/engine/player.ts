/**
 * Reproductor del boletín interactivo.
 *
 * Se monta dentro de un Shadow DOM: sus estilos no tocan la web y los de la web (Tailwind)
 * no lo tocan a él. Es el mismo motor de la propuesta aprobada (21-oct-2026), ahora con la
 * data real del boletín. Cada sección tiene su coreografía; la piel es una ficha de variables.
 */
import css from './player.css?inline'
import { BoletinData, FormatKey, GemKey, Seccion, SkinKey } from './types'

export interface BoletinPlayer {
    setSkin: (skin: SkinKey) => void
    setFormat: (format: FormatKey) => void
    destroy: () => void
}

interface PlayerOptions {
    skin: SkinKey
    format: FormatKey
}

/* ---------------- reglas oficiales (las mismas del backend) ---------------- */
const CLUBS = [300, 600, 900, 1200, 1500, 2000, 2500, 3000]
const GEMAS: Record<GemKey, { n: string, meta: number, c: string }> = {
    sapphire: { n: 'Zafiro', meta: 3600, c: '#3D6BF0' },
    ruby: { n: 'Rubí', meta: 4800, c: '#E0314B' },
    diamond: { n: 'Diamante', meta: 6000, c: '#8EC3EE' },
    emerald: { n: 'Esmeralda', meta: 7200, c: '#1FA36B' },
    pearl: { n: 'Perla', meta: 10000, c: '#CDB49A' },
}
const LUMINARIAS: Record<GemKey, [number, number | null]> = {
    sapphire: [3600, 4799], ruby: [4800, 5999], diamond: [6000, 7199], emerald: [7200, 9999], pearl: [10000, null],
}

/* ---------------- pieles ---------------- */
interface Skin {
    particles: { n: number, mode: 'spark' | 'bokeh' | 'dot' | 'dust', colors: string[] }
    confetti: string[]
    art?: boolean
}
export const SKINS: Record<SkinKey, Skin & { label: string, sw: string }> = {
    plantilla: { label: 'Tu plantilla', sw: 'linear-gradient(135deg,#1a0a12 45%,#F0AAC8)', particles: { n: 40, mode: 'spark', colors: ['#F0AAC8', '#ffffff', '#E7B7A0'] }, confetti: ['#F0AAC8', '#ffffff', '#E7B7A0', '#c86b93'], art: true },
    gala: { label: 'Gala', sw: 'linear-gradient(135deg,#120a10 45%,#E9C77B)', particles: { n: 46, mode: 'spark', colors: ['#E9C77B', '#fff3d8', '#F3B6C9'] }, confetti: ['#E9C77B', '#fff3d8', '#F3B6C9', '#b98a3e', '#ffffff'] },
    rosa: { label: 'Rosa perla', sw: 'linear-gradient(135deg,#fff0f5 40%,#C2185B)', particles: { n: 26, mode: 'bokeh', colors: ['#ffffff', '#f7c6d7', '#fde7ef'] }, confetti: ['#C2185B', '#E79AB8', '#ffffff', '#f6c1d3', '#d6a46a'] },
    eyplease: { label: 'Eyplease', sw: 'linear-gradient(135deg,#5B47E0,#2CD4D9)', particles: { n: 34, mode: 'dot', colors: ['#6C47FF', '#2CD4D9', '#b8adff'] }, confetti: ['#5B47E0', '#2CD4D9', '#6C47FF', '#ffd36b', '#ffffff'] },
    marmol: { label: 'Mármol y oro', sw: 'linear-gradient(135deg,#f4efe7 45%,#A9824A)', particles: { n: 40, mode: 'dust', colors: ['#c9a46a', '#e6cf9f'] }, confetti: ['#A9824A', '#e6cf9f', '#2c2a27', '#ffffff'] },
}

/* Portada de cada sección en la carpeta de la plantilla: los mismos archivos que imprime el PDF. */
const ARTE: Record<string, string> = {
    portada: 'hoja_inicial', initiators: 'portada_iniciadoras', points_club: 'ranking', honor_roll: 'portada_cuadro_de_honor',
    road_to_success: 'portada_camino_al_exito', new_beginnings: 'portada_nuevos_inicios', stars: 'portada_estrellas',
    group_production: 'portada_luminaria', pink_circle: 'portada_cr', birthdays: 'portada_cumples',
    anniversaries: 'portada_aniversarios', cierre: 'hoja_final',
}

const DUR: Record<string, number> = { portada: 7000, tramos: 7000, escalera: 10000, podio: 9000, camino: 9000, bienvenida: 8000, estrellas: 10000, luminarias: 7000, circulo: 10000, cumple: 8000, aniversario: 7000, cierre: 9000 }
const COVER_MS = 1500

/* ---------------- iconos ---------------- */
const I = {
    play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z"/></svg>',
    pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1.2"/><rect x="13.5" y="5" width="4" height="14" rx="1.2"/></svg>',
    prev: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
    next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>',
    fs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    crown: '<svg class="crown" viewBox="0 0 64 44" aria-hidden="true"><path d="M4 14l14 12L32 4l14 22 14-12-6 26H10z" fill="currentColor"/><circle cx="4" cy="12" r="4" fill="currentColor"/><circle cx="32" cy="4" r="4" fill="currentColor"/><circle cx="60" cy="12" r="4" fill="currentColor"/></svg>',
    gem: '<svg class="gem-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.2 3h11.6l4.2 6.1L12 21 2 9.1z" fill="var(--gem)" stroke="rgba(0,0,0,.28)" stroke-width=".6"/><path d="M2 9.1h20M8.6 3 12 9.1 15.4 3M12 9.1V21M8.6 3 6.6 9.1 12 21M15.4 3l2 6.1L12 21" fill="none" stroke="rgba(255,255,255,.6)" stroke-width=".55"/></svg>',
}

/* ---------------- nombres ---------------- */
const words = (n: string) => n.split(/\s+/).filter(Boolean)
const short = (n: string) => { const w = words(n); return w.length >= 3 ? `${w[0]} ${w[w.length - 2]}` : n }
const ini = (n: string) => {
    const w = words(n)
    if (!w.length) return '·'
    const b = w.length >= 3 ? w[w.length - 2] : (w[1] || '')
    return (w[0][0] + (b[0] || '')).toUpperCase()
}
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
const plural = (n: number, uno: string, varios: string) => (n === 1 ? uno : varios)
const esc = (s: string) => s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch] as string)

type Capitulo =
    | { kind: 'portada', tipo: 'portada' }
    | { kind: 'cierre', tipo: 'cierre' }
    | { kind: 'seccion', tipo: Seccion['tipo'], s: Seccion }

interface Reconocimiento { ch: number, sec: string, det: string }
interface Meta { club?: number, estrella?: { gema: GemKey, v: number }, cr?: number, activas?: number }

export function createBoletinPlayer(host: HTMLElement, B: BoletinData, options: PlayerOptions): BoletinPlayer {
    const RM = window.matchMedia('(prefers-reduced-motion: reduce)')
    const locale = B.colombia ? 'es-CO' : 'es-MX'
    const fmt = (n: number) => Number(n).toLocaleString(locale)
    const P = B.personas
    const nombre = (p: string) => P[p]?.nombre ?? ''
    const ordenGemas: GemKey[] = B.colombia ? ['sapphire', 'ruby', 'diamond', 'emerald'] : ['sapphire', 'ruby', 'diamond', 'emerald', 'pearl']
    const estrella = (g: GemKey) => (B.colombia ? `Círculo del Éxito · ${GEMAS[g].n}` : `Estrella ${GEMAS[g].n}`)

    /* ---------------- capítulos e índice por persona ---------------- */
    const CH: Capitulo[] = [
        { kind: 'portada', tipo: 'portada' },
        ...B.secciones.map(s => ({ kind: 'seccion' as const, tipo: s.tipo, s })),
        { kind: 'cierre', tipo: 'cierre' },
    ]
    const NSEC = B.secciones.length

    const IDX: Record<string, Reconocimiento[]> = {}
    const INICIO: Record<string, string[]> = {}
    const META: Record<string, Meta> = {}
    const add = (p: string, ch: number, sec: string, det: string) => { (IDX[p] ||= []).push({ ch, sec, det }) }
    const meta = (p: string) => (META[p] ||= {})
    let cierreEstrellas = false

    B.secciones.forEach((s, i) => {
        const ch = i + 1
        switch (s.tipo) {
            case 'tramos':
                s.grupos.forEach(g => g.items.forEach(it => add(it.p, ch, `Iniciadoras del mes · ${g.label}`, `${it.v} ${plural(it.v, 'inicio', 'inicios')}`)))
                break
            case 'escalera':
                s.grupos.forEach(g => g.items.forEach(it => { add(it.p, ch, `Club de puntos · Club ${fmt(g.club)}`, `Lugar ${it.pos} · ${fmt(it.v)} puntos`); meta(it.p).club = it.v }))
                break
            case 'podio':
                s.items.forEach((it, k) => { if (it) add(it.p, ch, `Cuadro de Honor · ${['1er', '2do', '3er'][k]} lugar`, `${fmt(it.v)} puntos`) })
                break
            case 'camino':
                s.paradas.forEach(st => st.items.forEach(it => {
                    add(it.p, ch, `Camino al éxito · ${st.label}`, it.a != null ? `${it.a} ${plural(it.a, 'activa', 'activas')}` : st.rango)
                    if (it.a != null) meta(it.p).activas = it.a
                }))
                break
            case 'bienvenida':
                s.items.forEach(it => {
                    const por = it.por ? short(nombre(it.por)) : it.porNombre
                    add(it.p, ch, 'Nuevos comienzos · Bienvenida', por ? `Iniciada por ${por}` : 'Empezó este mes')
                    if (it.por) (INICIO[it.por] ||= []).push(it.p)
                })
                break
            case 'estrellas':
                cierreEstrellas = s.cierre
                s.grupos.forEach(g => g.items.forEach(it => {
                    const G = GEMAS[g.gema]
                    add(it.p, ch, `Estrellas · ${G.n}`, s.cierre ? `Ha ganado con ${fmt(it.v)} puntos` : `Llevas ${fmt(it.v)} · Faltan ${fmt(Math.max(0, G.meta - it.v))}`)
                    if (!s.cierre) meta(it.p).estrella = { gema: g.gema, v: it.v }
                }))
                break
            case 'luminarias':
                s.items.forEach(it => add(it.p, ch, `Luminarias · ${GEMAS[it.gema].n}`, `${fmt(it.v)} puntos de producción de grupo`))
                break
            case 'circulo':
                s.grupos.forEach(g => g.items.forEach(it => { add(it.p, ch, `Círculo Rosa · ${g.label}`, `${it.m} ${plural(it.m, 'mes seguido', 'meses seguidos')}`); meta(it.p).cr = it.m }))
                break
            case 'cumple':
                s.items.forEach(it => add(it.p, ch, 'Cumpleaños', `${it.d} de ${s.mesNombre}`))
                break
            case 'aniversario':
                s.items.forEach(it => add(it.p, ch, 'Aniversario', `${it.y} ${plural(it.y, 'año', 'años')}`))
                break
        }
    })
    const TOTAL = Object.values(IDX).reduce((a, l) => a + l.length, 0)
    const PERSONAS = Object.keys(IDX).length
    const MOST = Object.entries(IDX).map(([p, l]) => [p, l.length] as const).sort((a, b) => b[1] - a[1]).slice(0, 5)

    /* Lo que sigue: sólo con las reglas oficiales. */
    function siguientes(p: string): string[] {
        const m = META[p] || {}
        const out: string[] = []
        if (m.club != null) {
            const nxt = CLUBS.find(c => c > (m.club as number))
            out.push(nxt ? `Le faltan <b>${fmt(nxt - m.club)} puntos</b> para el Club ${fmt(nxt)}.` : 'Está en el club más alto.')
        }
        if (m.estrella) {
            const G = GEMAS[m.estrella.gema]
            out.push(`Para asegurar <b>${G.n}</b> al cerrar el trimestre: <b>${fmt(Math.max(0, G.meta - m.estrella.v))} puntos</b>.`)
            const sig = ordenGemas[ordenGemas.indexOf(m.estrella.gema) + 1]
            if (sig) out.push(`Para <b>${GEMAS[sig].n}</b>: <b>${fmt(Math.max(0, GEMAS[sig].meta - m.estrella.v))} puntos</b>.`)
        }
        if (m.cr != null) {
            const falta = (n: number) => `Le ${plural(n, 'falta', 'faltan')} <b>${n} ${plural(n, 'mes seguido', 'meses seguidos')}</b>`
            if (m.cr < 3) out.push(`${falta(3 - m.cr)} para Círculo Rosa.`)
            else if (m.cr < 6) out.push(`${falta(6 - m.cr)} para VIP.`)
            else if (m.cr < 12) out.push(`${falta(12 - m.cr)} para VIP Gold.`)
            else out.push('Mantiene <b>VIP Gold</b>: cada mes suma a su racha.')
        }
        if (m.activas != null) {
            const falta = (n: number, a: string) => `Le ${plural(n, 'falta', 'faltan')} <b>${n} ${plural(n, 'activa', 'activas')}</b> para ${a}.`
            if (m.activas < 5) out.push(falta(5 - m.activas, 'Futura Directora'))
            else if (m.activas < 10) out.push(falta(10 - m.activas, 'Target a DIQ'))
        }
        return out
    }

    /* ---------------- piezas ---------------- */
    const av = (p: string, cls = '') => {
        const foto = P[p]?.foto
        return `<span class="av ${cls}" aria-hidden="true">${esc(ini(nombre(p)))}${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : ''}</span>`
    }
    const avDir = (cls = '') => `<span class="av ${cls}" aria-hidden="true">${esc(ini(B.directora.nombre))}${B.directora.foto ? `<img src="${esc(B.directora.foto)}" alt="">` : ''}</span>`
    const nm = (p: string) => esc(short(nombre(p)))
    const cu = (to: number, delay: number, dur = 1200) => `<span class="num" data-to="${to}" data-delay="${delay}" data-dur="${dur}">${fmt(to)}</span>`
    const head = (s: Seccion, n: number) => `
        <header class="s-head">
            <div class="s-kicker a">Sección ${n} de ${NSEC}</div>
            <h2 class="s-title a" style="--i:1">${esc(s.titulo)}</h2>
            <div class="s-sub a" style="--i:2">${esc(s.sub)}</div>
        </header>`

    /* ---------------- coreografías ---------------- */
    const R = {
        portada() {
            const d = B.directora
            return `
                <div class="portada">
                    <div class="p-photo a pop">${avDir()}</div>
                    <div>
                        <span class="p-badge a" style="--i:1">Boletín de ${B.tipo} · ${esc(B.mes)}</span>
                        <h2 class="p-title a" style="--i:2">Reconocimientos <em>del mes</em></h2>
                        <div class="p-name a" style="--i:3">${esc(d.nombre)}</div>
                        <div class="p-unidad a" style="--i:4">${esc(d.unidad)}</div>
                        <div class="p-stats a" style="--i:5">
                            <div><b>${cu(TOTAL, 900)}</b><span>Reconocimientos</span></div>
                            <div><b>${cu(PERSONAS, 1000)}</b><span>Personas</span></div>
                            <div><b>${cu(NSEC, 1100, 800)}</b><span>Secciones</span></div>
                        </div>
                        <button type="button" class="p-start a" style="--i:6" data-go="1">Comenzar ${I.arrow}</button>
                    </div>
                </div>`
        },

        tramos(s: Extract<Seccion, { tipo: 'tramos' }>, n: number) {
            const gs = s.grupos.filter(g => g.items.length)
            return head(s, n) + `
                <div class="s-body"><div class="tramos">
                    ${gs.map((g, gi) => `
                        <section class="tramo a" style="--i:${gi};--d:250ms">
                            <div class="t-badge"><span class="t-medal" style="animation-delay:${300 + gi * 200}ms, ${1400 + gi * 200}ms">${g.medal}</span>
                                <div><b>${esc(g.label)}</b><span>${g.items.length} ${plural(g.items.length, 'iniciadora', 'iniciadoras')}</span></div></div>
                            <div class="t-people">
                                ${g.items.map((it, i) => `
                                    <button type="button" class="chip a pop" data-p="${it.p}" style="--i:${i};--d:${600 + gi * 250}ms">${av(it.p)}
                                        <span class="tx"><span class="nm">${nm(it.p)}</span></span>
                                        <span class="t-count"><b>${cu(it.v, 800 + gi * 250 + i * 120, 700)}</b><small>${plural(it.v, 'inicio', 'inicios')}</small></span>
                                    </button>`).join('')}
                            </div>
                        </section>`).join('')}
                </div></div>`
        },

        escalera(s: Extract<Seccion, { tipo: 'escalera' }>, n: number) {
            const clubs = s.grupos.filter(g => g.items.length).sort((a, b) => a.club - b.club)
            const tope = clubs[clubs.length - 1].club
            const siguiente = CLUBS.find(c => c > tope)
            return head(s, n) + `
                <div class="s-body"><div class="stairs">
                    ${clubs.map((g, k) => `
                        <div class="step" style="--lvl:${k}">
                            <div class="step-people">
                                ${g.items.slice().sort((a, b) => a.pos - b.pos).map((it, i) => `
                                    <button type="button" class="chip" data-p="${it.p}" style="--i:${i}">${av(it.p)}
                                        <span class="tx"><span class="nm">${nm(it.p)}</span><span class="vl">${cu(it.v, 650 + k * 220 + i * 70, 900)} pts</span></span>
                                        <span class="pos">#${it.pos}</span>
                                    </button>`).join('')}
                            </div>
                            <div class="step-base"><span>Club</span><b>${fmt(g.club)}</b></div>
                        </div>`).join('')}
                    ${siguiente ? `
                        <div class="step goal" style="--lvl:${clubs.length}">
                            <div class="goal-tx">La siguiente meta</div>
                            <div class="step-base"><span>Club</span><b>${fmt(siguiente)}</b></div>
                        </div>` : ''}
                </div></div>
                <p class="note a" style="--d:1400ms">Los lugares 1, 2 y 3 están en el Cuadro de Honor.</p>`
        },

        podio(s: Extract<Seccion, { tipo: 'podio' }>, n: number) {
            const persona = (it: { p: string, v: number }, lugar: number, cls: string, delay: number) => `
                <button type="button" class="pd-person" data-p="${it.p}">
                    ${lugar === 1 ? I.crown : ''}${av(it.p, cls)}
                    <span class="pd-place">${['', '1er lugar', '2do lugar', '3er lugar'][lugar]}</span>
                    <span class="pd-name">${nm(it.p)}</span>
                    <span class="pd-pts">${cu(it.v, delay, 1100)}</span><span class="vl">puntos</span>
                </button>`
            /* Orden del podio: 2.º · 1.º · 3.º. Un lugar sin nadie (mínimo de puntos) no se pinta */
            const lugares = [
                { lugar: 2, it: s.items[1], cls: 'silver', delay: 1300, fr: '1fr' },
                { lugar: 1, it: s.items[0], cls: 'gold', delay: 2200, fr: '1.15fr' },
                { lugar: 3, it: s.items[2], cls: 'bronze', delay: 800, fr: '1fr' },
            ].filter(l => l.it)
            if (s.items[0]) later(() => confettiAt(scene.querySelector('.pd.p1 .av'), 150, 1.1), 2450)
            return head(s, n) + `
                <div class="s-body"><div class="podium" style="grid-template-columns:${lugares.map(l => l.fr).join(' ')}">
                    ${lugares.map(l => `<div class="pd p${l.lugar}">${persona(l.it as { p: string, v: number }, l.lugar, l.cls, l.delay)}<div class="pd-block">${l.lugar}</div></div>`).join('')}
                </div></div>`
        },

        camino(s: Extract<Seccion, { tipo: 'camino' }>, n: number) {
            return head(s, n) + `
                <div class="s-body"><div class="road">
                    <div class="road-line"><i></i></div>
                    ${s.paradas.map((st, k) => `
                        <div class="stop ${st.items.length ? '' : 'empty'}" style="--i:${k}">
                            <div class="stop-card">
                                <div class="stop-n">Parada ${k + 1}</div>
                                <div class="stop-name">${esc(st.label)}</div>
                                <div class="stop-range">${esc(st.rango)}</div>
                                <div class="stop-people">
                                    ${st.items.length ? st.items.map(it => `
                                        <button type="button" class="chip" data-p="${it.p}">${av(it.p)}
                                            <span class="tx"><span class="nm">${nm(it.p)}</span>${it.a != null ? `<span class="vl">${it.a} ${plural(it.a, 'activa', 'activas')}</span>` : ''}</span>
                                        </button>`).join('') : 'La siguiente parada del camino'}
                                </div>
                            </div>
                        </div>`).join('')}
                </div></div>`
        },

        bienvenida(s: Extract<Seccion, { tipo: 'bienvenida' }>, n: number) {
            return head(s, n) + `
                <div class="s-body"><div class="welcome">
                    ${s.items.map((it, i) => `
                        <article class="wcard" style="--i:${i}">
                            <span class="w-k">Bienvenida</span>
                            <button type="button" class="w-av" data-p="${it.p}" aria-label="${esc(nombre(it.p))}">${av(it.p, 'lg')}</button>
                            <button type="button" class="w-name" data-p="${it.p}">${nm(it.p)}</button>
                            ${it.por || it.porNombre ? `
                                <div class="w-by"><span>Iniciada por</span>
                                    ${it.por
                                        ? `<button type="button" data-p="${it.por}">${av(it.por)}<span>${nm(it.por)}</span></button>`
                                        : `<span class="w-by-name">${esc(short(it.porNombre as string))}</span>`}
                                </div>` : ''}
                        </article>`).join('')}
                </div></div>`
        },

        estrellas(s: Extract<Seccion, { tipo: 'estrellas' }>, n: number) {
            const gs = s.grupos.filter(g => g.items.length)
            return head(s, n) + `
                <div class="s-body"><div class="gems">
                    ${gs.map((g, gi) => {
                        const G = GEMAS[g.gema]
                        return `
                            <section class="gem-group a" style="--i:${gi};--d:200ms;--gem:${G.c}">
                                <div class="gem-head">${I.gem}<div><b>${estrella(g.gema)}</b><span>Meta del trimestre: ${fmt(G.meta)} puntos</span></div></div>
                                ${g.items.map((it, i) => `
                                    <button type="button" class="star-row" data-p="${it.p}">${av(it.p)}
                                        <span class="nm">${nm(it.p)}</span>
                                        <span class="bar"><i data-w="${s.cierre ? 100 : Math.min(100, (it.v / G.meta) * 100).toFixed(1)}" data-delay="${600 + gi * 220 + i * 140}"></i></span>
                                        ${s.cierre
                                            ? `<span class="bar-tx"><span>Ha ganado con <b>${fmt(it.v)}</b> puntos</span></span>`
                                            : `<span class="bar-tx"><span>Llevas <b>${fmt(it.v)}</b></span><span>Faltan <b>${fmt(Math.max(0, G.meta - it.v))}</b></span></span>`}
                                    </button>`).join('')}
                            </section>`
                    }).join('')}
                </div></div>`
        },

        luminarias(s: Extract<Seccion, { tipo: 'luminarias' }>, n: number) {
            return head(s, n) + `
                <div class="s-body"><div class="lights">
                    ${s.items.map((it, i) => {
                        const G = GEMAS[it.gema]
                        const [lo, hi] = LUMINARIAS[it.gema]
                        return `
                            <button type="button" class="light" data-p="${it.p}" style="--i:${i};--gem:${G.c}">
                                <span class="lamp">${av(it.p)}</span>
                                <span class="lv">Luminaria ${G.n}</span>
                                <span class="nm">${nm(it.p)}</span>
                                <span class="pts">${cu(it.v, 800 + i * 250, 1200)}</span>
                                <span class="rng">${hi ? `${fmt(lo)} a ${fmt(hi)}` : `${fmt(lo)} o más`} puntos</span>
                            </button>`
                    }).join('')}
                </div></div>`
        },

        circulo(s: Extract<Seccion, { tipo: 'circulo' }>, n: number) {
            let d = 250
            const anillo = (it: { p: string, m: number }, i: number, base: number) => {
                const lleno = Math.min(12, it.m)
                const segs = Array.from({ length: 12 }, (_, k) => `
                    <circle class="seg-b" cx="18" cy="18" r="15.9" pathLength="120" stroke-dasharray="8.4 111.6" stroke-dashoffset="${-k * 10}"/>
                    <circle class="seg-f" cx="18" cy="18" r="15.9" pathLength="120" stroke-dasharray="8.4 111.6" stroke-dashoffset="${-k * 10}" ${k < lleno ? `data-on data-delay="${base + 350 + i * 70 + k * 55}"` : ''}/>`).join('')
                return `
                    <button type="button" class="rcard" data-p="${it.p}" style="--i:${i};--d:${base}ms">
                        <span class="ring ${it.m >= 12 ? 'full' : ''}"><svg viewBox="0 0 36 36">${segs}</svg>
                            <span class="rc"><b>${cu(it.m, base + 350 + i * 70, 900)}</b><small>${plural(it.m, 'mes', 'meses')}</small></span></span>
                        <span class="nm">${nm(it.p)}</span>
                    </button>`
            }
            const gs = s.grupos.filter(g => g.items.length)
            return head(s, n) + `
                <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="oroRing" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="#FFE7A3"/><stop offset=".55" stop-color="#E3B04B"/><stop offset="1" stop-color="#A9772A"/></linearGradient></defs></svg>
                <div class="s-body"><div class="rings">
                    ${gs.map(g => {
                        const html = `
                            <section class="ring-group">
                                <h4 class="a" style="--d:${d}ms">${esc(g.label)}<span>${esc(g.rango)}</span></h4>
                                <div class="ring-row">${g.items.map((it, i) => anillo(it, i, d)).join('')}</div>
                            </section>`
                        d += g.items.length * 70 + 260
                        return html
                    }).join('')}
                </div></div>`
        },

        cumple(s: Extract<Seccion, { tipo: 'cumple' }>, n: number) {
            const dias = new Date(s.anio, s.mes, 0).getDate()
            const primero = new Date(s.anio, s.mes - 1, 1).getDay() // 0 = domingo
            const hits: Record<number, number> = {}
            s.items.forEach((it, i) => { if (!(it.d in hits)) hits[it.d] = i })
            const celdas = [
                ...['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(x => `<span class="dn">${x}</span>`),
                ...Array.from({ length: primero }, () => '<span></span>'),
                ...Array.from({ length: dias }, (_, k) => {
                    const dia = k + 1
                    return dia in hits ? `<span class="hit" style="--i:${hits[dia]}">${dia}</span>` : `<span>${dia}</span>`
                }),
            ].join('')
            return head(s, n) + `
                <div class="s-body"><div class="bday">
                    <div class="cal a" style="--d:200ms"><div class="cal-h">${esc(s.mesNombre)} ${s.anio}</div><div class="cal-g">${celdas}</div></div>
                    <div class="cakes">
                        ${s.items.map((it, i) => `
                            <div class="cake" style="--i:${i}">
                                <button type="button" class="blow" data-blow aria-label="Apagar la vela"><span class="candle"></span></button>
                                <button type="button" class="who" data-p="${it.p}">${av(it.p)}
                                    <span class="tx"><span class="nm">${nm(it.p)}</span><span class="when">${it.d} de ${esc(s.mesNombre)}</span></span>
                                </button>
                            </div>`).join('')}
                    </div>
                </div></div>
                <p class="note a" style="--d:1300ms">Toca la vela para apagarla.</p>`
        },

        aniversario(s: Extract<Seccion, { tipo: 'aniversario' }>, n: number) {
            return head(s, n) + `
                <div class="s-body"><div class="annis">
                    ${s.items.map((it, i) => `
                        <button type="button" class="anni" data-p="${it.p}" style="--i:${i}">
                            <span class="ribbon">Aniversario</span>${av(it.p, 'lg')}
                            <span class="nm">${nm(it.p)}</span>
                            <span class="yrs">${cu(it.y, 600 + i * 220, 1000)}</span>
                            <span class="yrs-l">${plural(it.y, 'año', 'años')}</span>
                        </button>`).join('')}
                </div></div>`
        },

        cierre() {
            const seccionesDe = (p: string) => [...new Set(IDX[p].map(r => r.sec.split(' · ')[0]))].join(' · ')
            return `
                <div class="closing">
                    <div>
                        <span class="s-kicker a">Boletín de ${B.tipo} · ${esc(B.mes)}</span>
                        <h3 class="a" style="--i:1">¡Muchas gracias!</h3>
                        <p class="a" style="--i:2">${TOTAL} ${plural(TOTAL, 'reconocimiento', 'reconocimientos')} para ${PERSONAS} ${plural(PERSONAS, 'persona', 'personas')} de ${esc(B.directora.unidad)}.</p>
                        <div class="btns a" style="--i:3">
                            <button type="button" class="hud-btn" data-go="0">Volver a ver</button>
                            <button type="button" class="hud-btn" data-search>${I.search} Buscar a alguien</button>
                        </div>
                    </div>
                    <div class="most">
                        <span class="k a" style="--i:2">Con más reconocimientos este mes</span>
                        ${MOST.map(([p, k], i) => `
                            <button type="button" class="chip a" data-p="${p}" style="--i:${i + 3}">${av(p)}
                                <span class="tx"><span class="nm">${nm(p)}</span><span class="vl">${esc(seccionesDe(p))}</span></span>
                                <span class="badge">${k}</span>
                            </button>`).join('')}
                    </div>
                </div>`
        },
    }

    const pintarCapitulo = (c: Capitulo, n: number): string => {
        if (c.kind === 'portada') return R.portada()
        if (c.kind === 'cierre') return R.cierre()
        const s = c.s
        switch (s.tipo) {
            case 'tramos': return R.tramos(s, n)
            case 'escalera': return R.escalera(s, n)
            case 'podio': return R.podio(s, n)
            case 'camino': return R.camino(s, n)
            case 'bienvenida': return R.bienvenida(s, n)
            case 'estrellas': return R.estrellas(s, n)
            case 'luminarias': return R.luminarias(s, n)
            case 'circulo': return R.circulo(s, n)
            case 'cumple': return R.cumple(s, n)
            case 'aniversario': return R.aniversario(s, n)
        }
    }

    /* ---------------- escenario ---------------- */
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>${css}</style><div class="stage" data-skin="${options.skin}" data-format="${options.format}" tabindex="0" aria-label="Boletín interactivo"></div>`
    const stage = root.querySelector('.stage') as HTMLDivElement
    const state = { skin: options.skin, format: options.format, ch: 0, playing: false, elapsed: 0, total: 0, last: 0, raf: 0 }
    let timers: number[] = []
    let destroyed = false
    const later = (fn: () => void, ms: number) => { timers.push(window.setTimeout(fn, ms)) }
    const artUrl = (key: string) => (B.arte ? `${B.arte}/${state.format === 'phone' ? 'vertical' : 'horizontal'}/${ARTE[key]}.jpg` : '')
    const conArte = () => !!SKINS[state.skin].art && !!B.arte

    stage.innerHTML = `
        <div class="st-bg"><div class="art"></div></div>
        <canvas class="st-particles"></canvas>
        <div class="scene"></div>
        <canvas class="st-confetti"></canvas>
        <div class="hud-top">
            <span class="brand"><i></i><span>Eyplease+</span></span>
            <span class="label" aria-live="polite"></span>
            <span class="spacer"></span>
            <button type="button" class="hud-btn" data-search aria-label="Búscate">${I.search}<span>Búscate</span></button>
            <button type="button" class="hud-btn" data-fs aria-label="Pantalla completa">${I.fs}</button>
        </div>
        <div class="hud-bottom">
            <div class="prog"></div>
            <div class="ctrl">
                <button type="button" class="hud-btn" data-prev aria-label="Anterior">${I.prev}</button>
                <button type="button" class="hud-btn main" data-play aria-label="Reproducir">${I.play}</button>
                <button type="button" class="hud-btn" data-next aria-label="Siguiente">${I.next}</button>
            </div>
        </div>
        <div class="scrim"></div>
        <div class="sheet" role="dialog" aria-modal="true" aria-label="Ficha" tabindex="-1"></div>`

    const scene = stage.querySelector('.scene') as HTMLDivElement
    const bgArt = stage.querySelector('.st-bg .art') as HTMLDivElement
    const label = stage.querySelector('.hud-top .label') as HTMLSpanElement
    const prog = stage.querySelector('.prog') as HTMLDivElement
    const playBtn = stage.querySelector('[data-play]') as HTMLButtonElement
    const sheet = stage.querySelector('.sheet') as HTMLDivElement
    const scrim = stage.querySelector('.scrim') as HTMLDivElement

    const chapterName = (c: Capitulo) => (c.kind === 'portada' ? 'Portada' : c.kind === 'cierre' ? 'Cierre' : c.s.titulo)
    prog.innerHTML = CH.map((c, i) => `<button type="button" data-seek="${i}" aria-label="Ir a ${esc(chapterName(c))}"><i></i></button>`).join('')
    const bars = [...prog.children] as HTMLButtonElement[]
    const barFill = (i: number) => bars[i].firstElementChild as HTMLElement

    /* Una foto rota cae a las iniciales que ya están debajo */
    const onImgError = (e: Event) => {
        const t = e.target as HTMLElement
        if (t.tagName === 'IMG' && t.parentElement?.classList.contains('av')) t.remove()
    }
    root.addEventListener('error', onImgError, true)

    /* ---------------- navegación ---------------- */
    const clearTimers = () => { timers.forEach(clearTimeout); timers = [] }

    function go(i: number, { cover = true } = {}) {
        i = Math.max(0, Math.min(CH.length - 1, i))
        clearTimers()
        closeSheet(false)
        conf.parts = []
        state.ch = i
        const c = CH[i]
        const n = c.kind === 'seccion' ? i : 0
        label.textContent = n ? `${n}/${NSEC} · ${chapterName(c)}` : chapterName(c)
        bars.forEach((b, k) => { b.classList.toggle('done', k < i); barFill(k).style.width = k < i ? '100%' : '0' })

        const artKey = c.kind === 'seccion' ? c.s.key : c.kind
        const arte = conArte()
        bgArt.style.opacity = arte ? '' : '0'
        if (arte) bgArt.style.backgroundImage = `url('${artUrl(artKey)}')`

        const pintar = () => {
            scene.className = `scene k-${c.tipo}`
            scene.innerHTML = pintarCapitulo(c, n)
            afterRender()
        }

        const conPortada = cover && !RM.matches && (c.kind === 'seccion' || (c.kind === 'cierre' && arte))
        stage.querySelectorAll('.cover').forEach(el => el.remove())
        if (conPortada) {
            const cv = document.createElement('div')
            if (arte) {
                cv.className = 'cover art'
                cv.style.backgroundImage = `url('${artUrl(artKey)}')`
                cv.innerHTML = `<div><div class="c-kicker">${n ? `Sección ${n} de ${NSEC}` : ''}</div></div>`
            } else if (c.kind === 'seccion') {
                cv.className = 'cover'
                cv.innerHTML = `<div><div class="c-kicker">Sección ${n} de ${NSEC}</div><div class="c-title">${esc(c.s.titulo)}</div><div class="c-line"></div><div class="c-sub">${esc(c.s.sub)}</div></div>`
            }
            scene.innerHTML = ''
            stage.insertBefore(cv, stage.querySelector('.st-confetti'))
            stage.classList.toggle('covering', arte)
            later(() => { pintar(); cv.classList.add('out'); stage.classList.remove('covering'); later(() => cv.remove(), 800) }, COVER_MS)
        } else {
            stage.classList.remove('covering')
            pintar()
        }

        state.total = (conPortada ? COVER_MS : 0) + DUR[c.tipo]
        state.elapsed = 0
        state.last = 0
    }

    function afterRender() {
        scene.querySelectorAll<HTMLElement>('[data-to]').forEach(el => {
            const to = Number(el.dataset.to)
            if (RM.matches) { el.textContent = fmt(to); return }
            el.textContent = '0'
            later(() => {
                const t0 = performance.now()
                const dur = Number(el.dataset.dur || 1200)
                const step = (t: number) => {
                    const k = Math.min(1, (t - t0) / dur)
                    el.textContent = fmt(Math.round(to * (1 - Math.pow(1 - k, 3))))
                    if (k < 1) requestAnimationFrame(step)
                }
                requestAnimationFrame(step)
            }, Number(el.dataset.delay || 0))
        })
        scene.querySelectorAll<HTMLElement>('.bar i[data-w]').forEach(el => {
            if (RM.matches) { el.style.width = `${el.dataset.w}%`; return }
            later(() => { el.style.width = `${el.dataset.w}%` }, Number(el.dataset.delay || 0))
        })
        scene.querySelectorAll<SVGElement>('.seg-f[data-on]').forEach(el => {
            if (RM.matches) { el.classList.add('on'); return }
            later(() => el.classList.add('on'), Number(el.dataset.delay || 0))
        })
    }

    /* ---------------- reproducción automática ---------------- */
    function tick(t: number) {
        if (!state.playing) return
        if (!state.last) state.last = t
        state.elapsed += t - state.last
        state.last = t
        const f = Math.min(1, state.elapsed / state.total)
        barFill(state.ch).style.width = `${f * 100}%`
        if (f >= 1) {
            if (state.ch >= CH.length - 1) { pause(); return }
            go(state.ch + 1)
        }
        state.raf = requestAnimationFrame(tick)
    }
    function play() {
        if (state.ch >= CH.length - 1 && state.elapsed >= state.total) go(0)
        state.playing = true
        state.last = 0
        playBtn.innerHTML = I.pause
        playBtn.setAttribute('aria-label', 'Pausar')
        cancelAnimationFrame(state.raf)
        state.raf = requestAnimationFrame(tick)
    }
    function pause() {
        state.playing = false
        cancelAnimationFrame(state.raf)
        playBtn.innerHTML = I.play
        playBtn.setAttribute('aria-label', 'Reproducir')
    }
    const toggle = () => (state.playing ? pause() : play())

    /* ---------------- ficha y búsqueda ---------------- */
    function openSheet(html: string) {
        pause()
        sheet.innerHTML = `<button type="button" class="hud-btn sheet-x" data-close aria-label="Cerrar">${I.x}</button>${html}`
        sheet.scrollTop = 0
        sheet.classList.add('open')
        scrim.classList.add('on')
    }
    function closeSheet(focus = true) {
        if (!sheet.classList.contains('open')) return
        sheet.classList.remove('open')
        scrim.classList.remove('on')
        if (focus) stage.focus({ preventScroll: true })
    }
    function openFicha(p: string) {
        const lista = IDX[p] || []
        const inicio = INICIO[p] || []
        const sig = siguientes(p)
        openSheet(`
            <div class="f-head">${av(p, 'lg')}<div><h4>${esc(nombre(p))}</h4><p>${lista.length} ${plural(lista.length, 'reconocimiento', 'reconocimientos')} en el boletín de ${esc(B.mesNombre)}</p></div></div>
            <div class="f-sec"><h5>Sus reconocimientos</h5><ul class="f-list">
                ${lista.map(r => `<li><button type="button" data-go="${r.ch}"><span class="dot"></span><span><b>${esc(r.sec)}</b><small>${esc(r.det)}</small></span></button></li>`).join('')}
            </ul></div>
            ${inicio.length ? `<div class="f-sec"><h5>Inició a</h5><ul class="f-list">
                ${inicio.map(q => `<li><button type="button" data-p="${q}">${av(q)}<span><b>${nm(q)}</b><small>Nuevos comienzos</small></span></button></li>`).join('')}
            </ul></div>` : ''}
            <div class="f-sec"><h5>Lo que sigue</h5><ul class="f-list f-next">
                ${sig.length ? sig.map(t => `<li>${t}</li>`).join('') : `<li>${cierreEstrellas && lista.some(r => r.sec.startsWith('Estrellas')) ? 'Su estrella del trimestre ya está ganada.' : 'Este mes no hay una siguiente meta que mostrar.'}</li>`}
            </ul><p class="f-note">Calculado con las mismas reglas que usa el sistema para armar el boletín.</p></div>`)
    }
    function openSearch() {
        openSheet(`
            <div class="f-head"><div><h4>Búscate</h4><p>Escribe tu nombre y ve todo lo que lograste este mes.</p></div></div>
            <input class="search-in" type="search" placeholder="Nombre…" aria-label="Buscar por nombre" autocomplete="off">
            <div class="s-results"></div>`)
        const input = sheet.querySelector('.search-in') as HTMLInputElement
        const out = sheet.querySelector('.s-results') as HTMLDivElement
        const todas = Object.keys(IDX).sort((a, b) => nombre(a).localeCompare(nombre(b), 'es'))
        const pintar = () => {
            const q = norm(input.value.trim())
            const hits = todas.filter(p => !q || norm(nombre(p)).includes(q))
            out.innerHTML = hits.length ? hits.map(p => `
                <button type="button" class="chip" data-p="${p}">${av(p)}<span class="tx"><span class="nm">${esc(nombre(p))}</span>
                    <span class="vl">${IDX[p].length} ${plural(IDX[p].length, 'reconocimiento', 'reconocimientos')}</span></span></button>`).join('')
                : '<div class="s-empty">Nadie con ese nombre en este boletín.</div>'
        }
        input.addEventListener('input', pintar)
        pintar()
        window.setTimeout(() => input.focus({ preventScroll: true }), 60)
    }

    /* ---------------- confeti ---------------- */
    interface Pieza { x: number, y: number, vx: number, vy: number, g: number, w: number, h: number, r: number, vr: number, c: string, life: number }
    const confCv = stage.querySelector('.st-confetti') as HTMLCanvasElement
    const confCtx = confCv.getContext('2d') as CanvasRenderingContext2D
    const conf = { parts: [] as Pieza[], run: false, w: 0, h: 0 }
    const sizeCanvas = (cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D, o: { w: number, h: number }) => {
        const r = cv.getBoundingClientRect()
        const dpr = Math.min(2, window.devicePixelRatio || 1)
        o.w = r.width
        o.h = r.height
        cv.width = Math.max(1, Math.round(r.width * dpr))
        cv.height = Math.max(1, Math.round(r.height * dpr))
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    function confetti(x: number, y: number, n = 120, spread = 1) {
        if (RM.matches) return
        const cols = SKINS[state.skin].confetti
        const k = Math.max(0.6, Math.min(1.4, conf.w / 900))
        for (let i = 0; i < n; i++) {
            const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * spread
            const sp = (4 + Math.random() * 8) * k
            conf.parts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, g: 0.17 + Math.random() * 0.08, w: (4 + Math.random() * 5) * k, h: (6 + Math.random() * 8) * k, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35, c: cols[i % cols.length], life: 0 })
        }
        if (!conf.run) { conf.run = true; requestAnimationFrame(confLoop) }
    }
    function confLoop() {
        if (destroyed) return
        confCtx.clearRect(0, 0, conf.w, conf.h)
        conf.parts = conf.parts.filter(p => p.y < conf.h + 30 && p.life < 420)
        for (const p of conf.parts) {
            p.vx *= 0.992; p.vy = p.vy * 0.992 + p.g; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++
            confCtx.save()
            confCtx.translate(p.x, p.y)
            confCtx.rotate(p.r)
            confCtx.globalAlpha = Math.min(1, (420 - p.life) / 60)
            confCtx.fillStyle = p.c
            confCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 1.7)) + 1)
            confCtx.restore()
        }
        if (conf.parts.length) requestAnimationFrame(confLoop)
        else { conf.run = false; confCtx.clearRect(0, 0, conf.w, conf.h) }
    }
    function confettiAt(el: Element | null, n: number, spread: number) {
        if (!el) return
        const r = el.getBoundingClientRect()
        const s = stage.getBoundingClientRect()
        confetti(r.left + r.width / 2 - s.left, r.top + r.height / 2 - s.top, n, spread)
    }

    /* ---------------- partículas de la piel ---------------- */
    interface Particula { x: number, y: number, r: number, vy: number, vx: number, a: number, c: string }
    const partCv = stage.querySelector('.st-particles') as HTMLCanvasElement
    const partCtx = partCv.getContext('2d') as CanvasRenderingContext2D
    const part = { p: [] as Particula[], cfg: null as Skin['particles'] | null, run: false, w: 0, h: 0 }
    function mkPart(cualquiera: boolean): Particula {
        const c = part.cfg as Skin['particles']
        const r = c.mode === 'bokeh' ? 3 + Math.random() * 10 : c.mode === 'dust' ? 0.6 + Math.random() * 1.3 : c.mode === 'dot' ? 1.2 + Math.random() * 2.2 : 1 + Math.random() * 2.2
        return {
            x: Math.random() * part.w, y: cualquiera ? Math.random() * part.h : part.h + 12, r,
            vy: -(c.mode === 'bokeh' ? 0.08 + Math.random() * 0.16 : 0.1 + Math.random() * 0.32), vx: (Math.random() - 0.5) * 0.16,
            a: Math.random() * Math.PI * 2, c: c.colors[Math.floor(Math.random() * c.colors.length)],
        }
    }
    function seedParts() {
        if (!part.cfg || !part.w) return
        const n = Math.round(part.cfg.n * Math.max(0.6, Math.min(1.4, (part.w * part.h) / (1100 * 620))))
        part.p = Array.from({ length: n }, () => mkPart(true))
    }
    function drawParts(mover: boolean) {
        if (!part.cfg) return
        partCtx.clearRect(0, 0, part.w, part.h)
        const mode = part.cfg.mode
        for (const p of part.p) {
            if (mover) { p.x += p.vx; p.y += p.vy; p.a += 0.03; if (p.y < -24) Object.assign(p, mkPart(false)) }
            const tw = 0.45 + 0.55 * Math.abs(Math.sin(p.a))
            partCtx.globalAlpha = mode === 'bokeh' ? 0.14 + 0.12 * tw : 0.22 + 0.58 * tw
            partCtx.fillStyle = p.c
            partCtx.beginPath()
            if (mode === 'spark') {
                /* Destello: punto con brillo suave y, sólo al centellear, dos rayos finos */
                partCtx.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2)
                partCtx.fill()
                if (tw > 0.82) {
                    const L = p.r * (1.2 + (tw - 0.82) * 9)
                    partCtx.globalAlpha *= 0.55
                    partCtx.fillRect(p.x - L, p.y - 0.35, L * 2, 0.7)
                    partCtx.fillRect(p.x - 0.35, p.y - L, 0.7, L * 2)
                }
            } else {
                partCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                partCtx.fill()
            }
        }
        partCtx.globalAlpha = 1
    }
    function partLoop() { if (!part.run || destroyed) return; drawParts(true); requestAnimationFrame(partLoop) }
    function partToggle() {
        const quiere = !!part.cfg && !document.hidden && !RM.matches && !destroyed
        if (quiere && !part.run) { part.run = true; requestAnimationFrame(partLoop) }
        if (!quiere) { part.run = false; if (part.cfg && part.w) drawParts(false) }
    }
    function setParticles() { part.cfg = SKINS[state.skin].particles; seedParts(); partToggle() }

    const ro = new ResizeObserver(() => {
        sizeCanvas(confCv, confCtx, conf)
        sizeCanvas(partCv, partCtx, part)
        seedParts()
        if (!part.run && part.cfg) drawParts(false)
    })
    ro.observe(stage)
    document.addEventListener('visibilitychange', partToggle)

    /* ---------------- eventos ---------------- */
    const esPantallaCompleta = () => root.fullscreenElement === stage || document.fullscreenElement === host
    const onClick = (e: MouseEvent) => {
        const t = e.target as HTMLElement
        if (t.closest('[data-close]') || t === scrim) { closeSheet(); return }
        const blow = t.closest('[data-blow]')
        if (blow) {
            const cake = blow.closest('.cake') as HTMLElement
            cake.classList.toggle('out')
            if (cake.classList.contains('out')) confettiAt(blow, 46, 0.7)
            return
        }
        const goEl = t.closest<HTMLElement>('[data-go]')
        if (goEl) { closeSheet(false); go(Number(goEl.dataset.go)); return }
        const pEl = t.closest<HTMLElement>('[data-p]')
        if (pEl) { openFicha(pEl.dataset.p as string); return }
        if (t.closest('[data-search]')) { openSearch(); return }
        if (t.closest('[data-prev]')) { go(state.ch - 1, { cover: false }); return }
        if (t.closest('[data-next]')) { go(state.ch + 1); return }
        if (t.closest('[data-play]')) { toggle(); return }
        const seek = t.closest<HTMLElement>('[data-seek]')
        if (seek) { go(Number(seek.dataset.seek)); return }
        if (t.closest('[data-fs]')) {
            if (esPantallaCompleta()) void document.exitFullscreen?.()
            else void stage.requestFullscreen?.()
        }
    }
    stage.addEventListener('click', onClick)

    const enVista = () => {
        if (esPantallaCompleta()) return true
        const r = stage.getBoundingClientRect()
        return r.bottom > 120 && r.top < window.innerHeight - 120
    }
    const onKey = (e: KeyboardEvent) => {
        const activo = root.activeElement as HTMLElement | null
        if (activo?.tagName === 'INPUT') { if (e.key === 'Escape') closeSheet(); return }
        const fuera = e.target as HTMLElement | null
        if (fuera && fuera !== host && fuera.closest?.('input, textarea, select, [contenteditable="true"]')) return
        if (e.key === 'Escape') { closeSheet(); return }
        if (!enVista()) return
        if (e.key === 'ArrowRight') { e.preventDefault(); go(state.ch + 1) }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(state.ch - 1, { cover: false }) }
        else if (e.key === ' ') { e.preventDefault(); toggle() }
        else if (e.key === 'f' || e.key === 'F') { (stage.querySelector('[data-fs]') as HTMLButtonElement).click() }
    }
    document.addEventListener('keydown', onKey)

    setParticles()
    go(0)

    return {
        setSkin(skin) {
            if (skin === state.skin) return
            state.skin = skin
            stage.dataset.skin = skin
            setParticles()
            go(state.ch)
        },
        setFormat(format) {
            if (format === state.format) return
            state.format = format
            stage.dataset.format = format
            go(state.ch, { cover: false })
        },
        destroy() {
            destroyed = true
            pause()
            clearTimers()
            ro.disconnect()
            document.removeEventListener('visibilitychange', partToggle)
            document.removeEventListener('keydown', onKey)
            stage.removeEventListener('click', onClick)
            root.removeEventListener('error', onImgError, true)
            if (esPantallaCompleta()) void document.exitFullscreen?.()
            root.innerHTML = ''
        },
    }
}
