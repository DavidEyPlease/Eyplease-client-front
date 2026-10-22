/* El motor del boletín dinámico. Es el de la muestra local que aprobó David (Boletin-Interactivo/carrera-p10,
   21-oct-2026), con lo que necesita para vivir dentro de la web:
   - un Shadow DOM: sus estilos no tocan la web ni la web los toca a ellos;
   - los ajustes de la Directora (Tempraneras, su mensaje, el mes) se guardan por la web en la API;
   - limpieza al salir de la página (escuchas, observadores, temporizadores, el título y la pantalla completa);
   - la versión sin órdenes: sin acceso del robot a Mary Kay no hay carrera, día por día ni productos.
   Va en JavaScript a propósito (motor.d.ts es su contrato con el resto de la web): es el mismo código probado en la
   muestra y así se puede comparar línea por línea. */
import css from './estilo.css?inline'
import { plantilla } from './plantilla'

const FUENTES = 'https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;0,700;1,500&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Poppins:wght@400;500;600;700&display=swap'

export function crearBoletinDinamico(host, D, op = {}) {
    // las letras de la plantilla se cargan en la página (un @font-face dentro del Shadow DOM no siempre aplica)
    if (!document.getElementById('boletin-dinamico-fuentes')) {
        const l = document.createElement('link')
        l.id = 'boletin-dinamico-fuentes'
        l.rel = 'stylesheet'
        l.href = FUENTES
        document.head.appendChild(l)
    }
    // la piel de la plantilla del mes: la 9 (CELEBRA) o la 10 (Papel en relieve)
    const piel = op.piel === 'p10' ? 'p10' : 'p9'
    const base = op.base || `/boletin/${piel}`
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' })
    root.innerHTML = `<style>${css}</style>${plantilla(base, piel)}`
    const pagina = root.querySelector('.pagina')
    pagina.dataset.piel = piel
    if (piel === 'p9') {
        // sus portadas completas son el fondo de la portada y del Cuadro de Honor (el título ya viene en el arte)
        for (const [v, f] of [['--arte-portada-h', 'portada-h'], ['--arte-portada-v', 'portada-v'], ['--arte-honor-h', 'honor-h'], ['--arte-honor-v', 'honor-v']]) {
            pagina.style.setProperty(v, `url("${base}/${f}.webp")`)
        }
    }
    const color = v => getComputedStyle(pagina).getPropertyValue(v).trim()
    const $ = (s, r = pagina) => r.querySelector(s)
    const $$ = (s, r = pagina) => [...r.querySelectorAll(s)]

    // todo lo que se engancha fuera de la página se apunta aquí para soltarlo al salir
    let vivo = true
    const limpieza = []
    const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); limpieza.push(() => t.removeEventListener(ev, fn, o)) }
    const observadores = []
    const observador = (cb, o) => { const io = new IntersectionObserver(cb, o); observadores.push(io); return io }
    const temporizadores = new Set()
    const later = (fn, ms) => { const id = window.setTimeout(() => { temporizadores.delete(id); if (vivo) fn() }, ms); temporizadores.add(id); return id }
    let observarRevela = null

    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
    const miles = n => Math.round(n).toLocaleString('es-MX')
    const lugar = n => (n === 1 ? '1.er' : n === 3 ? '3.er' : `${n}.º`)
    const MES = D.mes.toLowerCase()
    const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
    const semana = d => new Date(D.anio, MESES.indexOf(MES), d).toLocaleDateString('es-MX', { weekday: 'long' })
    const ULT = D.dias
    const suave = f => 1 - Math.pow(1 - f, 3)
    const telefono = () => innerWidth <= 760

    /* ---------- nombres: «Mariana Paleta», «Ma. de la Luz Ramirez» ---------- */
    const PARTICULA = new Set(['de', 'del', 'la', 'las', 'los', 'y'])
    const COMPUESTO = new Set(['ma', 'ma.', 'maria', 'maría', 'jose', 'josé', 'juan', 'ana'])
    function partes(nombre) {
        const w = nombre.split(/\s+/).filter(Boolean).map(x => (x.toLowerCase() === 'ma' ? 'Ma.' : x))
        const nApe = w.length >= 3 ? 2 : w.length === 2 ? 1 : 0
        return { pila: w.slice(0, w.length - nApe), ape: w.slice(w.length - nApe) }
    }
    function corto(nombre) {
        const { pila, ape } = partes(nombre)
        let p = pila[0] || ''
        if (pila.length > 1 && COMPUESTO.has(p.toLowerCase()) && pila.length <= 4) p = pila.map((x, i) => (i && PARTICULA.has(x.toLowerCase()) ? x.toLowerCase() : x)).join(' ')
        return [p, ape[0]].filter(Boolean).join(' ')
    }
    const iniciales = nombre => { const { pila, ape } = partes(nombre); return ((pila[0] || '')[0] || '') + ((ape[0] || pila[1] || '')[0] || '') }

    const PER = new Map(D.personas.map(p => [p.id, { ...p, corto: corto(p.nombre) }]))
    const url = u => (/%[0-9a-f]{2}/i.test(u) ? u : encodeURI(u))
    const mono = n => `<span class="mono"><span>${esc(iniciales(n || ''))}</span></span>`
    // la silueta sin fondo; si no existe, la foto original; si tampoco, sus iniciales (ver el «error» de abajo)
    const cara = p => (p && p.foto
        ? `<img src="${esc(url(p.foto))}" alt="" decoding="async" data-ini="${esc(iniciales(p.nombre || ''))}"${p.fotoOriginal ? ` data-orig="${esc(url(p.fotoOriginal))}"` : ''}>`
        : mono(p && p.nombre))
    on(root, 'error', e => {
        const img = e.target
        if (!(img instanceof HTMLImageElement)) return
        if (img.dataset.orig) { const o = img.dataset.orig; delete img.dataset.orig; img.src = o; return }
        if (img.dataset.ini === undefined) { img.remove(); return }
        const s = document.createElement('span')
        s.className = 'mono'
        s.innerHTML = `<span>${esc(img.dataset.ini)}</span>`
        img.replaceWith(s)
    }, true)
    const CORONA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8l4.5 3.5L12 5l4.5 6.5L21 8l-2 10H5z"/></svg>'

    /* ---------- el guion: cada orden es un «latido»; los momentos se detienen a contarse ---------- */
    const T = { vacio: 260, lleno: 320, orden: 720, sube: 1150, rapida: 480, relevo: 3000, abre: 2300, ultimo: 2800, nueva: 1700, final: 2400 }
    const TW = 650 // lo que tarda la barra en crecer
    const EV = D.eventos.filter(e => e.tipo !== 'otra' || e.pts > 0)
    const beats = []
    const ORD = [] // sólo los latidos de órdenes, en orden de tiempo
    const SEG = [] // quién va primero desde cuándo
    const FIN = [] // ranking al cerrar cada día
    const DIA_T = []
    let t = 0
    {
        const acc = new Map()
        let k = 0
        let lider = null
        const ranking = () => [...acc].filter(([, a]) => a.v > 0).sort((x, y) => y[1].v - x[1].v || x[1].k - y[1].k).map(([id]) => id)
        const momento = m => { beats.push({ tipo: 'momento', t, ...m }); t += m.dur }
        for (let d = 1; d <= ULT; d++) {
            const del = EV.filter(e => e.dia === d)
            DIA_T[d] = t
            beats.push({ tipo: 'dia', t, dur: del.length ? T.lleno : T.vacio, dia: d })
            t += del.length ? T.lleno : T.vacio
            if (d === ULT && del.length && lider) {
                const r = ranking()
                momento({
                    clase: 'ultimo', dur: T.ultimo, dia: d, inv: [r[0]],
                    kicker: `${d} de ${MES} · último día`, titulo: 'Último día del mes',
                    detalle: `${PER.get(r[0]).corto} va en primer lugar con ${miles(acc.get(r[0]).v)} puntos. ¿Alguien le quita el primer lugar?`,
                })
            }
            for (const e of del) {
                const antes = ranking()
                const a = acc.get(e.p) || { v: 0, k: 0 }
                acc.set(e.p, { v: a.v + e.pts, k: ++k })
                const despues = ranking()
                const posAntes = antes.indexOf(e.p) + 1
                const pos = despues.indexOf(e.p) + 1
                const subePodio = e.pts > 0 && pos && pos <= 3 && (!posAntes || posAntes > pos)
                const dur = d === ULT ? (subePodio ? T.sube * .8 : T.rapida) : subePodio ? T.sube : T.orden
                const b = { tipo: 'orden', t, dur, dia: d, e, pos, posAntes }
                beats.push(b)
                ORD.push(b)
                t += dur
                if (e.tipo === 'inicio') {
                    momento({ clase: 'suave', dur: T.nueva, dia: d, inv: null, kicker: `${d} de ${MES} · Nuevo Inicio`, titulo: `<em>${esc(PER.get(e.p).corto)}</em> se une a la unidad`, detalle: '' })
                }
                const nuevo = despues[0]
                if (nuevo && nuevo !== lider) {
                    const quien = esc(PER.get(nuevo).corto)
                    if (!lider) {
                        momento({ clase: 'abre', dur: T.abre, dia: d, inv: [nuevo], kicker: `${d} de ${MES}`, titulo: `<em>${quien}</em> abre el marcador`, detalle: `Primera orden con puntos del mes: ${miles(e.pts)} puntos.` })
                    } else {
                        const dif = acc.get(nuevo).v - acc.get(lider).v
                        const conQue = e.n >= 2 ? `Con su ${e.n}.ª orden` : 'Con su primera orden del mes'
                        const como = !posAntes ? 'entra directo al primer lugar' : posAntes > 2 ? `salta del ${lugar(posAntes)} al primer lugar` : 'pasa al primer lugar'
                        momento({
                            clase: 'relevo', dur: T.relevo, dia: d, inv: [nuevo, lider],
                            kicker: `${d} de ${MES} · cambio de líder`,
                            titulo: `<em>${quien}</em> rebasa a ${esc(PER.get(lider).corto)}`,
                            detalle: `${conQue} (+${miles(e.pts)} puntos) ${como} y le saca ${miles(dif)} de ventaja.`,
                        })
                    }
                    SEG.push({ p: nuevo, t: b.t + TW * .5, dia: d })
                    lider = nuevo
                }
            }
            FIN[d] = ranking()
        }
        DIA_T[ULT + 1] = t
        const r = FIN[ULT]
        if (r.length) {
            const g = PER.get(r[0])
            const n = ORD.filter(b => b.e.p === r[0] && b.e.tipo === 'compra').length
            momento({ clase: 'final', dur: T.final, dia: ULT, inv: r.slice(0, 3), kicker: `Así cerró ${MES}`, titulo: `<em>${esc(g.corto)}</em> se queda con el primer lugar`, detalle: `${miles(acc.get(r[0]).v)} puntos en ${n} ${n === 1 ? 'orden' : 'órdenes'}.` })
        }
    }
    const TOTAL = t
    const MAXV = Math.max(1, ...[...new Set(EV.map(e => e.p))].map(p => EV.filter(e => e.p === p).reduce((s, e) => s + e.pts, 0)))
    const COMPRAS = EV.filter(e => e.tipo === 'compra').length
    const RELEVOS = Math.max(0, SEG.length - 1)

    /* ---------- estado a un tiempo dado ---------- */
    function valores(ms) {
        const v = new Map()
        const k = new Map()
        ORD.forEach((b, i) => {
            if (b.t > ms) return
            const f = Math.min(1, (ms - b.t) / TW)
            v.set(b.e.p, (v.get(b.e.p) || 0) + b.e.pts * suave(f))
            k.set(b.e.p, i)
        })
        return { v, k }
    }
    const latido = ms => { let i = beats.length - 1; const m = Math.min(ms, TOTAL - 1); while (i > 0 && beats[i].t > m) i--; return i }
    const diaDe = ms => { let d = 1; while (d < ULT && DIA_T[d + 1] <= ms) d++; return d }
    const posX = ms => { const d = diaDe(ms); const a = DIA_T[d]; const b = DIA_T[d + 1]; return Math.min(1, (d - 1 + Math.min(1, (ms - a) / Math.max(1, b - a))) / ULT) }
    const msDeX = x => { const f = Math.max(0, Math.min(1, x)) * ULT; const d = Math.min(ULT, Math.floor(f) + 1); return d > ULT ? TOTAL : DIA_T[d] + (f - (d - 1)) * (DIA_T[d + 1] - DIA_T[d]) }

    /* ---------- pintar la página fija ---------- */
    $$('.mes').forEach(n => { n.textContent = MES })
    $('.unidad').textContent = D.unidad
    const tituloAntes = document.title
    document.title = `Reconocimiento de ${MES} · ${D.unidad}`
    $('.lead-h').innerHTML = COMPRAS
        ? `${ULT} días, <b>${COMPRAS} órdenes</b> y <b>${RELEVOS} ${RELEVOS === 1 ? 'cambio' : 'cambios'} de líder</b>. Así se movió tu unidad, orden por orden.`
        : `Así cerró el Cuadro de Honor de ${MES} en tu unidad.`
    {
        // la portada resume el mes con lo que la página ya trae
        const nEst = D.estrellas ? D.estrellas.lista.length : 0
        const nCR = D.circulo ? D.circulo.total : 0
        const partes = [COMPRAS ? `<b>${COMPRAS} órdenes</b>` : '', nEst ? `<b>${nEst} ${nEst === 1 ? 'Estrella' : 'Estrellas'}</b> del trimestre` : '', nCR ? `<b>${nCR} consultoras</b> en Círculo Rosa` : ''].filter(Boolean)
        $('.entrada .lead').innerHTML = partes.length
            ? `El cierre de ${MES} de la ${esc(D.unidad)}: ${partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]}.`
            : `El cierre de ${MES} de la ${esc(D.unidad)}.`
        // la Directora: en la portada y firmando el cierre
        const dir = D.directora || {}
        const caraD = cara(dir)
        $('.foto-d').innerHTML = caraD
        $('.ovalo-f').innerHTML = caraD
        $$('.dire-nombre').forEach(n => { n.textContent = dir.nombre || '' })
        $$('.dire-nivel').forEach(n => { n.textContent = [dir.nivel, D.unidad].filter(Boolean).join(' · ') })
    }

    // burbujas: la unidad rodea el laurel del Cuadro de Honor
    function burbujas() {
        const caja = $('.burbujas')
        const ent = $('.cab-honor').getBoundingClientRect()
        const emb = $('.cab-honor .emb')
        const con = [...PER.values()].filter(p => p.foto)
        if (!emb) {
            // Plantilla 9: el título viene en el arte. En pantalla, la unidad lo corona en un arco que baja por los
            // lados sin tocar las letras; en el teléfono (el título ocupa todo el ancho) va en dos filas sobre las luces.
            let semilla9 = 7
            const azar9 = () => ((semilla9 = (semilla9 * 9301 + 49297) % 233280) / 233280)
            const lista = telefono() ? con.slice(0, 12) : con.slice(0, 28)
            const pos = telefono()
                ? (i, s) => {
                    const fila = i < 6 ? 0 : 1
                    const f = ((i % 6) + .5) / 6
                    return [ent.width * (.06 + .88 * f) - s / 2, 92 + fila * 54 + (1 - Math.sin(f * Math.PI)) * 8]
                }
                : (i, s) => {
                    const ang = Math.PI + Math.PI * (i + .5) / lista.length
                    // un arco «cuadrado»: sube empinado por los lados y corre plano por arriba, rodeando el título
                    const sy = -Math.pow(Math.abs(Math.sin(ang)), .55)
                    return [ent.width * (.5 + .48 * Math.cos(ang)) - s / 2, ent.height * (.62 + .46 * sy) - s / 2]
                }
            caja.innerHTML = lista.map((p, i) => {
                const s = Math.round((telefono() ? 34 : 44) + azar9() * (telefono() ? 10 : 12))
                const [x, y] = pos(i, s)
                const st = `left:${x.toFixed(0)}px;top:${Math.max(84, y).toFixed(0)}px;--s:${s}px;--d:${(.4 + i * .04).toFixed(2)}s;--t:${(5 + azar9() * 4).toFixed(1)}s;--dx:${(azar9() * 12 - 6).toFixed(0)}px;--dy:${(azar9() * 12 - 6).toFixed(0)}px;--o:${(.82 + azar9() * .16).toFixed(2)}`
                return `<span class="burbuja" style="${st}">${cara(p)}</span>`
            }).join('')
            return
        }
        const em = emb.getBoundingClientRect()
        const lista = telefono() ? con.slice(0, 14) : con
        const cx = em.left - ent.left + em.width / 2
        const cy = em.top - ent.top + em.height / 2
        const rx = em.width * (telefono() ? .58 : .66)
        const ry = em.height * (telefono() ? .62 : .68)
        const a0 = telefono() ? -Math.PI * 1.08 : -Math.PI
        const a1 = telefono() ? Math.PI * .08 : Math.PI
        let semilla = 7
        const azar = () => ((semilla = (semilla * 9301 + 49297) % 233280) / 233280)
        caja.innerHTML = lista.map((p, i) => {
            const ang = a0 + (a1 - a0) * (i + .5) / lista.length
            const s = Math.round((telefono() ? 34 : 50) + azar() * (telefono() ? 14 : 28))
            const x = Math.max(6, Math.min(ent.width - s - 6, cx + Math.cos(ang) * rx * (.95 + azar() * .12) - s / 2))
            const y = Math.max(78, cy + Math.sin(ang) * ry * (.95 + azar() * .12) - s / 2)
            const st = `left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;--s:${s}px;--d:${(.5 + i * .05).toFixed(2)}s;--t:${(5 + azar() * 4).toFixed(1)}s;--dx:${(azar() * 16 - 8).toFixed(0)}px;--dy:${(azar() * 18 - 9).toFixed(0)}px;--o:${(.78 + azar() * .2).toFixed(2)}`
            return `<span class="burbuja" style="${st}">${cara(p)}</span>`
        }).join('')
    }

    // filas de la carrera: una por persona, se mueven solas
    const pista = $('.pista')
    const tablero = $('.tablero')
    const FILAS = new Map()
    for (const p of PER.values()) {
        const el = document.createElement('div')
        el.className = 'fila'
        el.setAttribute('role', 'listitem')
        el.innerHTML = `<div class="cuerpo"><div class="izq"><span class="pos"></span><span class="nom">${esc(p.corto)}</span></div>`
            + `<div class="carril"><span class="relleno"></span><span class="punta"><span class="av">${cara(p)}</span><span class="pts">0</span><span class="mas"></span></span></div><span class="mas tel"></span></div>`
        pista.appendChild(el)
        FILAS.set(p.id, { el, cuerpo: $('.cuerpo', el), pos: $('.pos', el), relleno: $('.relleno', el), punta: $('.punta', el), pts: $('.pts', el), mas: $$('.mas', el), y: null, o: 0, txt: '', rk: 0, clip: '', px: '', masTxt: '', masVer: false, ate: false })
    }

    // la línea del tiempo: puntos de la unidad por día, con coronas donde cambió el líder
    const porDia = Array.from({ length: ULT + 1 }, () => 0)
    EV.forEach(e => { porDia[e.dia] += e.pts })
    const maxDia = Math.max(1, ...porDia)
    const diasLider = new Set(SEG.map(s => s.dia))
    $('.columnas').innerHTML = porDia.slice(1).map((v, i) => `<i style="height:${Math.max(4, v / maxDia * 100).toFixed(1)}%" title="${i + 1} de ${MES}: ${miles(v)} puntos">${diasLider.has(i + 1) ? `<b>${CORONA}</b>` : ''}</i>`).join('')
    $('.dias').innerHTML = [1, 5, 10, 15, 20, 25, ULT].map(d => `<span style="left:${((d - .5) / ULT * 100).toFixed(2)}%">${d}</span>`).join('')
    const COLS = $$('.columnas i')

    /* ---------- medidas ---------- */
    let M = {}
    function medir() {
        const tel = telefono()
        const N = tel ? 8 : 10
        const colnom = tel ? 30 : Math.min(220, Math.max(170, tablero.clientWidth * .26))
        tablero.style.setProperty('--colnom', `${colnom}px`)
        const H = pista.clientHeight
        const fh = Math.max(34, Math.floor(H / N))
        const av = Math.round(tel ? Math.min(34, fh * .5) : Math.min(46, fh * .78))
        tablero.style.setProperty('--fh', `${fh}px`)
        tablero.style.setProperty('--av', `${av}px`)
        tablero.style.setProperty('--alto-pista', `${H}px`)
        const W = pista.clientWidth - colnom
        const util = Math.max(60, W - av - (tel ? 62 : 86))
        M = { N, fh, av, W, util, colnom }
        // regla de puntos
        const paso = MAXV <= 1500 ? 250 : MAXV <= 4000 ? 500 : 1000
        let html = ''
        for (let v = paso; v <= MAXV * 1.001; v += paso) {
            const x = av / 2 + util * v / MAXV
            html += `<i style="left:${x.toFixed(1)}px"></i>` + (tel && (v / paso) % 2 ? '' : `<span style="left:${x.toFixed(1)}px">${miles(v)}</span>`)
        }
        $('.regla').innerHTML = html
        snap = true
        FILAS.forEach(f => { f.clip = ''; f.px = '' })
    }

    /* ---------- reloj ---------- */
    let ms = 0
    let jugando = false
    let vel = 1
    let ultimo = 0
    let raf = 0
    let snap = true
    let latidoPrevio = -1
    let diaPrevio = 0
    let liderPrevio
    let logPrevio = -1
    let momentoPrevio = -1
    let arrancado = false

    const play = $('[data-play]')
    function marcarPlay() {
        play.classList.toggle('on', jugando)
        play.setAttribute('aria-label', jugando ? 'Pausar' : ms >= TOTAL ? 'Repetir' : 'Reproducir')
    }
    function jugar(si = true) {
        if (si && ms >= TOTAL) { ms = 0; snap = true }
        jugando = si
        arrancado = arrancado || si
        marcarPlay()
        pedir()
    }
    function ir(nuevo, { soltar = true } = {}) {
        ms = Math.max(0, Math.min(TOTAL, nuevo))
        snap = true
        latidoPrevio = latido(ms) // un salto no dispara efectos de los latidos que se brinca
        if (soltar) marcarPlay()
        pedir()
    }
    function pedir() { if (!raf) { ultimo = performance.now(); raf = requestAnimationFrame(cuadro) } }
    function cuadro(ahora) {
        if (!vivo) return
        const dt = Math.min(64, ahora - ultimo)
        ultimo = ahora
        if (jugando) {
            ms += dt * vel
            if (ms >= TOTAL) { ms = TOTAL; jugando = false; marcarPlay(); confeti() }
        }
        const quieto = pintar(dt)
        raf = jugando || !quieto ? requestAnimationFrame(cuadro) : 0
    }

    /* ---------- pintar un cuadro ---------- */
    function pintar(dt) {
        const { v, k } = valores(ms)
        const orden = [...v.keys()].filter(id => v.get(id) > .5).sort((a, b) => v.get(b) - v.get(a) || k.get(a) - k.get(b))
        const rango = new Map(orden.map((id, i) => [id, i]))
        const bi = latido(ms)
        const b = beats[bi]
        const mom = b.tipo === 'momento' ? b : null
        const inv = mom && mom.inv ? new Set(mom.inv) : null
        let quieto = true
        const kY = snap ? 1 : 1 - Math.exp(-dt / 110)
        const kO = snap ? 1 : 1 - Math.exp(-dt / 150)

        // efectos de los latidos que acaban de empezar (sólo al avanzar jugando)
        if (bi !== latidoPrevio) {
            if (jugando && !snap) {
                for (let i = Math.max(0, latidoPrevio + 1); i <= bi; i++) {
                    const x = beats[i]
                    if (x.tipo === 'orden' && x.e.pts > 0) { const f = FILAS.get(x.e.p); f.el.classList.remove('golpe'); void f.el.offsetWidth; f.el.classList.add('golpe') }
                    if (x.tipo === 'momento' && (x.clase === 'relevo' || x.clase === 'abre')) chispasEn(x.inv[0])
                }
            }
            latidoPrevio = bi
        }

        FILAS.forEach((f, id) => {
            const val = v.get(id) || 0
            const r = rango.has(id) ? rango.get(id) : -1
            const dentro = r >= 0 && r < M.N
            const ty = (dentro ? r : M.N) * M.fh
            const to = dentro ? 1 : 0
            if (f.y === null) f.y = ty
            f.y += (ty - f.y) * kY
            f.o += (to - f.o) * kO
            if (Math.abs(ty - f.y) < .3) f.y = ty; else quieto = false
            if (Math.abs(to - f.o) < .01) f.o = to; else quieto = false
            if (f.o <= 0 && !dentro) { if (f.el.style.opacity !== '0') f.el.style.opacity = '0'; return }
            f.el.style.transform = `translate3d(0,${f.y.toFixed(1)}px,0)`
            f.el.style.opacity = f.o.toFixed(3)
            const rk = r >= 0 ? r + 1 : 0
            if (rk !== f.rk) {
                f.rk = rk
                f.pos.textContent = rk || ''
                f.el.classList.toggle('r1', rk === 1)
                f.el.classList.toggle('r2', rk === 2)
                f.el.classList.toggle('r3', rk === 3)
            }
            const x = M.util * Math.min(1, val / MAXV)
            const clip = `inset(0 ${(M.W - x - M.av / 2).toFixed(1)}px 0 0 round 99px)`
            if (clip !== f.clip) { f.clip = clip; f.relleno.style.clipPath = clip }
            const px = `translate3d(${x.toFixed(1)}px,-50%,0)`
            if (px !== f.px) { f.px = px; f.punta.style.transform = px }
            const txt = miles(val)
            if (txt !== f.txt) { f.txt = txt; f.pts.textContent = txt }
            const ate = !!inv && !inv.has(id)
            if (ate !== f.ate) { f.ate = ate; f.el.classList.toggle('atenua', ate) }
        })

        // la etiqueta «+puntos» de la orden que acaba de entrar
        const vivas = new Map()
        for (let i = ORD.length - 1; i >= 0; i--) {
            const o = ORD[i]
            if (o.t > ms) continue
            if (ms - o.t > 1500) break
            if (!vivas.has(o.e.p) && o.e.pts > 0) vivas.set(o.e.p, etiqueta(o))
        }
        // mientras se cuenta un cambio de líder, la orden que lo provocó sigue a la vista
        if (mom && (mom.clase === 'relevo' || mom.clase === 'abre')) {
            const o = ORD.filter(x => x.e.p === mom.inv[0] && x.t <= ms).pop()
            if (o) vivas.set(o.e.p, etiqueta(o))
        }
        FILAS.forEach((f, id) => {
            const t2 = vivas.get(id) || ''
            if (t2 && t2 !== f.masTxt) { f.masTxt = t2; f.mas.forEach(m => { m.textContent = t2 }) }
            if (!!t2 !== f.masVer) { f.masVer = !!t2; f.mas.forEach(m => m.classList.toggle('ver', !!t2)) }
        })
        if (vivas.size) quieto = false

        // día
        const d = diaDe(ms)
        if (d !== diaPrevio) {
            const num = $('.dia .num')
            num.textContent = d
            $('.dia .semana').textContent = semana(d)
            if (jugando && !snap) { num.classList.remove('salta'); void num.offsetWidth; num.classList.add('salta') }
            diaPrevio = d
            $('.pulso').setAttribute('aria-valuenow', d)
            COLS.forEach((c, i) => { c.classList.toggle('paso', i + 1 < d); c.classList.toggle('hoy', i + 1 === d) })
        }
        $('.cabezal').style.transform = `translateX(${(posX(ms) * $('.pulso').clientWidth).toFixed(1)}px)`

        // quién va primero
        let seg = null
        for (const s of SEG) if (s.t <= ms) seg = s
        const lid = seg ? seg.p : null
        if (lid !== liderPrevio) { pintarLider(lid, jugando && !snap); liderPrevio = lid }
        if (lid) {
            $('.lider .pts').textContent = `${miles(v.get(lid) || 0)} puntos`
            const dias = d - seg.dia + 1
            $('.lider .desde').textContent = `Desde el ${seg.dia} de ${MES} · ${dias} ${dias === 1 ? 'día' : 'días'}`
        }

        // bitácora
        let n = 0
        while (n < ORD.length && ORD[n].t <= ms) n++
        if (n !== logPrevio) {
            logPrevio = n
            $('.bitacora ol').innerHTML = ORD.slice(Math.max(0, n - 3), n).reverse().map(o => {
                const p = PER.get(o.e.p)
                const que = o.e.tipo === 'inicio' ? 'Nuevo Inicio' : o.e.n >= 2 ? `${o.e.n}.ª orden` : '1.ª orden'
                return `<li><span class="av">${cara(p)}</span><span><b>${esc(p.corto)}</b><small>${o.dia} de ${MES.slice(0, 3)} · ${que}</small></span><em>${o.e.pts ? `+${miles(o.e.pts)}` : '✦'}</em></li>`
            }).join('')
        }

        // momento
        const mi = mom ? bi : -1
        if (mi !== momentoPrevio) {
            momentoPrevio = mi
            const caja = $('.momento')
            if (mom) {
                caja.className = `momento ver ${mom.clase === 'suave' ? 'suave' : ''}`
                $('small', caja).textContent = mom.kicker
                $('b', caja).innerHTML = mom.titulo
                $('span', caja).textContent = mom.detalle
                if (mom.clase === 'relevo' || mom.clase === 'abre') { const o = $('.lider .ovalo'); o.classList.remove('pum'); void o.offsetWidth; o.classList.add('pum') }
            } else caja.classList.remove('ver')
        }
        snap = false
        return quieto && !jugando
    }

    function etiqueta(o) { return `+${miles(o.e.pts)}${o.e.n >= 2 ? ` · ${o.e.n}.ª orden` : ''}` }

    function pintarLider(id, animar) {
        const caras = $('.lider .caras')
        const p = id ? PER.get(id) : null
        const nueva = document.createElement('div')
        nueva.className = 'cara-l' + (animar ? ' entra' : '')
        nueva.innerHTML = p ? cara(p) : '<span class="mono"><span>—</span></span>'
        $$('.cara-l', caras).forEach(c => { if (animar) { c.classList.add('sale'); later(() => c.remove(), 800) } else c.remove() })
        caras.appendChild(nueva)
        if (animar) requestAnimationFrame(() => requestAnimationFrame(() => nueva.classList.remove('entra')))
        $('.lider .nombre').textContent = p ? p.corto : 'Aún sin órdenes'
        if (!p) { $('.lider .pts').textContent = 'El mes apenas empieza'; $('.lider .desde').textContent = '' }
    }

    /* ---------- chispas y confeti ---------- */
    const lienzo = $('.chispas')
    const ctx = lienzo.getContext('2d')
    let parts = []
    let rafC = 0
    function ajustarLienzo() {
        const r = lienzo.getBoundingClientRect()
        const dpr = Math.min(2, devicePixelRatio || 1)
        lienzo.width = Math.round(r.width * dpr)
        lienzo.height = Math.round(r.height * dpr)
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const COLORES = ['--oro', '--oro-claro', '--rosa', '--fucsia', '--marfil'].map(color)
    function chispasEn(id) {
        const f = FILAS.get(id)
        if (!f) return
        const a = $('.av', f.el).getBoundingClientRect()
        const c = lienzo.getBoundingClientRect()
        lanzar(a.left - c.left + a.width / 2, a.top - c.top + a.height / 2, 46, 5)
    }
    function lanzar(x, y, n, fuerza, lluvia = false) {
        for (let i = 0; i < n; i++) {
            const ang = lluvia ? Math.PI / 2 + (Math.random() - .5) * 1.2 : Math.random() * Math.PI * 2
            const vel = (lluvia ? 1 + Math.random() * 3 : 1.5 + Math.random() * fuerza)
            parts.push({ x: lluvia ? Math.random() * lienzo.clientWidth : x, y: lluvia ? -20 - Math.random() * 120 : y, vx: Math.cos(ang) * vel, vy: Math.sin(ang) * vel - (lluvia ? 0 : 1.5), g: lluvia ? .05 : .12, r: Math.random() * Math.PI, vr: (Math.random() - .5) * .3, s: 3 + Math.random() * 5, c: COLORES[i % COLORES.length], vida: lluvia ? 220 : 70 + Math.random() * 30 })
        }
        if (!rafC) rafC = requestAnimationFrame(animarChispas)
    }
    function animarChispas() {
        if (!vivo) return
        ctx.clearRect(0, 0, lienzo.clientWidth, lienzo.clientHeight)
        parts = parts.filter(p => p.vida-- > 0 && p.y < lienzo.clientHeight + 20)
        for (const p of parts) {
            p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= .99; p.r += p.vr
            ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r)
            ctx.globalAlpha = Math.min(1, p.vida / 30)
            ctx.fillStyle = p.c
            ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2)
            ctx.restore()
        }
        rafC = parts.length ? requestAnimationFrame(animarChispas) : 0
    }
    function confeti() { lanzar(0, 0, 160, 0, true) }

    /* ---------- mandos ---------- */
    play.addEventListener('click', () => jugar(!jugando))
    $('[data-vel]').addEventListener('click', e => { vel = vel === 1 ? 2 : 1; e.currentTarget.textContent = `${vel}×` })
    $('[data-final]').addEventListener('click', () => { jugando = false; ir(TOTAL - 1) })
    $('[data-ir]').addEventListener('click', () => $('.cab-honor').scrollIntoView({ behavior: 'smooth' }))
    $('[data-ver]').addEventListener('click', () => { $('#carrera .escenario').scrollIntoView({ behavior: 'smooth' }); if (arrancado) jugar(true) })
    $('[data-otra]').addEventListener('click', () => { $('#carrera').scrollIntoView({ behavior: 'smooth' }); ir(0); jugar(true) })
    const pulso = $('.pulso')
    let arrastrando = false
    let seguia = false
    const xDe = e => { const r = pulso.getBoundingClientRect(); return (e.clientX - r.left) / r.width }
    pulso.addEventListener('pointerdown', e => { arrastrando = true; seguia = jugando; jugando = false; pulso.setPointerCapture(e.pointerId); ir(msDeX(xDe(e))) })
    pulso.addEventListener('pointermove', e => { if (arrastrando) ir(msDeX(xDe(e)), { soltar: false }) })
    const soltar = () => { if (!arrastrando) return; arrastrando = false; if (seguia) jugar(true); else marcarPlay() }
    pulso.addEventListener('pointerup', soltar)
    pulso.addEventListener('pointercancel', soltar)
    pulso.addEventListener('keydown', e => {
        const d = diaDe(ms)
        if (e.key === 'ArrowRight') { e.preventDefault(); ir(DIA_T[Math.min(ULT, d + 1)]) }
        if (e.key === 'ArrowLeft') { e.preventDefault(); ir(DIA_T[Math.max(1, d - 1)]) }
    })
    on(document, 'keydown', e => {
        if (pagina.classList.contains('junta')) return
        if (e.key === ' ' && !/^(BUTTON|INPUT)$/.test((root.activeElement || document.activeElement)?.tagName || '')) {
            const r = $('.escenario').getBoundingClientRect()
            if (r.top < innerHeight * .5 && r.bottom > innerHeight * .5) { e.preventDefault(); jugar(!jugando) }
        }
    })

    // arranca sola al llegar a la carrera; se pausa si te vas
    let pausaPorScroll = false
    observador(([en]) => {
        if (en.intersectionRatio >= .6) {
            if (!arrancado) { arrancado = true; later(() => jugar(true), 450) } else if (pausaPorScroll) { pausaPorScroll = false; jugar(true) }
        } else if (en.intersectionRatio < .25 && jugando) { pausaPorScroll = true; jugando = false; marcarPlay() }
    }, { threshold: [0, .25, .6, 1] }).observe($('.escenario'))

    /* ---------- el podio y cómo lo ganaron ---------- */
    function rangos(dias) {
        const out = []
        for (const d of dias) { const u = out[out.length - 1]; if (u && u[1] === d - 1) u[1] = d; else out.push([d, d]) }
        return out.map(([a, b]) => (a === b ? `el ${a}` : `del ${a} al ${b}`))
    }
    function camino(id) {
        const W = 268, H = 84, tope = 10
        const pts = []
        for (let d = 1; d <= ULT; d++) { const r = FIN[d].indexOf(id); if (r >= 0) pts.push([d, Math.min(tope, r + 1)]) }
        const X = d => ((d - 1) / (ULT - 1)) * W
        const Y = r => ((r - 1) / (tope - 1)) * H
        const linea = pts.map(([d, r], i) => `${i ? 'L' : 'M'}${X(d).toFixed(1)} ${Y(r).toFixed(1)}`).join(' ')
        const diasOrden = new Set(ORD.filter(b => b.e.p === id && b.e.pts > 0).map(b => b.dia))
        const puntos = pts.filter(([d]) => diasOrden.has(d)).map(([d, r]) => `<circle cx="${X(d).toFixed(1)}" cy="${Y(r).toFixed(1)}" r="${d === ULT ? 5 : 3.5}" fill="${d === ULT ? color('--oro-claro') : color('--oro')}"/>`).join('')
        const ult = pts[pts.length - 1]
        return `<svg viewBox="-8 -10 ${W + 16} ${H + 26}" role="img" aria-label="Su lugar día por día">`
            + `<line x1="0" x2="${W}" y1="0" y2="0" stroke="rgba(${color('--oro-rgb')},.35)" stroke-dasharray="3 4"/>`
            + `<line x1="0" x2="${W}" y1="${H}" y2="${H}" stroke="rgba(246,234,221,.12)"/>`
            + `<text x="${W + 6}" y="4" font-size="10" fill="rgba(${color('--oro-rgb')},.8)" font-family="Poppins">1.º</text>`
            + `<text x="${W + 6}" y="${H + 4}" font-size="10" fill="rgba(246,234,221,.4)" font-family="Poppins">${tope}.º</text>`
            + `<text x="0" y="${H + 16}" font-size="10" fill="rgba(246,234,221,.45)" font-family="Poppins">1</text>`
            + `<text x="${W}" y="${H + 16}" font-size="10" fill="rgba(246,234,221,.45)" font-family="Poppins" text-anchor="end">${ULT}</text>`
            + (linea ? `<path d="${linea}" fill="none" stroke="${color('--oro')}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>` : '')
            + puntos + (ult ? '' : '') + '</svg>'
    }
    function hechos(id, puesto) {
        const L = []
        const lid = []
        for (let d = 1; d <= ULT; d++) if (FIN[d][0] === id) lid.push(d)
        // su mayor salto en un solo día (sólo si ya estaba en la tabla: entrar de cero no es «saltar»)
        let salto = null
        for (let d = 2; d <= ULT; d++) {
            const a = FIN[d - 1].indexOf(id)
            const b = FIN[d].indexOf(id)
            if (a >= 0 && b >= 0 && a - b >= 3 && (!salto || a - b > salto.a - salto.b)) salto = { d, a, b }
        }
        if (salto) L.push(`El ${salto.d} saltó del <b>${lugar(salto.a + 1)} al ${lugar(salto.b + 1)} lugar</b> en un solo día.`)
        const soloUltimo = lid.length === 1 && lid[0] === ULT
        const yaContado = salto && lid.length === 1 && salto.d === lid[0] // el salto ya dice que llegó al 1.º ese día
        if (lid.length && !(soloUltimo && puesto === 1) && !yaContado) L.push(`Ocupó el primer lugar ${rangos(lid).join(' y ')} (<b>${lid.length} ${lid.length === 1 ? 'día' : 'días'}</b>).`)
        const ords = ORD.filter(b => b.e.p === id && b.e.tipo === 'compra')
        if (ords.length === 1) L.push(`Todo en una sola orden de <b>${miles(ords[0].e.pts)} puntos</b>, el ${ords[0].dia} de ${MES}.`)
        else if (ords.length > 1) L.push(`<b>${ords.length} órdenes</b> en el mes: ${ords.map(b => `+${miles(b.e.pts)} el ${b.dia}`).join(', ')}.`)
        return L
    }
    function podio() {
        const r = FIN[ULT].slice(0, 3)
        const que = ['Primer lugar', 'Segundo lugar', 'Tercer lugar']
        if (!COMPRAS) {
            // sin órdenes no hay carrera: el podio es el del reporte de ventas
            const pts = new Map((D.cuadro || []).map(c => [c.p, c.pts]))
            $('.tres').innerHTML = r.map((id, i) => {
                const p = PER.get(id)
                return `<article class="lugar l${i + 1}"><div class="ovalo">${cara(p)}</div><span class="medalla">${i + 1}</span>`
                    + `<span class="que">${que[i]}</span><h3>${esc(p.nombre)}</h3><span class="total">${miles(pts.get(id) || 0)} puntos</span></article>`
            }).join('')
            const io = observador(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ver'); io.unobserve(e.target) } }), { threshold: .25 })
            $$('.lugar').forEach(l => io.observe(l))
            return
        }
        const { v } = valores(TOTAL)
        $('.tres').innerHTML = r.map((id, i) => {
            const p = PER.get(id)
            return `<article class="lugar l${i + 1}"><div class="ovalo">${cara(p)}</div><span class="medalla">${i + 1}</span>`
                + `<span class="que">${que[i]}</span><h3>${esc(p.nombre)}</h3><span class="total">${miles(v.get(id))} puntos</span>`
                + `<div class="camino"><p>Su camino en el mes</p>${camino(id)}<ul>${hechos(id, i + 1).map(h => `<li>${h}</li>`).join('')}</ul></div></article>`
        }).join('')
        const io = observador(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ver'); io.unobserve(e.target) } }), { threshold: .25 })
        $$('.lugar').forEach(l => io.observe(l))
    }

    /* ======================================================================================================
       Las demás partes del mes. Todo sale de las mismas órdenes que la carrera.
       ====================================================================================================== */
    const compras = EV.filter(e => e.tipo === 'compra' && e.pts > 0)
    const ACUM = [] // puntos de cada quien al cerrar cada día
    {
        const m = new Map()
        for (let d = 1; d <= ULT; d++) { compras.filter(e => e.dia === d).forEach(e => m.set(e.p, (m.get(e.p) || 0) + e.pts)); ACUM[d] = new Map(m) }
    }
    const ORDENARON = ACUM[ULT].size
    const mesCorto = MES.slice(0, 3)
    const miniCara = (p, clase = 'mi') => `<span class="${clase}">${cara(p)}</span>`
    const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`

    /* ---------- 4. nivel de descuento: la escalera (35 / 40 / 50 %) y sus corazones ---------- */
    const NIV = (D.descuento && D.descuento.niveles) || {}
    const COR = (D.descuento && D.descuento.corazones) || { 35: 1, 40: 2, 50: 3 }
    const ESCALONES = [50, 40, 35]
    const nivelEn = (id, d) => { const n = NIV[id] || {}; for (const k of ESCALONES) if (n[k] && n[k] <= d) return k; return 0 }
    const corazon = n => '♥'.repeat(n)
    const corazonesTxt = n => `${n} ${n === 1 ? 'corazón' : 'corazones'}`
    function armarClubes() {
        const filas = [...ESCALONES, 0]
        $('.peldanos').innerHTML = filas.map((k, i) => {
            const et = k === 0 ? '<b>Ordenaron, aún sin descuento</b><small></small>'
                : `<b>${k} %</b><span class="cor" aria-label="${corazonesTxt(COR[k])} de Círculo Rosa">${corazon(COR[k])}</span><small></small>`
            return `<div class="peldano${k === 0 ? ' suelo' : ''}${k === 50 ? ' top' : ''}" data-k="${k}" style="--i:${filas.length - 1 - i}"><div class="et">${et}</div><div class="gente"></div></div>`
        }).join('')
        const fin = id => nivelEn(id, ULT)
        const ids = [...ACUM[ULT].keys()]
        const con = ids.filter(id => fin(id) > 0)
        const n = k => con.filter(id => fin(id) === k).length
        const quienes = con.length === ids.length ? `Las <b>${con.length} consultoras</b> que ordenaron llegaron a un nivel de descuento` : `<b>${con.length} de las ${ids.length} consultoras</b> que ordenaron llegaron a un nivel de descuento`
        const conserva = D.descuento && D.descuento.conserva
        $('#descuento .sub').innerHTML = `${quienes}: <b>${n(50)}</b> al 50 %, <b>${n(40)}</b> al 40 % y <b>${n(35)}</b> al 35 %. Cada nivel suma corazones de Círculo Rosa: 1 con 35 %, 2 con 40 % y 3 con 50 %.`
            + (conserva && con.length ? ` Y como ${conserva} conserva el mejor nivel de ${MES}, empiezan ${conserva} con su descuento asegurado.` : '')
    }
    const AVC = new Map()
    const avc = id => {
        if (!AVC.has(id)) {
            const p = PER.get(id)
            const b = document.createElement('button')
            b.type = 'button'
            b.className = 'av-c'
            b.dataset.p = id
            b.setAttribute('aria-label', p.nombre)
            b.innerHTML = cara(p)
            AVC.set(id, b)
        }
        return AVC.get(id)
    }
    let diaC = 0
    function pintarClubes(d, animar) {
        const antes = new Map()
        if (animar) AVC.forEach((el, id) => { if (el.isConnected) antes.set(id, el.getBoundingClientRect()) })
        const hoy = [...(ACUM[d] || new Map()).keys()]
        const subieron = []
        $$('.peldano').forEach(f => {
            const k = +f.dataset.k
            // en cada escalón, primero quien llegó antes
            const ids = hoy.filter(id => nivelEn(id, d) === k).sort((a, b) => ((NIV[a] || {})[k] || 0) - ((NIV[b] || {})[k] || 0))
            const g = $('.gente', f)
            ids.forEach(id => g.appendChild(avc(id)))
            $('.et small', f).textContent = ids.length ? plural(ids.length, 'consultora', 'consultoras') : ''
            ids.forEach(id => { if (k > 0 && (NIV[id] || {})[k] === d) subieron.push([id, k]) })
        })
        AVC.forEach((el, id) => { if (!hoy.includes(id) && el.isConnected) el.remove() })
        AVC.forEach((el, id) => {
            el.classList.toggle('subio', subieron.some(([s]) => s === id))
            if (!animar || !el.isConnected) return
            const a = antes.get(id)
            const b = el.getBoundingClientRect()
            if (!a) { el.animate([{ opacity: 0, transform: 'scale(.3)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.2,.8,.2,1)' }); return }
            const dx = a.left - b.left
            const dy = a.top - b.top
            if (Math.abs(dx) + Math.abs(dy) > 1) el.animate([{ transform: `translate(${dx}px,${dy}px)` }, { transform: 'none' }], { duration: 760, easing: 'cubic-bezier(.2,.8,.2,1)' })
        })
        $('.dia-c .n').textContent = d
        $('.semana-c').textContent = semana(d)
        $('.rango').value = d
        $('.subidas').innerHTML = subieron.length
            ? `Hoy ${subieron.length === 1 ? 'subió' : 'subieron'}: ${subieron.slice(0, 4).map(([id, k]) => `<b>${esc(PER.get(id).corto)}</b> al ${k} %`).join(', ')}${subieron.length > 4 ? ` y ${subieron.length - 4} más` : ''}.`
            : d === ULT ? `Así cerró ${MES}.` : 'Nadie cambió de nivel este día.'
        diaC = d
        return subieron.length
    }
    let relojC = 0
    const playC = $('[data-play-c]')
    const marcarC = on => { playC.classList.toggle('on', on); playC.setAttribute('aria-label', on ? 'Pausar la escalera' : 'Reproducir la escalera') }
    function jugarC(on) {
        clearTimeout(relojC)
        marcarC(on)
        if (!on) return
        if (diaC >= ULT) pintarClubes(1, false)
        const paso = () => {
            if (diaC >= ULT) { marcarC(false); return }
            const n = pintarClubes(diaC + 1, true)
            relojC = later(paso, n ? 1150 : 380)
        }
        relojC = later(paso, 400)
    }
    playC.addEventListener('click', () => jugarC(!playC.classList.contains('on')))
    $('.rango').addEventListener('input', e => { jugarC(false); pintarClubes(+e.target.value, true) })
    const globo = $('.globo')
    $('.peldanos').addEventListener('click', e => {
        const b = e.target.closest('.av-c')
        if (!b) { globo.hidden = true; return }
        const id = b.dataset.p
        const p = PER.get(id)
        const k = nivelEn(id, diaC)
        const r = b.getBoundingClientRect()
        const c = $('.escala').getBoundingClientRect()
        globo.innerHTML = `<b>${esc(p.nombre)}</b>` + (k ? `Llegó al ${k} % el ${NIV[id][k]} de ${MES}<br>Suma ${corazonesTxt(COR[k])} de Círculo Rosa` : `Al ${diaC} de ${MES} todavía no llegaba al 35 %`)
        globo.hidden = false
        globo.style.left = `${Math.max(0, Math.min(c.width - 230, r.left - c.left + r.width / 2 - 115))}px`
        globo.style.top = `${r.bottom - c.top + 10}px`
    })
    on(root, 'click', e => { if (!e.target.closest('.peldanos')) globo.hidden = true })

    /* ---------- 5. Círculo Rosa: la constancia ---------- */
    function armarCirculo() {
        const c = D.circulo
        if (!c) { $('.circulo').remove(); return }
        const anios = m => Math.floor(m / 12)
        const hito = m => (m === 3 ? 'Cumplió 3 meses' : m === 6 ? 'Llegó a VIP' : m === 9 ? 'Llegó a VIP Plus' : m === 12 ? 'Llegó a VIP Gold' : `Cumplió ${anios(m)} años sin fallar`)
        $('.circulo .sub').innerHTML = `<b>${c.total} consultoras</b> están en Círculo Rosa en ${MES}${c.entraron.length ? ` y <b>${c.entraron.length}</b> ${c.entraron.length === 1 ? 'entró' : 'entraron'} este mes` : ''}. Aquí se celebra a las que no fallan.`
        $('.cr-cifras').innerHTML = [[c.total, 'en Círculo Rosa'], [c.entraron.length, 'entraron este mes'], [c.tres, 'ganaron los 3 corazones del mes']]
            .map(([n, t]) => `<div><b data-cuenta="${n}">0</b><span>${t}</span></div>`).join('')
        $('.cr-hitos').innerHTML = c.hitos.map((h, i) => {
            const p = PER.get(h.p)
            const grande = h.meses >= 24 ? `${anios(h.meses)}<small>años</small>` : `${h.meses}<small>meses</small>`
            return `<article class="cr-hito revela" style="--fd:${(i * .6).toFixed(1)}s"><span class="etq">${hito(h.meses)}</span><div class="ovalo-n">${cara(p)}</div>`
                + `<b class="grande">${grande}</b><h3>${esc(p.nombre)}</h3><small>${h.meses} meses seguidos en Círculo Rosa</small></article>`
        }).join('')
        const fila = (p, der) => `<li><span class="av">${cara(p)}</span><b>${esc(p.corto)}</b><em>${der}</em></li>`
        $('.cr-listas').innerHTML = `<div><h3>Las más constantes</h3><ol>${c.constantes.map(x => fila(PER.get(x.p), `${x.meses} meses <small>· ${anios(x.meses)} años</small>`)).join('')}</ol></div>`
            + `<div><h3>Más corazones en su ciclo</h3><ol>${c.corazones.map(x => fila(PER.get(x.p), `<span class="cor">♥</span> ${x.c}${x.c >= 36 ? ' <small>· ¡el máximo!</small>' : ''}`)).join('')}</ol><p class="nota">El ciclo dura 12 meses y junta hasta 36 corazones: 3 por mes con órdenes de 50 %.</p></div>`
        $('.cr-entraron').innerHTML = c.entraron.length
            ? `<h3>Entraron a Círculo Rosa en ${MES}</h3><div class="caritas">${c.entraron.map(id => `<span title="${esc(PER.get(id).nombre)}">${cara(PER.get(id))}</span>`).join('')}</div>`
            : ''
    }
    function contar(el) {
        const fin = +el.dataset.cuenta
        const t0 = performance.now()
        const paso = t => { const f = Math.min(1, (t - t0) / 1400); el.textContent = miles(fin * suave(f)); if (f < 1) requestAnimationFrame(paso) }
        requestAnimationFrame(paso)
    }

    /* ---------- 6. calendario ---------- */
    function armarCalendario() {
        const primero = (new Date(D.anio, MESES.indexOf(MES), 1).getDay() + 6) % 7 // lunes = 0
        const porDiaE = d => EV.filter(e => e.dia === d && (e.tipo === 'inicio' || e.pts > 0))
        const ptsDia = d => porDiaE(d).reduce((s, e) => s + e.pts, 0)
        const total = compras.reduce((s, e) => s + e.pts, 0)
        let fuerte = 1
        for (let d = 1; d <= ULT; d++) if (ptsDia(d) > ptsDia(fuerte)) fuerte = d
        const maxD = ptsDia(fuerte) || 1
        $('.sem-cab').innerHTML = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(x => `<span>${x}</span>`).join('') + '<span>Semana</span>'
        const celdas = []
        const semanas = Math.ceil((primero + ULT) / 7)
        let k = 0
        for (let s = 0; s < semanas; s++) {
            let sumaS = 0
            let ordS = 0
            for (let c = 0; c < 7; c++) {
                const d = s * 7 + c - primero + 1
                if (d < 1 || d > ULT) { celdas.push('<span class="celda vacia"></span>'); continue }
                const evs = porDiaE(d)
                const pts = ptsDia(d)
                sumaS += pts
                ordS += evs.filter(e => e.tipo === 'compra').length
                const caras = [...evs].sort((a, b) => b.pts - a.pts)
                const max = 4
                const html = caras.slice(0, max).map(e => `<span class="mi${e.n >= 2 ? ' dos' : ''}">${cara(PER.get(e.p))}</span>`).join('') + (caras.length > max ? `<span class="mas-d">+${caras.length - max}</span>` : '')
                const a = pts ? (.08 + .55 * Math.pow(pts / maxD, .6)).toFixed(3) : 0
                celdas.push(`<button type="button" class="celda${pts ? '' : ' sin'}${d === fuerte ? ' fuerte' : ''}" data-d="${d}" style="--a:${a};--k:${k++}" aria-pressed="false" aria-label="${d} de ${MES}: ${plural(evs.length, 'orden', 'órdenes')}">`
                    + `<span class="num">${d}${pts ? `<small>${miles(pts)}</small>` : ''}</span><span class="caras-d">${html}</span>${evs.some(e => e.tipo === 'inicio') ? '<span class="estrella" title="Nuevo Inicio">✦</span>' : ''}</button>`)
            }
            celdas.push(`<div class="semana-t"><small>Semana ${s + 1}</small><b>${miles(sumaS)}</b><span>${plural(ordS, 'orden', 'órdenes')}</span></div>`)
        }
        $('.celdas').innerHTML = celdas.join('')
        const repitieron = new Set(compras.filter(e => e.n >= 2).map(e => e.p)).size
        const diasCon = new Set(compras.map(e => e.dia)).size
        const pct = Math.round(ptsDia(fuerte) / total * 100)
        $('.calendario .sub').innerHTML = `<b>${ORDENARON} consultoras</b> ordenaron en ${diasCon} días distintos; <b>${repitieron}</b> ${repitieron === 1 ? 'hizo' : 'hicieron'} dos órdenes o más. El ${fuerte} fue el día más fuerte: <b>${pct} %</b> de los puntos del mes. Toca un día para ver quién ordenó.`
        const elegir = d => {
            $$('.celda[data-d]').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.d === d)))
            const evs = ORD.filter(b => b.dia === d && (b.e.tipo === 'inicio' || b.e.pts > 0))
            const pts = evs.reduce((s, b) => s + b.e.pts, 0)
            const nOrd = evs.filter(b => b.e.tipo === 'compra').length
            $('.detalle').innerHTML = `<h3><small>${semana(d)}</small>${d} de ${MES}</h3>`
                + (evs.length
                    ? `<div class="cifras"><span><b>${plural(nOrd, 'orden', 'órdenes')}</b></span><span><b>${miles(pts)}</b> puntos</span>${pts ? `<span><b>${Math.round(pts / total * 100)} %</b> del mes</span>` : ''}</div>`
                    + `<ol>${evs.map(b => {
                        const p = PER.get(b.e.p)
                        const que = b.e.tipo === 'inicio' ? 'Nuevo Inicio' : `${b.e.n}.ª orden del mes`
                        return `<li><span class="av">${cara(p)}</span><span><b>${esc(p.corto)}</b><small${b.e.n >= 2 ? ' class="dos"' : ''}>${que}</small></span><em>${b.e.pts ? `+${miles(b.e.pts)}` : '✦'}</em></li>`
                    }).join('')}</ol>`
                    : '<p class="nada">Este día no entraron órdenes.</p>')
        }
        $('.celdas').addEventListener('click', e => { const c = e.target.closest('.celda[data-d]'); if (c) elegir(+c.dataset.d) })
        elegir(fuerte)
    }

    /* ---------- 6b. Tempraneras (opcional) ---------- */
    // No es de Mary Kay: cada Directora la enciende si quiere y elige hasta qué día cuenta. Es un ajuste suyo que
    // guarda la API (boletin_dinamico_ajustes); sin órdenes no hay de dónde sacarla.
    let TEM = { activa: false, hasta: 10, ...((D.ajustes && D.ajustes.tempraneras) || {}) }
    function armarTempraneras() {
        const sec = $('#tempraneras')
        const ver = TEM.activa && COMPRAS > 0
        sec.hidden = !ver
        $('[data-tem-link]').hidden = !ver
        if (!ver) return
        const hasta = TEM.hasta
        // la primera compra de cada quien, en el orden en que entraron
        const primera = new Map()
        ORD.forEach((b, i) => { if (b.e.tipo === 'compra' && b.e.pts > 0 && !primera.has(b.e.p)) primera.set(b.e.p, { dia: b.dia, i, pts: b.e.pts }) })
        const tem = [...primera].filter(([, x]) => x.dia <= hasta).sort((a, b) => a[1].i - b[1].i)
        const primeraP = tem[0] ? PER.get(tem[0][0]) : null
        $('#tempraneras .sub').innerHTML = tem.length
            ? `<b>${plural(tem.length, 'consultora', 'consultoras')}</b> ${tem.length === 1 ? 'hizo' : 'hicieron'} su primera orden del mes entre el 1 y el ${hasta} de ${MES}. La más temprana: <b>${esc(primeraP.corto)}</b>, el ${tem[0][1].dia}.`
            : `Nadie ordenó entre el 1 y el ${hasta} de ${MES}.`
        // la franja de los primeros días, con las caras en el día que ordenaron
        const porDiaT = new Map()
        tem.forEach(([id, x]) => porDiaT.set(x.dia, [...(porDiaT.get(x.dia) || []), id]))
        $('.madrugada').style.setProperty('--n', hasta)
        $('.madrugada').innerHTML = Array.from({ length: hasta }, (_, i) => {
            const d = i + 1
            const ids = porDiaT.get(d) || []
            return `<div class="col-t${ids.length ? '' : ' vacia'}"><div class="pila-t">${ids.map((id, k) => `<span class="mi-t" style="--k:${k}" title="${esc(PER.get(id).nombre)}">${cara(PER.get(id))}</span>`).join('')}</div><span class="d-t">${d}</span></div>`
        }).join('')
        $('.tempranas').innerHTML = tem.map(([id, x], i) => {
            const p = PER.get(id)
            return `<article class="tempra revela${i === 0 ? ' prim' : ''}" style="--fd:${(i * .4).toFixed(1)}s">${i === 0 ? `<span class="corona-t">${CORONA}La más temprana</span>` : `<span class="n-t">${i + 1}.ª</span>`}`
                + `<div class="ovalo-n">${cara(p)}</div><h3>${esc(p.corto)}</h3><small>Ordenó el ${x.dia} de ${MES}</small><b>+${miles(x.pts)} puntos</b></article>`
        }).join('')
        // si la sección ya estaba a la vista, que lo nuevo aparezca sin esperar a otro scroll
        if ($('.madrugada').classList.contains('ver')) $$('.tempranas .revela').forEach(el => el.classList.add('ver'))
        else if (observarRevela) $$('.tempranas .revela').forEach(observarRevela)
    }
    // el panel de ajustes de la Directora
    function armarAjustes() {
        const sel = $('[data-tem-dia]')
        sel.innerHTML = Array.from({ length: ULT }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')
        sel.value = TEM.hasta
        const tem = $('[data-tem-on]')
        tem.checked = !!TEM.activa
        sel.disabled = !TEM.activa || !COMPRAS
        tem.disabled = !COMPRAS
        $('[data-tem-nota]').hidden = COMPRAS > 0
        const guardado = $('.guardado')
        const avisar = p => {
            guardado.textContent = 'Guardando…'
            Promise.resolve(p).then(() => { guardado.textContent = 'Guardado' }, () => { guardado.textContent = 'No se pudo guardar. Revisa tu conexión.' })
        }
        const cambio = () => {
            TEM = { activa: tem.checked, hasta: +sel.value }
            sel.disabled = !tem.checked
            armarTempraneras()
            if (op.guardarAjustes) avisar(op.guardarAjustes({ tempraneras_activa: TEM.activa, tempraneras_hasta: TEM.hasta }))
        }
        tem.addEventListener('change', cambio)
        sel.addEventListener('change', cambio)
        // el mensaje de la Directora: opcional, sale al cierre con su foto; se guarda al dejar de escribir
        const msg = $('[data-msg]')
        const pintarMsg = () => { const t = msg.value.trim(); const m = $('.mensaje-d'); m.hidden = !t; m.textContent = t }
        msg.value = (D.ajustes && D.ajustes.mensaje) || ''
        pintarMsg()
        let tMsg = 0
        msg.addEventListener('input', () => {
            pintarMsg()
            clearTimeout(tMsg)
            tMsg = later(() => { if (op.guardarMensaje) avisar(op.guardarMensaje(msg.value.trim())) }, 900)
        })
        // el mes del boletín
        const mesSel = $('[data-mes-sel]')
        const meses = op.meses || []
        if (meses.length) {
            mesSel.innerHTML = meses.map(m => `<option value="${esc(m.valor)}">${esc(m.etiqueta)}</option>`).join('')
            mesSel.value = op.mes || meses[0].valor
            mesSel.addEventListener('change', () => op.cambiarMes && op.cambiarMes(mesSel.value))
        } else mesSel.closest('label').remove()
        const b = $('[data-ajustes]')
        const panel = $('#ajustes')
        b.addEventListener('click', () => { panel.hidden = !panel.hidden; b.setAttribute('aria-expanded', String(!panel.hidden)) })
        // dentro del Shadow DOM el «click» de document llega con el anfitrión como destino: se escucha en la raíz
        on(root, 'click', e => { if (!panel.hidden && !e.target.closest('#ajustes, [data-ajustes]')) { panel.hidden = true; b.setAttribute('aria-expanded', 'false') } })
    }

    /* ---------- 7. iniciadoras y Nuevos Inicios ---------- */
    const fechaLarga = iso => { const [, m, d] = iso.split('-'); return `${+d} de ${MESES[+m - 1]}` }
    const delMesIso = `${D.anio}-${String(MESES.indexOf(MES) + 1).padStart(2, '0')}`
    function tarjetaNueva(n, clase = 'llegada revela') {
        const p = PER.get(n.p) || { nombre: n.nombre, foto: n.foto }
        const esDelMes = n.inicio.slice(0, 7) === delMesIso
        const ini = n.iniciadora
        const ptsMes = n.pasos.reduce((s, x) => s + x.pts, 0)
        const nivel = n.p ? nivelEn(n.p, ULT) : 0
        const rk = n.p ? FIN[ULT].indexOf(n.p) + 1 : 0
        // la línea del mes: dónde entró y qué hizo
        const hitos = n.pasos.map(x => {
            const que = x.tipo === 'inicio' ? 'Nuevo Inicio' : esDelMes && x === n.pasos.find(y => y.tipo === 'compra') ? `Primera orden<br><b>+${miles(x.pts)}</b>` : `Orden de<br><b>${miles(x.pts)} puntos</b>`
            return `<span class="hito${x.tipo === 'inicio' ? ' ini' : ''}" style="left:${((x.dia - 1) / (ULT - 1) * 100).toFixed(1)}%"><i></i><span><b>${x.dia} ${mesCorto}</b><br>${que}</span></span>`
        })
        const d0 = n.pasos.length ? n.pasos[0].dia : 1
        const d1 = n.pasos.length ? n.pasos[n.pasos.length - 1].dia : 1
        const tramo = n.pasos.length > 1 ? `<span class="tramo" style="left:${((d0 - 1) / (ULT - 1) * 100).toFixed(1)}%;width:${((d1 - d0) / (ULT - 1) * 100).toFixed(1)}%"></span>` : ''
        const logro = !esDelMes && ptsMes
            ? `En su primer mes completo ordenó <b>${miles(ptsMes)} puntos</b>${nivel ? ` y llegó al <b>${nivel} % de descuento</b>` : ''}${rk ? `; terminó en el ${lugar(rk)} lugar de la unidad` : ''}.`
            : esDelMes && ptsMes ? `Cerró su primer mes con <b>${miles(ptsMes)} puntos</b>${nivel ? ` y el <b>${nivel} % de descuento</b>` : ''}.` : esDelMes ? 'Empezó su camino en la unidad este mes.' : ''
        return `<article class="${clase}"><span class="etq">${esDelMes ? `Nuevo Inicio · ${fechaLarga(n.inicio)}` : `Llegó el ${fechaLarga(n.inicio)}`}</span>`
            + `<div class="ovalo-n">${cara(p)}</div><h3>${esc(p.nombre)}</h3>`
            + (ini && !esDelMes ? `<p class="trajo">${miniCara(ini, 'mini')}<span>Iniciadora: <b>${esc(corto(ini.nombre))}</b></span></p>` : '')
            + `<div class="linea-n"><span class="ini-l">1</span><span class="fin-l">${ULT}</span>${tramo}${hitos.join('')}</div>`
            + (logro ? `<p class="logro">${logro}</p>` : '') + '</article>'
    }
    function armarLlegadas() {
        const nuevas = D.nuevas || []
        const inis = (D.iniciadoras || []).filter(i => i.inicios > 0)
        const totalInicios = inis.reduce((s, i) => s + i.inicios, 0)
        const delMes = nuevas.filter(n => n.inicio.slice(0, 7) === delMesIso)
        const conOrden = delMes.filter(n => n.pasos.some(s => s.tipo === 'compra')).length
        $('.llegadas .sub').innerHTML = inis.length
            ? `<b>${plural(inis.length, 'iniciadora', 'iniciadoras')}</b> ${inis.length === 1 ? 'sumó' : 'sumaron'} <b>${plural(totalInicios, 'Nuevo Inicio', 'Nuevos Inicios')}</b> a la unidad en ${MES}${conOrden ? ` y ${conOrden === 1 ? 'una de ellas ya hizo' : `${conOrden} ya hicieron`} su primera orden` : ''}.`
            : `En ${MES} no hubo Nuevos Inicios.`
        $('.pares').innerHTML = inis.map(i => {
            const p = PER.get(i.p)
            const trajo = i.trajo.map(id => nuevas.find(n => n.p === id)).filter(Boolean)
            return `<article class="par revela"><div class="quien-i"><span class="etq">Iniciadora del mes</span><div class="ovalo-i">${cara(p)}</div><h3>${esc(p.nombre)}</h3>`
                + `<small>Su equipo: <b>${i.totales}</b> · ${i.activas} ${i.activas === 1 ? 'activa' : 'activas'}</small></div>`
                + `<div class="lazo" aria-hidden="true"><svg viewBox="0 0 120 40" preserveAspectRatio="none"><path d="M2 30 C 40 2, 80 2, 118 30" fill="none" stroke="url(#gl)" stroke-width="2" stroke-dasharray="5 6"/><defs><linearGradient id="gl"><stop offset="0" stop-color="${color('--oro')}"/><stop offset="1" stop-color="${color('--rosa')}"/></linearGradient></defs></svg><span>inició a</span></div>`
                + (trajo.length ? trajo.map(n => tarjetaNueva(n, 'nueva-i')).join('') : `<div class="nueva-i"><p class="logro">Sumó <b>${plural(i.inicios, 'Nuevo Inicio', 'Nuevos Inicios')}</b> en ${MES}.</p></div>`) + '</article>'
        }).join('')
        // las del mes anterior que cerraron su primer mes completo
        const previas = nuevas.filter(n => n.inicio.slice(0, 7) !== delMesIso)
        $('[data-previas]').hidden = !previas.length
        $('.tarjetas').innerHTML = previas.map(n => tarjetaNueva(n)).join('')
    }

    /* ---------- 3b. Estrellas del trimestre ---------- */
    const JOYA = { perla: 'Perla', esmeralda: 'Esmeralda', diamante: 'Diamante', rubi: 'Rubí', zafiro: 'Zafiro' }
    const ESTRELLA_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"/></svg>'
    function armarEstrellas() {
        const E = D.estrellas
        if (!E || !E.lista.length) { $('#estrellas').remove(); return }
        $('.trimestre').textContent = E.trimestre
        const orden = Object.keys(JOYA)
        const cuenta = orden.map(k => [k, E.lista.filter(x => x.estrella === k).length]).filter(([, n]) => n)
        const subieron = E.lista.filter(x => x.antes && x.antes !== x.estrella).length
        const nuevas = E.lista.filter(x => !x.antes).length
        const lista = cuenta.map(([k, n]) => `${n} ${JOYA[k]}`)
        $('#estrellas .sub').innerHTML = `<b>${plural(E.lista.length, 'consultora', 'consultoras')}</b> cerraron el trimestre como Estrella: ${lista.length > 1 ? `${lista.slice(0, -1).join(', ')} y ${lista[lista.length - 1]}` : lista[0]}.`
            + (subieron ? ` ${subieron === 1 ? 'Una subió' : `${subieron} subieron`} de estrella con sus órdenes de ${MES}` : '') + (nuevas ? `${subieron ? ' y' : ''} ${nuevas === 1 ? 'una se volvió' : `${nuevas} se volvieron`} Estrella en ${MES}` : '') + (subieron || nuevas ? '.' : '')
        // el joyero: la escala del trimestre con cada quien en su lugar; al verla, cada cara viaja de agosto a septiembre
        const tope = Math.max(E.cortes.perla, ...E.lista.map(x => x.total)) * 1.02
        const X = v => (v / tope * 100).toFixed(2)
        const cortes = orden.slice().reverse().map(k => `<span class="corte-j j-${k}" style="left:${X(E.cortes[k])}%"><i>${ESTRELLA_SVG}</i><b>${JOYA[k]}</b><small>${miles(E.cortes[k])}</small></span>`).join('')
        // cada cara en un carril: si dos quedan cerca (al inicio o al final del viaje) van en carriles distintos
        const carriles = []
        const carril = E.lista.map(x => {
            const xs = [x.meses[0] + x.meses[1], x.total].map(v => v / tope * 100)
            let c = carriles.findIndex(ocup => ocup.every(o => Math.abs(o[0] - xs[0]) > 6 && Math.abs(o[1] - xs[1]) > 6))
            if (c < 0) { carriles.push([]); c = carriles.length - 1 }
            carriles[c].push(xs)
            return c
        })
        $('.joyero').style.setProperty('--carriles', carriles.length)
        $('.joyero').innerHTML = `<div class="riel-j"></div>${cortes}`
            + E.lista.map((x, i) => `<span class="cara-j j-${x.estrella}" style="--de:${X(x.meses[0] + x.meses[1])}%;--a:${X(x.total)}%;--k:${i};--c:${carril[i]}" title="${esc(PER.get(x.p).nombre)} · ${miles(x.total)} puntos">${cara(PER.get(x.p))}</span>`).join('')
            + `<p class="nota-j">Cada cara sale de donde iba al cerrar agosto y llega a donde cerró ${MES}.</p>`
        // tarjetas, de la estrella más alta a la más baja
        $('.joyas').innerHTML = E.lista.map((x, i) => {
            const p = PER.get(x.p)
            const sobra = x.total - E.cortes[x.estrella]
            const hechos = []
            if (x.dia) hechos.push(`Se aseguró ${JOYA[x.estrella]} el ${x.dia} de ${MES}${sobra < 100 ? `, ¡por ${plural(sobra, 'punto', 'puntos')}!` : '.'}`)
            if (x.antes && x.antes !== x.estrella) hechos.push(`Con ${MES} subió de ${JOYA[x.antes]} a ${JOYA[x.estrella]}.`)
            else if (!x.antes) hechos.push(`${MES[0].toUpperCase() + MES.slice(1)} le dio su estrella.`)
            const seg = x.meses.map((v, k) => `<i class="m${k}" style="--w:${(v / x.total * 100).toFixed(2)}%"></i>`).join('')
            return `<article class="joya j-${x.estrella} revela" style="--fd:${(i * .5).toFixed(1)}s"><span class="sello">${ESTRELLA_SVG}${JOYA[x.estrella]}</span>`
                + `<div class="ovalo-n">${cara(p)}</div><h3>${esc(p.nombre)}</h3><b class="tot">${miles(x.total)} <small>puntos en el trimestre</small></b>`
                + `<div class="meses-j">${seg}</div><div class="leyenda-j"><span>Jul ${miles(x.meses[0])}</span><span>Ago ${miles(x.meses[1])}</span><span>Sep ${miles(x.meses[2])}</span></div>`
                + `<ul>${hechos.map(h => `<li>${h}</li>`).join('')}</ul></article>`
        }).join('')
    }

    /* ---------- 7b. Camino al Éxito ---------- */
    // Las etapas por activas en su equipo, como MonthlyReportService::getRoadToSuccessReport
    const ETAPAS = [{ k: 'diq', desde: 10, nombre: 'Rumbo a Directora en Calificación' }, { k: 'fd', desde: 5, nombre: 'Futura Directora' }, { k: 'rumbo', desde: 1, nombre: 'Rumbo a Futura Directora' }]
    const etapaDe = a => ETAPAS.find(e => a >= e.desde)
    function armarCamino() {
        const C = D.camino || []
        if (!C.length) { $('#camino').remove(); return }
        const n = k => C.filter(c => etapaDe(c.activas).k === k).length
        const frase = { diq: ['va rumbo a Directora en Calificación', 'van rumbo a Directora en Calificación'], fd: ['es Futura Directora', 'son Futuras Directoras'], rumbo: ['va rumbo a Futura Directora', 'van rumbo a Futura Directora'] }
        const partes = ETAPAS.map(e => [e, n(e.k)]).filter(([, x]) => x).map(([e, x]) => `<b>${x}</b> ${frase[e.k][x === 1 ? 0 : 1]}`)
        $('#camino .sub').innerHTML = `<b>${plural(C.length, 'consultora', 'consultoras')}</b> ya ${C.length === 1 ? 'está formando' : 'están formando'} su equipo: ${partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]}. Las etapas se miden por las activas de su equipo.`
        // la ruta: 0 a 12 activas, con las paradas de Futura Directora (5) y Directora en Calificación (10)
        const tope = Math.max(12, ...C.map(c => c.activas + 1))
        const X = a => (a / tope * 100).toFixed(2)
        const porA = new Map()
        C.forEach(c => porA.set(c.activas, [...(porA.get(c.activas) || []), c]))
        $('.ruta').innerHTML = `<div class="camino-l"><i></i></div>`
            + [{ a: 5, t: 'Futura Directora' }, { a: 10, t: 'Directora en Calificación' }].map(m => `<span class="parada" style="left:${X(m.a)}%"><b>${m.a}</b><small>${m.t}</small></span>`).join('')
            + [...porA].map(([a, cs], i) => `<span class="grupo-r" style="--x:${X(a)}%;--k:${i}">${cs.map(c => `<span class="cara-r" title="${esc(PER.get(c.p).nombre)} · ${c.activas} activas">${cara(PER.get(c.p))}</span>`).join('')}</span>`).join('')
            + `<span class="cero" style="left:0">0</span><span class="cero" style="left:100%">${tope} activas</span>`
        $('.etapas').innerHTML = ETAPAS.filter(e => n(e.k)).map(e => {
            const del = C.filter(c => etapaDe(c.activas).k === e.k)
            return `<div class="etapa e-${e.k} revela"><h3>${e.nombre}<small>${e.k === 'diq' ? '10 activas o más' : e.k === 'fd' ? 'de 5 a 9 activas' : 'de 1 a 4 activas'}</small></h3><ol>${del.map(c => {
                const p = PER.get(c.p)
                const sig = c.activas < 5 ? [5 - c.activas, 'Futura Directora'] : c.activas < 10 ? [10 - c.activas, 'Directora en Calificación'] : null
                const subio = c.antes != null && c.activas > c.antes ? `<span class="mas-r">+${c.activas - c.antes} este mes</span>` : ''
                return `<li><span class="av">${cara(p)}</span><span class="q"><b>${esc(p.corto)}</b><small>${c.activas} ${c.activas === 1 ? 'activa' : 'activas'} de ${c.totales} en su equipo</small></span>`
                    + `<em>${subio}<span>${sig ? `Le ${sig[0] === 1 ? 'falta' : 'faltan'} <b>${sig[0]}</b> para ${sig[1]}` : '<b>¡En la recta final!</b>'}</span></em></li>`
            }).join('')}</ol></div>`
        }).join('')
    }

    /* ---------- Modo junta: presentar la página paso a paso ---------- */
    let enJunta = false
    let pasos = []
    let iPaso = 0
    const hud = $('.hud-junta')
    const nombreSeccion = el => {
        const s = el.closest('section')
        if (!s || s.matches('.entrada')) return ['Portada', '']
        if (s.matches('.carrera')) return ['Cuadro de Honor', 'La carrera del mes']
        if (s.matches('.cierre')) return ['Cierre', '']
        const k = $('.kicker', s)
        const h = $('h2', s)
        return [(h && h.textContent) || '', (k && k.textContent) || '']
    }
    function calcularPasos() {
        // cada sección se parte en bloques; bloques seguidos que caben en una pantalla van juntos
        const bloques = []
        $$('main > section:not([hidden])').forEach(s => {
            if (s.matches('.carrera')) { bloques.push($('.cab-honor', s), $('.escenario', s)); return }
            if (s.matches('.entrada, .cierre')) { bloques.push(s); return }
            ;[...s.children].filter(c => !c.hidden && c.offsetHeight > 0).forEach(c => bloques.push(c))
        })
        const top = el => el.getBoundingClientRect().top + scrollY
        const alto = innerHeight * .9
        const res = []
        let inicio = null
        bloques.forEach(b => {
            const t = top(b)
            const fin = t + b.offsetHeight
            if (inicio === null || fin - top(inicio) > alto || b.matches('.escenario, .entrada, .cab, .cab-honor')) { res.push(b); inicio = b }
        })
        return res
    }
    function irPaso(i) {
        iPaso = Math.max(0, Math.min(pasos.length - 1, i))
        const el = pasos[iPaso]
        const t = el.getBoundingClientRect().top + scrollY - (el.matches('.escenario, .entrada') ? 0 : 24)
        window.scrollTo({ top: Math.max(0, t), behavior: 'smooth' })
        const [h, k] = nombreSeccion(el)
        $('.j-txt b').textContent = h
        $('.j-txt small').textContent = `${iPaso + 1} de ${pasos.length}${k ? ` · ${k}` : ''}`
    }
    function junta(on) {
        enJunta = on
        pagina.classList.toggle('junta', on)
        hud.hidden = !on
        if (on) {
            try { document.documentElement.requestFullscreen?.().catch(() => {}) } catch { /* sin pantalla completa: sigue igual */ }
            later(() => { pasos = calcularPasos(); const y = scrollY + 10; const i = pasos.findIndex(p => p.getBoundingClientRect().top + scrollY >= y - innerHeight * .4); irPaso(i < 0 ? 0 : i) }, 350)
        } else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
    $('[data-junta]').addEventListener('click', () => junta(!enJunta))
    $('[data-j-sig]').addEventListener('click', () => irPaso(iPaso + 1))
    $('[data-j-ant]').addEventListener('click', () => irPaso(iPaso - 1))
    $('[data-j-salir]').addEventListener('click', () => junta(false))
    on(document, 'fullscreenchange', () => { if (!document.fullscreenElement && enJunta) junta(false) })
    on(document, 'keydown', e => {
        if (!enJunta || /^(INPUT|SELECT|TEXTAREA)$/.test((root.activeElement || document.activeElement)?.tagName || '')) return
        if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); irPaso(iPaso + 1) }
        else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); irPaso(iPaso - 1) }
        else if (e.key === 'Home') { e.preventDefault(); irPaso(0) }
        else if (e.key === 'End') { e.preventDefault(); irPaso(pasos.length - 1) }
        else if (e.key === 'Escape') junta(false)
    }, true)
    on(window, 'resize', () => { if (enJunta) pasos = calcularPasos() })

    /* ---------- 9 y 10. cumpleaños y aniversarios del mes en curso ---------- */
    const MC = D.mesEnCurso || MES
    const MCI = MESES.indexOf(MC)
    const AC = D.anioEnCurso || D.anio
    $$('.mes-curso').forEach(n => { n.textContent = MC })
    // un dato de su mes para cada quien: lo que la página ya contó de ella
    function dato(p) {
        const rk = FIN[ULT].indexOf(p) + 1
        if (rk && rk <= 3) return `En ${MES} quedó en ${lugar(rk)} lugar del Cuadro de Honor.`
        if ((D.nuevas || []).some(n => n.p === p && n.inicio.slice(0, 7) === delMesIso)) return `Es Nuevo Inicio de ${MES}.`
        const cr = (D.circuloMeses || {})[p]
        if (cr >= 12) return `Lleva ${cr} meses seguidos en Círculo Rosa.`
        const n = nivelEn(p, ULT)
        if (n === 50) return `Cerró ${MES} con 50 % de descuento.`
        if (ACUM[ULT].has(p)) return `En ${MES} ordenó ${miles(ACUM[ULT].get(p))} puntos.`
        return ''
    }
    function armarCumple() {
        const lista = D.cumple || []
        if (!lista.length) { $('#cumpleanos').remove(); return }
        const hoy = new Date()
        const ini = new Date(AC, MCI, 1)
        const fin = new Date(AC, MCI + 1, 0)
        const diasMes = fin.getDate()
        const dHoy = hoy < ini ? 0 : hoy > new Date(AC, MCI, diasMes, 23, 59) ? diasMes + 1 : hoy.getDate()
        const estado = d => (d < dHoy ? 'pasado' : d === dHoy ? 'hoy' : 'proximo')
        const hoyQ = lista.filter(c => c.dia === dHoy)
        const prox = lista.find(c => c.dia > dHoy)
        $('#cumpleanos .sub').innerHTML = `<b>${plural(lista.length, 'consultora cumple', 'consultoras cumplen')}</b> años en ${MC}.`
            + (hoyQ.length ? ` ¡Hoy celebra ${hoyQ.map(c => `<b>${esc(PER.get(c.p).corto)}</b>`).join(' y ')}!` : prox ? ` La que sigue: <b>${esc(PER.get(prox.p).corto)}</b>, el ${prox.dia}.` : ` Ya celebraron todas este mes.`)
        $('.cinta').innerHTML = `<div class="riel">${Array.from({ length: diasMes }, (_, i) => `<span class="d${i + 1 === dHoy ? ' hoy' : ''}${i + 1 < dHoy ? ' ya' : ''}">${(i + 1) % 5 === 0 || i === 0 ? i + 1 : ''}</span>`).join('')}</div>`
            + lista.map((c, i) => `<span class="marca-c ${estado(c.dia)}" style="left:${((c.dia - .5) / diasMes * 100).toFixed(2)}%;--k:${i}" title="${esc(PER.get(c.p).nombre)}">${cara(PER.get(c.p))}</span>`).join('')
            + (dHoy >= 1 && dHoy <= diasMes ? `<span class="hoy-l" style="left:${((dHoy - .5) / diasMes * 100).toFixed(2)}%"><b>Hoy</b></span>` : '')
        $('.pasteles').innerHTML = lista.map((c, i) => {
            const p = PER.get(c.p)
            const e = estado(c.dia)
            const falta = c.dia - dHoy
            const pill = e === 'hoy' ? '¡Hoy es su cumpleaños!' : e === 'pasado' ? `Celebró el ${c.dia}` : falta === 1 ? 'Es mañana' : dHoy ? `Faltan ${falta} días` : `El ${c.dia} de ${MC}`
            const dt = dato(c.p)
            return `<article class="pastel ${e} revela" style="--fd:${(i * .5).toFixed(1)}s"><span class="dia-g"><b>${c.dia}</b><small>${new Date(AC, MCI, c.dia).toLocaleDateString('es-MX', { weekday: 'long' })}</small></span>`
                + `<div class="ovalo-n">${cara(p)}</div><h3>${esc(p.nombre)}</h3><span class="pill">${pill}</span>${dt ? `<p class="dato">${dt}</p>` : ''}</article>`
        }).join('')
    }
    function armarAniversarios() {
        const lista = D.aniversarios || []
        if (!lista.length) { $('#aniversarios').remove(); return }
        const suma = lista.reduce((s, a) => s + a.anios, 0)
        const primeras = lista.filter(a => a.anios === 1)
        $('#aniversarios .sub').innerHTML = `<b>${plural(lista.length, 'consultora cumple', 'consultoras cumplen')}</b> años en Mary Kay en ${MC}: juntas suman <b>${suma} años</b> de experiencia.`
            + (primeras.length ? ` ${primeras.length === 1 ? 'Una celebra' : `${primeras.length} celebran`} su primer año.` : '')
        // la línea del tiempo: cuándo empezó cada una
        const y0 = Math.min(...lista.map(a => +(a.inicio || `${AC}`).slice(0, 4)))
        const y1 = AC
        const X = y => ((y - y0) / Math.max(1, y1 - y0) * 100).toFixed(2)
        const porAnio = new Map()
        lista.forEach(a => { const y = +(a.inicio || `${AC - a.anios}`).slice(0, 4); porAnio.set(y, [...(porAnio.get(y) || []), a]) })
        const marcas = []
        for (let y = Math.ceil(y0 / 5) * 5; y <= y1 - 3; y += 5) marcas.push(`<span class="tick" style="left:${X(y)}%">${y}</span>`)
        $('.linea-anios').innerHTML = `<div class="eje"></div>${marcas.join('')}<span class="tick fin" style="left:100%">${y1}</span>`
            + [...porAnio].map(([y, as]) => `<span class="pila" style="left:${X(y)}%">${as.slice(0, 3).map(a => `<span class="mi-a" title="${esc(PER.get(a.p).nombre)} · ${a.anios} ${a.anios === 1 ? 'año' : 'años'}">${cara(PER.get(a.p))}</span>`).join('')}${as.length > 3 ? `<span class="mas-a">+${as.length - 3}</span>` : ''}</span>`).join('')
        const grandes = lista.filter(a => a.anios > 1)
        $('.anios').innerHTML = grandes.map((a, i) => {
            const p = PER.get(a.p)
            const dt = dato(a.p)
            return `<article class="anio revela" style="--fd:${(i * .5).toFixed(1)}s"><div class="ovalo-n">${cara(p)}</div><span class="num-a"><b>${a.anios}</b><small>años</small></span>`
                + `<h3>${esc(p.nombre)}</h3><small class="desde-a">Desde el ${fechaLarga(a.inicio)} de ${a.inicio.slice(0, 4)}</small>${dt ? `<p class="dato">${dt}</p>` : ''}</article>`
        }).join('')
            + (primeras.length ? `<article class="anio primer revela"><span class="num-a"><b>1</b><small>año</small></span><h3>Su primer año en Mary Kay</h3>`
                + `<ul>${primeras.map(a => { const p = PER.get(a.p); const dt = dato(a.p); return `<li><span class="av">${cara(p)}</span><span><b>${esc(p.corto)}</b><small>${fechaLarga(a.inicio)}${dt ? ` · ${dt}` : ''}</small></span></li>` }).join('')}</ul></article>` : '')
    }

    /* ---------- 8. productos ---------- */
    function armarProductos() {
        const prods = D.productos || []
        $('.productos .sub').innerHTML = `En las ${COMPRAS} órdenes del mes se pidieron <b>${miles(D.piezasMes || 0)} piezas</b>. Éstas fueron las que más consultoras eligieron.`
        $('.vitrina').innerHTML = prods.map((x, i) => {
            const f = x.personas / ORDENARON
            const mitad = f > .55 ? 'La pidieron más de la mitad de las consultoras que ordenaron.' : f >= .45 ? 'La pidió la mitad de las consultoras que ordenaron.' : ''
            return `<article class="prod p${i + 1} revela" style="--fd:${(i * .7).toFixed(1)}s"><span class="rk">${i + 1}</span>`
                + `<div class="foto-p">${x.img ? `<img src="${esc(x.img)}" alt="" decoding="async" loading="lazy">` : ''}</div>`
                + `<div><h3>${esc(x.nombre)}</h3><p class="cuantas"><b>${x.personas}</b>consultoras la pidieron</p><small>${x.piezas} piezas en ${plural(x.ordenes, 'orden', 'órdenes')}</small>`
                + (i === 0 && mitad ? `<p class="frase">${mitad}</p>` : '') + '</div></article>'
        }).join('')
        const oy = D.ordenaYa
        if (!oy || !oy.personas.length) { $('.ordena').remove(); return }
        $('.ordena').innerHTML = `<div><span class="kicker">Ordena Ya</span><h3><b>${plural(oy.personas.length, 'consultora', 'consultoras')}</b> ${oy.personas.length === 1 ? 'aprovechó' : 'aprovecharon'} Ordena Ya</h3>`
            + `<p>${oy.piezas} piezas con descuento en ${MES}.</p><div class="caritas">${oy.personas.map(id => `<span title="${esc(PER.get(id).nombre)}">${cara(PER.get(id))}</span>`).join('')}</div></div>`
            + `<div class="oy-prods">${oy.productos.map(x => `<figure><div class="blanco">${x.img ? `<img src="${esc(x.img)}" alt="" loading="lazy">` : ''}</div><figcaption><b>${x.piezas} piezas</b>${esc(x.nombre)}</figcaption></figure>`).join('')}</div>`
    }

    /* ---------- aparición, autoplay de la escalera y sección activa ---------- */
    function observar() {
        const io = observador(es => es.forEach(e => {
            if (!e.isIntersecting) return
            e.target.classList.add('ver')
            io.unobserve(e.target)
            if (e.target.classList.contains('escala')) later(() => jugarC(true), 700)
            if (e.target.classList.contains('cr-cifras')) $$('[data-cuenta]', e.target).forEach(contar)
        }), { threshold: .18 })
        $$('.revela').forEach(el => io.observe(el))
        observarRevela = el => io.observe(el)
        const links = $$('.secciones a')
        const io2 = observador(es => es.forEach(e => {
            if (!e.isIntersecting) return
            links.forEach(a => a.classList.toggle('activa', a.getAttribute('href') === `#${e.target.id}`))
        }), { rootMargin: '-45% 0px -50% 0px' })
        links.forEach(a => { const s = $(a.getAttribute('href')); if (s) io2.observe(s) })
    }

    /* ---------- arranque ---------- */
    // Sin órdenes (no nos dio su acceso a Mary Kay): no hay carrera, ni día por día, ni productos; el podio y las
    // demás secciones salen de los reportes.
    if (!COMPRAS) {
        FIN[ULT] = (D.cuadro || []).map(c => c.p).filter(id => PER.has(id))
        $('.escenario').hidden = true
        $('#carrera').classList.add('sin-ordenes')
        const ver = $('[data-ver]')
        ver.lastChild.textContent = ' Ver el podio'
        ver.addEventListener('click', e => { e.stopImmediatePropagation(); $('#podio').scrollIntoView({ behavior: 'smooth' }) }, true)
        $('[data-otra]').remove()
    }
    podio()
    armarEstrellas()
    if (D.descuento && Object.keys(D.descuento.niveles || {}).length) { armarClubes(); pintarClubes(1, false) } else $('#descuento').remove()
    armarCirculo()
    if (compras.length) armarCalendario(); else $('#dia-por-dia').remove()
    armarTempraneras()
    armarAjustes()
    armarLlegadas()
    armarCamino()
    if ((D.productos || []).length) armarProductos(); else $('#productos').remove()
    armarCumple()
    armarAniversarios()
    // la barra sólo liga a lo que quedó; y las ligas se resuelven aquí (un «#id» no cruza el Shadow DOM)
    $$('.secciones a').forEach(a => { if (!$(a.getAttribute('href'))) a.remove() })
    on(root, 'click', e => {
        const a = e.target.closest('.secciones a')
        if (!a) return
        e.preventDefault()
        const s = $(a.getAttribute('href'))
        if (s) s.scrollIntoView({ behavior: 'smooth' })
    })
    $('[data-volver]').addEventListener('click', () => op.volver && op.volver())
    observar()
    medir()
    ajustarLienzo()
    pintarLider(null, false)
    liderPrevio = null
    marcarPlay()
    pedir()
    requestAnimationFrame(burbujas)
    let rt = 0
    on(window, 'resize', () => { clearTimeout(rt); rt = later(() => { medir(); ajustarLienzo(); burbujas(); pedir() }, 120) })
    host.__boletin = { get ms() { return ms }, TOTAL, ir, jugar, beats, SEG, FIN, PER }

    return {
        destruir() {
            vivo = false
            limpieza.forEach(f => f())
            observadores.forEach(io => io.disconnect())
            temporizadores.forEach(id => clearTimeout(id))
            if (raf) cancelAnimationFrame(raf)
            if (rafC) cancelAnimationFrame(rafC)
            clearTimeout(relojC)
            if (document.fullscreenElement && enJunta) document.exitFullscreen?.().catch(() => {})
            document.title = tituloAntes
            delete host.__boletin
            root.innerHTML = ''
        },
    }
}
