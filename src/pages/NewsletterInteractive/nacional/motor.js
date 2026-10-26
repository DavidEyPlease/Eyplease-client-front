/* El motor del boletín NACIONAL interactivo (piel de la Plantilla 9). Es el de la muestra local que aprobó David
   (Boletin-Interactivo/nacional-p9, 26-oct-2026), copiado con _a_la_web.py: no se edita aquí, se edita allá.
   Va en JavaScript a propósito (motor.d.ts es su contrato con el resto de la web).
   Lee los datos tal como los manda la API (GET reports/boletin-nacional) y arma todo dentro de un Shadow DOM: la portada con la Directora Nacional,
   la carrera de las unidades en el año de seminario, el top nacional e iniciadoras, los bonos, los cortes, las
   Estrellas, el Camino al Éxito con el Trofeo sobre ruedas y las celebraciones. Los nombres de cada cosa son los del
   arte de la Plantilla 9 (manifest del boletín nacional). */

import css from './estilo.css?inline'

const FUENTES = 'https://fonts.googleapis.com/css2?family=Allura&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&family=Inter:wght@400;500;600;700&display=swap'
const NOMBRE_MES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const BONOS = [
    ['b24', 28600, '85,000 pts o más', 85000], ['b12', 14300, '75,000 a 84,999 pts', 75000], ['b7', 8300, '55,000 a 74,999 pts', 55000], ['b5', 5900, '35,000 a 54,999 pts', 35000],
    ['b4', 4700, '25,000 a 34,999 pts', 25000], ['b3', 3550, '15,000 a 24,999 pts', 15000], ['b2', 2350, '12,500 a 14,999 pts', 12500],
]
// Estrellas del trimestre: producción personal de los 3 meses (Zafiro 3,600 · Rubí 4,800 · Diamante 6,000 · Esmeralda 7,200 · Perla 10,000)
const GEMAS = [['pearl', 'Perla', 'g-perla', 10000], ['emerald', 'Esmeralda', 'g-esmeralda', 7200], ['diamond', 'Diamante', 'g-diamante', 6000], ['ruby', 'Rubí', 'g-rubi', 4800], ['sapphire', 'Zafiro', 'g-zafiro', 3600]]
const NIVELES = [
    ['senior_dir', 'Directora Senior', '1 a 2 directoras en 1ra línea'],
    ['senior_dir_elite', 'Directora Senior Elite', '3 a 4 directoras en 1ra línea'], ['executive_dir', 'Directora Ejecutiva', '5 a 7 directoras en 1ra línea'],
    ['executive_dir_elite', 'Directora Ejecutiva Elite', '8 o más directoras en 1ra línea'],
]
const TRAMOS = {
    personal: [['5mas', '5 o más inicios'], ['3a4', '3 a 4 inicios'], ['1a2', '1 a 2 inicios']],
    unidad: [['10mas', '10 o más inicios'], ['5a9', '5 a 9 inicios'], ['3a4', '3 a 4 inicios'], ['1a2', '1 a 2 inicios']],
}

const PREMIOS = { automovil: 'auto rosa', bono: 'bono del auto rosa', efectivo: 'efectivo' }
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const num = v => Number(v || 0).toLocaleString('es-MX')
const pts = v => `${num(v)} pts`
const pesos = v => `$${num(v)}`
const cap = s => (s ? s[0].toUpperCase() + s.slice(1) : '')

export function crearBoletinNacional(host, D, op = {}) {
    if (!document.getElementById('boletin-nacional-fuentes')) {
        const l = document.createElement('link')
        l.id = 'boletin-nacional-fuentes'
        l.rel = 'stylesheet'
        l.href = FUENTES
        document.head.appendChild(l)
    }
    const base = op.base || '/boletin/p9'
    const tituloAntes = document.title
    document.title = `Boletín nacional de ${D.mes} · ${D.area?.nombre || ''}`
    const root = host.shadowRoot || host.attachShadow({ mode: 'open' })
    const PER = new Map((D.personas || []).map(p => [p.id, p]))
    const quien = id => PER.get(id) || { nombre: '', foto: null }
    const corto = id => { const n = quien(id).nombre.split(' ').filter(Boolean); return n.length >= 3 ? n.slice(0, -1).join(' ') : n.join(' ') }
    const iniciales = id => quien(id).nombre.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const cara = (id, cls = '') => { const p = quien(id); return `<span class="cara ${cls}">${p.foto ? `<img src="${esc(p.foto)}" alt="" loading="lazy" data-ini="${esc(iniciales(id))}">` : esc(iniciales(id))}</span>` }
    const chip = (id, extra = '', n = 0) => `<span class="chip" style="--n:${n}">${cara(id)}<span>${esc(corto(id))}${extra ? `<i class="sep"> · </i><b>${extra}</b>` : ''}</span></span>`
    const mes = D.mes
    const Mes = mes[0].toUpperCase() + mes.slice(1)
    const mNumero = NOMBRE_MES.indexOf(mes) + 1
    const triTexto = m => { const ini = Math.floor((m - 1) / 3) * 3; return `${NOMBRE_MES[ini]} a ${NOMBRE_MES[ini + 2]}` }
    const inicialesDir = (D.directora?.nombre || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const anioSem = D.seminario?.inicio ?? (mNumero >= 7 ? D.anio : D.anio - 1)
    // las Estrellas se ganan al cerrar el trimestre (marzo, junio, septiembre, diciembre); en otro mes «van por» ella
    const cierreTri = mNumero % 3 === 0

    // ---- datos que se cuentan en más de un lugar ----
    const desde = D.seminario?.desde ?? 6
    const mesesC = D.meses.slice(desde)
    const unidades = (D.unidades || []).filter(u => u.total).map(u => {
        const cum = [0]
        mesesC.forEach((_, k) => cum.push(cum[k] + (u.prod[desde + k] || 0)))
        cum[cum.length - 1] = u.total // manda el acumulado oficial (el del Unit Club)
        return { ...u, cum }
    })
    const conBono = (D.bonos || []).length
    const montoBonos = (D.bonos || []).reduce((s, b) => s + (BONOS.find(x => x[0] === b.bono)?.[1] || 0), 0)
    const nEstrellas = (D.estrellas || []).length

    // ---- la página ----
    root.innerHTML = `<style>${css}</style>
<div class="pagina">
    <div class="fondo" aria-hidden="true" style="--fondo-h:url(${base}/kit-fondo-h.webp);--fondo-v:url(${base}/kit-fondo-v.webp)"></div>
    <header class="barra">
        <button type="button" class="volver" data-volver aria-label="Cerrar el boletín"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
        <span class="marca">eyplease<b>+</b></span>
        <span class="quien"><small><span class="bn">Boletín </span>nacional de ${esc(mes)}</small><b>${esc(D.area.nombre)}</b></span>
        <nav class="secciones" aria-label="Secciones">
            <a href="#top">Cuadro de Honor</a><a href="#trofeo" data-tsr-link>Trofeo</a><a href="#carrera">Carrera</a><a href="#bonos">Bonos</a><a href="#cortes">Cortes</a><a href="#estrellas">Estrellas</a><a href="#camino">Camino al Éxito</a><a href="#celebraciones">Celebraciones</a>
        </nav>
        <button type="button" class="barra-b junta-b" data-junta aria-label="Modo junta" title="Modo junta: presentar en pantalla completa">
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg><span>Modo junta</span>
        </button>
        ${op.editar ? `<button type="button" class="barra-b" data-ajustes title="Ajustes: tu mensaje para el área" aria-expanded="false" aria-controls="ajustes">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg><span>Ajustes</span>
        </button>
        <div class="ajustes" id="ajustes" hidden>
            <p class="kicker">Ajustes de la Directora</p>
            <small>Sólo tú ves estos ajustes.</small>
            ${(op.meses || []).length ? `<label class="mes-t">Mes del boletín <select data-mes-sel>${op.meses.map(m => `<option value="${esc(m.valor)}"${m.valor === op.mes ? ' selected' : ''}>${esc(m.etiqueta)}</option>`).join('')}</select></label>` : ''}
            <label class="msg-t">Tu mensaje para el área <small>(opcional; sale al abrir el boletín, con tu foto y tu firma)</small><textarea data-msg rows="6" maxlength="400" placeholder="Escribe unas palabras para tu junta…"></textarea></label>
            <p class="guardado" aria-live="polite"></p>
        </div>` : ''}
    </header>
    <main>
        <section class="entrada" aria-labelledby="titulo">
            <div class="letras">
                <h1 id="titulo" class="sr">Reconocimiento nacional de ${esc(mes)}</h1>
                <p class="mes-g" aria-hidden="true">${esc(Mes)}</p>
                <img class="l1" src="${base}/kit-titulo.webp" alt="" width="1400" height="537">
                <p class="lead">El cierre de ${esc(mes)} del <b>${esc(D.area.nombre)}</b>: <b>${unidades.length} unidades</b> en la carrera, <b>${conBono} directoras con bono</b> y <b>${nEstrellas} Estrellas nacionales</b>.</p>
                <button type="button" class="ir" data-ir><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>Empezar</button>
            </div>
            <figure class="dire">
                <div class="marco-d" style="--silueta:url(${base}/kit-silueta.webp)">
                    <div class="foto-d">${D.directora.foto ? `<img src="${esc(D.directora.foto)}" alt="">` : `<span class="cara">${esc(inicialesDir)}</span>`}</div>
                    <img src="${base}/kit-marco.webp" alt="" width="800" height="1000">
                    <img class="flota f1" src="${base}/kit-f03.webp" alt="" aria-hidden="true">
                    <img class="flota f2" src="${base}/kit-f05.webp" alt="" aria-hidden="true">
                </div>
                <figcaption><small class="dire-tit">Tu Directora Nacional</small><b class="dire-nombre">${esc(D.directora.nombre)}</b><span class="dire-nivel">${esc(D.area.nombre)} · ${D.area.directoras} directoras</span></figcaption>
            </figure>
        </section>

        <section class="seccion mensaje-n" id="mensaje" aria-labelledby="msj-t" hidden>
            <article class="carta-n panel revela">
                <div class="carta-foto"><i class="brillo" aria-hidden="true"></i>${D.directora.foto ? `<span class="cara"><img src="${esc(D.directora.foto)}" alt=""></span>` : ''}</div>
                <div class="carta-txt">
                    <p class="kicker">Un mensaje de tu Directora Nacional</p>
                    <h2 id="msj-t" class="sr">Mensaje de ${esc(D.directora.nombre)}</h2>
                    <div class="msj-texto" data-msj></div>
                    <p class="firma"><span class="firma-m" aria-hidden="true">${esc(D.directora.nombre.split(' ')[0] || '')}</span><b>${esc(D.directora.nombre)}</b><small>${esc(D.directora.nivel)} · ${esc(D.area.nombre)}</small></p>
                </div>
            </article>
        </section>

        <section class="seccion honor-n" id="top" aria-labelledby="top-t">
            <header class="cab revela"><p class="kicker">Top nacional de ${esc(mes)}</p><h2 id="top-t" class="sr">Cuadro de Honor nacional</h2>
                <img class="tit-honor" src="${base}/kit-honor.webp" alt="" width="1400" height="494">
                <p class="sub">El top 10 de cada categoría. Toca a una reina para ver su ceremonia.</p></header>
            <div class="reinas-n revela" role="tablist" aria-label="Categorías del Cuadro de Honor"></div>
            <div class="ceremonia panel revela" role="tabpanel">
                <div class="cer-cab">
                    <div><p class="kicker">Top 10 nacional · <span data-cat-n></span></p><h3 data-cat-t></h3></div>
                    <div class="cer-mandos">
                        <button type="button" class="chico redondo" data-cat-ant aria-label="Categoría anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
                        <button type="button" class="chico" data-cat-otra>Repetir</button>
                        <label class="auto"><input type="checkbox" data-auto> Pasar solas</label>
                        <button type="button" class="chico redondo" data-cat-sig aria-label="Siguiente categoría"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
                    </div>
                </div>
                <div class="cer-meses" data-meses></div>
                <div class="cer-escena" data-escena aria-live="polite"></div>
                <div class="cer-pie"><button type="button" class="ir cer-boton" data-avanzar></button><small class="cer-tip">También con la flecha → o con el control de tu presentación</small></div>
                <div class="cer-extra" data-extra></div>
            </div>
        </section>

        <section class="seccion" id="trofeo" aria-labelledby="tsr-t" hidden>
            <header class="cab revela"><p class="kicker">Trofeo sobre ruedas · el auto rosa</p><h2 id="tsr-t" data-tsr-t></h2><p class="sub" data-tsr-s></p></header>
            <div class="tsr panel revela">
                <div class="tsr-pista" aria-hidden="true"><i class="carretera"></i>
                    <svg class="auto-svg" viewBox="0 0 240 92"><defs>
                        <linearGradient id="tsr-carro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9f0"/><stop offset=".45" stop-color="#f3abc3"/><stop offset="1" stop-color="#9e4a63"/></linearGradient>
                        <linearGradient id="tsr-vidrio" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2a1020"/><stop offset="1" stop-color="#5a2a40"/></linearGradient></defs>
                        <path class="estela" d="M2 48h26M8 58h18M0 68h22"/>
                        <path fill="url(#tsr-carro)" stroke="#ffd2dc" stroke-width="1.2" d="M34 70c-6 0-10-4-10-9 0-8 6-13 18-15l22-4 22-17c8-6 18-9 30-9h34c14 0 25 5 35 14l12 12c16 2 28 6 32 14 2 4 2 9 0 12-2 1-4 2-7 2H34z"/>
                        <path fill="url(#tsr-vidrio)" d="M92 41l18-14c6-4 12-6 20-6h12v20zM148 21h10c11 0 20 4 28 12l8 8h-46z"/>
                        <path stroke="#ffd2dc" stroke-width="1.4" fill="none" d="M146 22v40M90 48h120"/>
                        <g class="rueda" style="transform-origin:66px 70px"><circle cx="66" cy="70" r="15" fill="#1d0c16" stroke="#f3c0cc" stroke-width="2"/><circle cx="66" cy="70" r="6" fill="#f6c76b"/><path stroke="#f6c76b" stroke-width="2" d="M66 57v26M53 70h26"/></g>
                        <g class="rueda" style="transform-origin:190px 70px"><circle cx="190" cy="70" r="15" fill="#1d0c16" stroke="#f3c0cc" stroke-width="2"/><circle cx="190" cy="70" r="6" fill="#f6c76b"/><path stroke="#f6c76b" stroke-width="2" d="M190 57v26M177 70h26"/></g>
                        <path fill="#fff4ec" d="M226 54c4 0 7 2 7 4h-9z" opacity=".9"/></svg>
                </div>
                <div class="tsr-gente"></div>
            </div>
            <div class="tsr-ruta panel revela" hidden></div>
            <div class="tsr-calif panel revela" hidden></div>
        </section>

        <section class="seccion" id="carrera" aria-labelledby="car-t">
            <header class="cab revela"><p class="kicker">${esc(D.seminario?.etiqueta || 'Año de seminario')}</p><h2 id="car-t">La carrera de las unidades</h2>
                <p class="sub">${mesesC.map(m => NOMBRE_MES[Number(m.slice(5)) - 1]).join(', ').replace(/, ([^,]*)$/, ' y $1')}: así sumó puntos cada unidad y quién rebasó a quién. Al final, el acumulado que cuenta para el <b>Unit Club</b>.</p></header>
            <div class="escenario revela">
                <aside class="lado panel">
                    <div class="mes-c"><small>Vamos en</small><b data-mes-c>${esc(cap(NOMBRE_MES[Number(mesesC[0].slice(5)) - 1]))}</b></div>
                    <div class="linea-m">${mesesC.map(m => `<span>${esc(cap(NOMBRE_MES[Number(m.slice(5)) - 1]))}<i></i></span>`).join('')}</div>
                    <div class="total-a"><small>Puntos de todo el área</small><b class="cifra" data-total>0</b></div>
                    <div class="lider" data-lider hidden></div>
                    <div class="avisos" aria-live="polite"></div>
                    <div class="mandos"><button type="button" class="play" data-play aria-label="Reproducir"></button><button type="button" class="chico" data-otra>Ver otra vez</button></div>
                </aside>
                <div class="pista panel"><div class="filas" role="list"></div><p class="nota-c">Puntos de producción de unidad acumulados en el año de seminario.</p></div>
            </div>
        </section>

        <section class="seccion" id="bonos" aria-labelledby="bon-t">
            <header class="cab revela"><p class="kicker">Bonos del mes</p><h2 id="bon-t">${conBono === 1 ? '1 directora ganó bono' : `${conBono} directoras ganaron bono`}</h2>
                <p class="sub">Por la producción de su unidad en ${esc(mes)}. En total, <b>${pesos(montoBonos)}</b> en bonos para tu área.</p></header>
            <div class="escalera revela"></div>
            <div class="libres revela"></div>
        </section>

        <section class="seccion cortes-n" id="cortes" aria-labelledby="cor-t">
            <header class="cab revela"><p class="kicker">Cortes nacionales · Año Seminario ${anioSem}-${anioSem + 1}</p><h2 id="cor-t">Rumbo a las Cortes</h2>
                <p class="sub" data-cortes-s></p></header>
            <div class="cortes-lista"></div>
        </section>

        <section class="seccion" id="estrellas" aria-labelledby="est-t">
            <header class="cab revela"><p class="kicker">Estrellas nacionales · ${triTexto(mNumero)}</p><h2 id="est-t">${cierreTri ? `${nEstrellas} ${nEstrellas === 1 ? 'Estrella' : 'Estrellas'} en tu área` : `${nEstrellas} van por su Estrella`}</h2><p class="sub">${cierreTri ? 'Las que cerraron el trimestre con su estrella.' : `Lo que lleva cada una del trimestre al cierre de ${esc(mes)}.`}</p></header>
            <div class="gemas revela"></div>
            <div class="metas-e revela"></div>
        </section>

        <section class="seccion" id="camino" aria-labelledby="cam-t">
            <header class="cab revela"><p class="kicker">Camino al Éxito nacional</p><h2 id="cam-t">Hacia la cumbre</h2><p class="sub">Cada directora en su escalón, según sus directoras en primera línea.</p></header>
            <div class="camino revela"></div>
        </section>

        <section class="seccion" id="celebraciones" aria-labelledby="cel-t">
            <header class="cab revela"><p class="kicker">Celebraciones nacionales de ${esc(D.mesEnCurso)}</p><h2 id="cel-t">¡A celebrar!</h2><p class="sub" data-fiestas-s></p></header>
            <div class="fiestas revela"></div>
        </section>

        <section class="cierre revela">
            ${D.directora.foto ? `<span class="cara"><img src="${esc(D.directora.foto)}" alt=""></span>` : ''}
            <h2>Gracias, ${esc(D.area.nombre)}</h2>
            <p>Así se ganó ${esc(mes)}, unidad por unidad. <b>${esc(D.mesEnCurso[0].toUpperCase() + D.mesEnCurso.slice(1))} ya empezó.</b></p>
            <p><b>${esc(D.directora.nombre)}</b><br><small>${esc(D.directora.nivel)}</small></p>
            <button type="button" class="chico" data-arriba>Volver al inicio</button>
        </section>
    </main>
    <div class="reina-pop" hidden role="dialog" aria-modal="true" aria-labelledby="rp-t">
        <div class="rp-fondo" data-rp-cerrar></div>
        <div class="rp-rayos" aria-hidden="true"></div>
        <div class="rp-caja">
            <div class="rp-fotos"></div>
            <div class="rp-texto">
                <p class="kicker" data-rp-k></p>
                <h3 id="rp-t" data-rp-n></h3>
                <p class="rp-valor cifra" data-rp-v></p>
                <p class="rp-insignia" data-rp-i></p>
                <div class="rp-datos" data-rp-d></div>
                <button type="button" class="ir" data-rp-cerrar>Continuar</button>
            </div>
        </div>
    </div>
    <nav class="hud-junta" aria-label="Modo junta" hidden>
        <button type="button" data-j-ant aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <span class="j-txt"><b></b><small></small></span>
        <button type="button" data-j-sig aria-label="Siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
        <button type="button" class="j-salir" data-j-salir>Salir</button>
    </nav>
</div>`

    const $ = (s, el = root) => el.querySelector(s)
    const $$ = (s, el = root) => [...el.querySelectorAll(s)]
    const limpiar = []
    let enJunta = false
    let pasos = []
    let iPaso = 0
    // la siguiente sección que sí se ve (el Trofeo o el mensaje pueden ir escondidos)
    const seccionTras = s => { let n = s?.nextElementSibling; while (n && (n.hidden || n.tagName !== 'SECTION')) n = n.nextElementSibling; return n }
    const on = (el, ev, fn, o) => { el.addEventListener(ev, fn, o); limpiar.push(() => el.removeEventListener(ev, fn, o)) }

    // una foto que no carga se vuelve sus iniciales
    on(root, 'error', e => {
        const img = e.target
        if (img.tagName !== 'IMG' || !img.dataset.ini) return
        const caja = img.parentElement
        img.remove()
        caja.textContent = img.dataset.ini
    }, true)

    // ---- Cuadro de Honor nacional: la ceremonia con suspenso ----
    // Cada categoría: las reinas de cada mes del año, del 10.º al 4.º, tres finalistas boca abajo con pistas del
    // historial, se revela la 3.ª y al final el duelo por la corona. Avanza al ritmo de la Directora (botón, flecha →
    // o el control de su presentación) o solo, con «Pasar solas».
    const ini = v => (v === 1 ? '1 inicio' : `${num(v)} inicios`)
    const CATS = [
        ['unit_production', 'Producción de unidad', pts], ['unit_size', 'Tamaño de unidad', v => `${num(v)} consultoras`],
        ['group_production', 'Producción de grupo', pts], ['personal_sales', 'Ventas personales', pts],
        ['personal_initiation', 'Iniciación personal', ini, 'personal'], ['unit_initiation', 'Iniciación de unidad', ini, 'unidad'],
    ].filter(([k]) => (D.reinas?.[k] || []).length)
    const ABR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const H = D.historial || { meses: [], categorias: {} }
    const iMes = H.meses.indexOf(`${D.anio}-${String(NOMBRE_MES.indexOf(mes) + 1).padStart(2, '0')}`)
    const mesDe = i => NOMBRE_MES[Number(H.meses[i].slice(5)) - 1]
    const serie = (k, p) => H.categorias?.[k]?.[p] || []
    const enMes = (k, i) => Object.entries(H.categorias?.[k] || {}).map(([p, sv]) => ({ p, v: sv[i] || 0 })).filter(x => x.v > 0).sort((a, b) => b.v - a.v)
    const reinasDe = (k, i) => {
        if (i === iMes) return (D.reinas[k] || []).filter(x => x.lugar === 1).map(x => x.p)
        const l = enMes(k, i)
        return l.length ? l.filter(x => x.v === l[0].v).map(x => x.p) : []
    }
    const lugarEn = (k, i, p) => { const l = enMes(k, i); const x = l.find(y => y.p === p); return x ? l.filter(y => y.v > x.v).length + 1 : null }
    const coronas = (k, p) => { let c = 0; for (let i = 0; i < iMes; i++) if (reinasDe(k, i).includes(p)) c++; return c }
    const racha = (k, p) => { let c = 0; for (let i = iMes - 1; i >= 0; i--) { const r = lugarEn(k, i, p); if (r && r <= 3) c++; else break } return c }
    const ant = iMes - 1
    // las pistas de una finalista, sin decir su número: la unidad adivina quién es
    const pistas = (k, p, v) => {
        const out = []
        if (ant >= 0 && reinasDe(k, ant).includes(p)) out.push(`Es la reina de ${mesDe(ant)}`)
        const c = coronas(k, p)
        if (c >= 2) out.push(`Ya ganó esta corona ${c} veces este año`)
        else if (c === 1 && !out.length) out.push('Ya ganó esta corona una vez este año')
        else if (c === 0 && iMes > 0) out.push(`Nunca ha ganado esta corona en ${D.anio}`)
        const previos = serie(k, p).slice(0, Math.max(0, iMes)).filter(Boolean)
        if (previos.length >= 3 && v > Math.max(...previos)) out.push(`${cap(mes)} es su mejor mes del año`)
        const va = ant >= 0 ? serie(k, p)[ant] : null
        if (va && v >= va * 1.15) out.push(`Creció ${Math.round((v / va - 1) * 100)} % contra ${mesDe(ant)}`)
        const rch = racha(k, p)
        if (rch >= 3) out.push(`Lleva ${rch} meses seguidos en el podio`)
        const r = ant >= 0 ? lugarEn(k, ant, p) : null
        if (r && r > 1) out.push(`En ${mesDe(ant)} quedó en ${r}.º lugar`)
        if (!out.length) out.push('Viene con todo este mes')
        return [...new Set(out)].slice(0, 2)
    }
    const narrativa = k => {
        const cuenta = new Map()
        let meses = 0
        for (let i = 0; i < iMes; i++) { const r = reinasDe(k, i); if (r.length) { meses++; r.forEach(p => cuenta.set(p, (cuenta.get(p) || 0) + 1)) } }
        if (!meses) return ''
        const [top, n] = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0]
        const rAnt = reinasDe(k, ant)
        let t = `<b>${esc(corto(top))}</b> ha ganado ${n === 1 ? '1 mes' : `${n} de ${meses} meses`}.`
        if (rAnt.length && !rAnt.includes(top)) t += ` Pero en ${mesDe(ant)} la corona fue para <b>${rAnt.map(p => esc(corto(p))).join(' y ')}</b>.`
        else if (rAnt.includes(top)) t += ` Y en ${mesDe(ant)} también fue suya.`
        return t
    }
    const insignia = (k, gente) => {
        const p = gente[0]
        const c = coronas(k, p) + 1
        const rAnt = reinasDe(k, ant)
        if (gente.length > 1) return '¡Empate en el primer lugar!'
        if (rAnt.length && !rAnt.includes(p) && c > 1) return `¡Recupera la corona! Es su ${c}.ª del año`
        if (rAnt.includes(p)) return c >= 3 ? `¡Repite! Su ${c}.ª corona del año` : '¡Repite corona!'
        if (c === 1) return '¡Su primera corona del año!'
        return `Su ${c}.ª corona del año`
    }
    const ordinal = n => `${n}.º`
    const grupos = lista => { const g = new Map(); lista.forEach(x => { if (!g.has(x.lugar)) g.set(x.lugar, []); g.get(x.lugar).push(x) }); return g }
    const nombres = g => g.map(x => esc(corto(x.p))).join(' y ')
    // tres o más empatadas: cuántas son y sus nombres en chico, para que no se encadene un renglón eterno
    const grupoNombres = g => (g.length > 2 ? `${g.length} directoras<small>${g.map(x => esc(corto(x.p))).join(' · ')}</small>` : nombres(g))
    const lugarTxt = l => (l === 1 ? '¡Reina!' : `${l === 2 ? '2.º' : l === 3 ? '3.er' : `${l}.º`} lugar`)

    const reveladas = new Set()
    const pintarReinas = () => {
        $('.reinas-n').innerHTML = CATS.map(([k, titulo], i) => {
            const r = (D.reinas[k] || []).filter(x => x.lugar === 1)
            const ya = reveladas.has(i)
            return `<button type="button" role="tab" class="reina-t ${ya ? '' : 'oculta'}" data-cat="${i}" aria-selected="${i === cat}" style="--n:${i}">`
                + `<span class="caras">${ya ? r.map(x => cara(x.p)).join('') : '<span class="cara incognita">?</span>'}</span>`
                + `<small>${titulo}</small><b>${ya ? nombres(r) : '¿Quién será?'}</b></button>`
        }).join('')
    }
    const pintarMeses = (k, conHoy) => {
        if (iMes < 0) { $('[data-meses]').innerHTML = ''; return }
        $('[data-meses]').innerHTML = `<p class="kicker">Las reinas de ${D.anio}</p><div class="fila-meses">` + H.meses.slice(0, iMes + 1).map((m, i) => {
            const hoy = i === iMes
            const r = reinasDe(k, i)
            const caras = hoy && !conHoy ? '<span class="cara incognita">?</span>' : r.length ? r.slice(0, 2).map(p => cara(p)).join('') : '<span class="cara vacia">—</span>'
            return `<div class="mes-h ${hoy ? 'hoy' : ''}" title="${r.map(p => esc(corto(p))).join(' y ')}"><span class="caras">${caras}</span><small>${ABR[Number(m.slice(5)) - 1]}</small></div>`
        }).join('') + '</div>'
    }

    let cat = -1
    let etapas = []
    let etapa = 0
    let cartas = []
    let autoT = 0
    let animando = false
    const PASO = 280
    const k = () => CATS[cat][0]
    const fmtDe = () => CATS[cat][2]

    const pasarela = (g, fmt) => {
        const resto = [...g.entries()].filter(([l]) => l >= 4).sort((a, b) => a[0] - b[0])
        const n = resto.length
        return `<ol class="pasarela">${resto.map(([l, gente], idx) => `<li class="${gente.length > 2 ? 'grupo' : ''}" style="--d:${((n - 1 - idx) * PASO / 1000).toFixed(2)}s"><span class="lugar">${ordinal(l)}</span>`
            + `<span class="caras">${gente.slice(0, 5).map(x => cara(x.p)).join('')}${gente.length > 5 ? `<span class="mas">+${gente.length - 5}</span>` : ''}</span>`
            + `<span class="quien-l">${grupoNombres(gente)}</span><span class="val cifra">${fmt(gente[0].valor)}</span></li>`).join('')}</ol>`
    }
    const podio = (g, fmt) => {
        const escalon = (l, d) => {
            const gente = g.get(l) || []
            if (!gente.length) return `<div class="paso-n pn${l}" style="--d:${d}s"><div class="base">${l}</div></div>`
            return `<div class="paso-n pn${l}" style="--d:${d}s">${l === 1 ? `<img class="halo" src="${base}/kit-joya.webp" alt="" aria-hidden="true"><i class="destello"></i>` : ''}`
                + `<span class="caras">${gente.map(x => cara(x.p)).join('')}${l === 1 ? '<i class="corona"></i>' : ''}</span>`
                + `<b>${grupoNombres(gente)}</b><span class="val cifra">${fmt(gente[0].valor)}</span><div class="base">${l}</div></div>`
        }
        return `<div class="podio-n">${escalon(2, .3)}${escalon(1, .6)}${escalon(3, 0)}</div>`
    }
    const carta = (x, pos) => `<div class="carta" data-p="${esc(x.p)}" data-lugar="${x.lugar}" style="--n:${pos}"><div class="carta-in">`
        + `<div class="cara-a"><span class="incognita grande">?</span><small>Finalista</small><ul class="pistas">${pistas(k(), x.p, x.valor).map(t => `<li>${t}</li>`).join('')}</ul></div>`
        + `<div class="cara-b">${cara(x.p)}<b>${esc(corto(x.p))}</b><span class="val cifra">${fmtDe()(x.valor)}</span><span class="puesto">${lugarTxt(x.lugar)}</span></div>`
        + `</div><div class="tension" hidden><i></i><span class="cifra">0</span></div></div>`

    const etiqueta = () => {
        const sig = etapas[etapa + 1]
        if (!sig) return cat < CATS.length - 1 ? `Siguiente: ${CATS[cat + 1][1]}` : (seccionTras($('#top'))?.id === 'trofeo' ? 'Ver el Trofeo sobre ruedas' : 'Ver la carrera de las unidades')
        if (sig === 'pasarela') return 'Ver del 10.º al 4.º lugar'
        if (sig === 'finalistas') return 'Conocer a las finalistas'
        if (sig === 'revela') { const c = cartas.filter(x => !x.hecha).sort((a, b) => b.lugar - a.lugar)[0]; return `Revelar el ${c.lugar === 2 ? '2.º' : '3.er'} lugar` }
        if (sig === 'duelo') return `¿Quién se lleva la corona de ${mes}?`
        return 'Ver el podio completo'
    }
    const pintarBoton = () => { const b = $('[data-avanzar]'); b.textContent = etiqueta(); b.disabled = animando; if (enJunta) ponerHud() }

    const confeti = caja => {
        const colores = ['#f3abc3', '#f6c76b', '#fff4ec', '#f3c0cc', '#e23a7c']
        const capa = document.createElement('div')
        capa.className = 'confeti'
        capa.innerHTML = Array.from({ length: 70 }, (_, i) => `<i style="left:${(i * 37) % 100}%;--c:${colores[i % 5]};--d:${((i * 53) % 900) / 1000}s;--r:${(i * 47) % 360}deg;--x:${((i * 29) % 80) - 40}px"></i>`).join('')
        caja.appendChild(capa)
        const t = setTimeout(() => capa.remove(), 4200)
        limpiar.push(() => clearTimeout(t))
    }

    // ---- la reina en grande: su foto en el marco y datos interesantes del año ----
    const datosReina = (kk, p, valor, segunda) => {
        const fmt = fmtDe()
        const titulo = CATS[cat][1]
        const out = []
        const c = coronas(kk, p) + 1
        out.push({ big: String(c), txt: c === 1 ? `Su primera corona de ${titulo.toLowerCase()} en ${D.anio}` : `Coronas de ${titulo.toLowerCase()} en ${D.anio}` })
        if (segunda && valor > segunda.valor) out.push({ big: fmt(valor - segunda.valor), txt: `De ventaja sobre ${esc(corto(segunda.p))}` })
        const sv = serie(kk, p).slice(0, Math.max(0, iMes))
        const previos = sv.map((v, i) => ({ v: v || 0, i })).filter(x => x.v)
        const mejor = previos.sort((a, b) => b.v - a.v)[0]
        if (!mejor || valor >= mejor.v) out.push({ big: cap(mes), txt: 'Su mejor mes del año' })
        else out.push({ big: fmt(mejor.v), txt: `Su mejor mes del año fue ${mesDe(mejor.i)}` })
        const va = ant >= 0 ? sv[ant] : null
        if (va) { const pct = Math.round((valor / va - 1) * 100); if (pct) out.push({ big: `${pct > 0 ? '+' : ''}${pct} %`, txt: `Contra ${mesDe(ant)}` }) }
        const r = racha(kk, p) + 1
        if (r >= 3) out.push({ big: `${r} meses`, txt: 'Seguidos en el podio' })
        // lo que logró en el resto del boletín
        const orden = [...unidades].sort((a, b) => b.total - a.total)
        const enCarrera = orden.findIndex(u => u.p === p)
        if (enCarrera >= 0) out.push({ big: `${enCarrera + 1}.º lugar`, txt: `En la carrera de las unidades · ${pts(orden[enCarrera].total)}` })
        const bono = (D.bonos || []).find(b => b.p === p)
        if (bono) out.push({ big: pesos(BONOS.find(x => x[0] === bono.bono)?.[1] || 0), txt: `De bono este mes` })
        const est = (D.estrellas || []).find(e => e.p === p)
        if (est) out.push({ big: `Estrella ${GEMAS.find(g => g[0] === est.estrella)?.[1] || ''}`, txt: `Del trimestre · ${pts(est.puntos)}` })
        const club = (D.club || []).find(x => x.p === p)
        if (club) out.push({ big: `Unit Club ${num(club.meta)}`, txt: 'Va en ruta' })
        const tsr = (D.tsr || []).find(x => x.p === p)
        if (tsr) out.push({ big: 'Trofeo sobre ruedas', txt: (tsr.nivel || '').includes('2') ? 'Segundo nivel' : 'Primer nivel' })
        return out.slice(0, 6)
    }
    let cerrarReina = null
    const abrirReina = (kk, reinas, segunda) => new Promise(listo => {
        const pop = $('.reina-pop')
        const titulo = CATS[cat][1]
        const fmt = fmtDe()
        $('.rp-fotos').innerHTML = reinas.map(x => `<div class="rp-marco" style="--silueta:url(${base}/kit-silueta.webp)"><div class="foto-d">${quien(x.p).foto ? `<img src="${esc(quien(x.p).foto)}" alt="">` : `<span class="cara">${esc(iniciales(x.p))}</span>`}</div>`
            + `<img src="${base}/kit-marco.webp" alt="" aria-hidden="true"><i class="corona"></i></div>`).join('')
        pop.classList.toggle('doble', reinas.length > 1)
        $('[data-rp-k]').textContent = `Reina de ${titulo} · ${cap(mes)} ${D.anio}`
        $('[data-rp-n]').innerHTML = reinas.map(x => esc(corto(x.p))).join(' y ')
        $('[data-rp-v]').textContent = fmt(reinas[0].valor)
        $('[data-rp-i]').textContent = insignia(kk, reinas.map(x => x.p))
        $('[data-rp-d]').innerHTML = reinas.length > 1 ? reinas.map(x => `<div class="rp-dato"><b>${coronas(kk, x.p) + 1}</b><span>Coronas de ${esc(corto(x.p))} en ${D.anio}</span></div>`).join('')
            : datosReina(kk, reinas[0].p, reinas[0].valor, segunda).map((d, i) => `<div class="rp-dato" style="--n:${i}"><b>${d.big}</b><span>${d.txt}</span></div>`).join('')
        pop.hidden = false
        void pop.offsetWidth
        pop.classList.add('abierta')
        confeti(pop)
        $('.rp-texto [data-rp-cerrar]').focus({ preventScroll: true })
        let t = 0
        cerrarReina = () => {
            clearTimeout(t)
            cerrarReina = null
            pop.classList.remove('abierta')
            const fin = setTimeout(() => { pop.hidden = true; listo() }, 350)
            limpiar.push(() => clearTimeout(fin))
        }
        if ($('[data-auto]').checked) t = setTimeout(() => cerrarReina?.(), 9000)
    })
    on(root, 'click', e => { if (e.target.closest('[data-rp-cerrar]')) cerrarReina?.() })

    // el duelo: las dos últimas suben al mismo paso; la que se detiene primero es la 2.ª, la que sigue es la reina
    const duelo = () => new Promise(fin => {
        const vivas = cartas.filter(x => !x.hecha)
        const tope = Math.max(...vivas.map(x => x.valor))
        const T = 3600
        const els = vivas.map(x => ({ x, el: $(`.carta[data-p="${CSS.escape(x.p)}"]`, $('[data-escena]')) }))
        els.forEach(({ el }) => { el.classList.add('en-duelo'); $('.tension', el).hidden = false })
        $('.finalistas').classList.add('duelo')
        const t0 = performance.now()
        const tick = ahora => {
            const t = Math.min(1, (ahora - t0) / T)
            const sube = tope * (t < 1 ? 1 - (1 - t) ** 2.2 : 1)
            els.forEach(({ x, el }) => {
                const v = Math.min(x.valor, sube)
                $('.tension i', el).style.transform = `scaleY(${(v / tope).toFixed(3)})`
                $('.tension span', el).textContent = fmtDe()(Math.round(v))
                if (v >= x.valor && !x.hecha && x.lugar !== 1) { x.hecha = true; el.classList.add('volteada', 'segunda') }
            })
            if (t < 1) { raf2 = requestAnimationFrame(tick); return }
            setTimeout(() => {
                const reinas = vivas.filter(x => x.lugar === 1)
                reinas.forEach(x => { x.hecha = true; $(`.carta[data-p="${CSS.escape(x.p)}"]`, $('[data-escena]')).classList.add('volteada', 'ganadora') })
                const caja = $('.finalistas')
                caja.insertAdjacentHTML('beforeend', `<div class="insignia">${esc(insignia(k(), reinas.map(x => x.p)))}</div>`)
                reveladas.add(cat)
                pintarReinas()
                pintarMeses(k(), true)
                // la reina sale en grande; al cerrarla sigue la ceremonia
                const segunda = vivas.filter(x => x.lugar !== 1).sort((a, b) => a.lugar - b.lugar)[0]
                setTimeout(() => abrirReina(k(), reinas, segunda).then(fin), 700)
            }, 450)
        }
        let raf2 = requestAnimationFrame(tick)
        limpiar.push(() => cancelAnimationFrame(raf2))
    })

    const escena = () => {
        const [kk, , fmt, tramo] = CATS[cat]
        const g = grupos(D.reinas[kk] || [])
        const que = etapas[etapa]
        const esc_ = $('[data-escena]')
        $('[data-extra]').innerHTML = ''
        if (que === 'intro') {
            const n = narrativa(kk)
            esc_.innerHTML = `<div class="intro-c">${n ? `<p class="narra">${n}</p>` : ''}<p class="pregunta">¿Quién se lleva la corona de ${esc(mes)}?</p></div>`
        } else if (que === 'pasarela') {
            esc_.innerHTML = `<p class="kicker centro">Del 10.º al 4.º lugar</p>${pasarela(g, fmt)}`
        } else if (que === 'finalistas') {
            esc_.innerHTML = `<p class="kicker centro">Las tres finalistas · ¿quién es quién?</p><div class="finalistas">${cartas.map((x, i) => carta(x, i)).join('')}</div>`
        } else if (que === 'revela') {
            const c = cartas.filter(x => !x.hecha).sort((a, b) => b.lugar - a.lugar)[0]
            c.hecha = true
            $(`.carta[data-p="${CSS.escape(c.p)}"]`, esc_).classList.add('volteada', 'fuera')
        } else if (que === 'duelo') {
            animando = true
            pintarBoton()
            duelo().then(() => { animando = false; pintarBoton(); programar() })
            return
        } else if (que === 'podio') {
            esc_.innerHTML = `<div class="final-c"><div>${podio(g, fmt)}</div><div>${pasarela(g, fmt)}</div></div>`
            if (tramo) {
                $('[data-extra]').innerHTML = `<p class="kicker">Todas las iniciadoras del mes</p>${TRAMOS[tramo].map(([tk, txt]) => {
                    const gente = D.iniciadoras?.[tramo]?.[tk] || []
                    return gente.length ? `<div class="tramo"><small>${txt}</small><div class="chips">${gente.map((x, idx) => chip(x.p, ini(x.valor), idx)).join('')}</div></div>` : ''
                }).join('')}`
            }
        }
        const cer = $('.ceremonia')
        cer.dataset.etapa = que
        cer.classList.remove('anima'); void cer.offsetWidth; cer.classList.add('anima')
        pintarBoton()
        programar()
    }
    const ESPERA = { intro: 4500, pasarela: 0, finalistas: 6500, revela: 2800, duelo: 4500, podio: 6000 }
    const programar = () => {
        clearTimeout(autoT)
        if (!$('[data-auto]').checked || animando) return
        const que = etapas[etapa]
        const extra = que === 'pasarela' ? $$('.pasarela li', $('[data-escena]')).length * PASO + 2000 : 0
        autoT = setTimeout(avanzar, (ESPERA[que] || 3000) + extra)
    }
    const mostrarCat = i => {
        cat = (i + CATS.length) % CATS.length
        clearTimeout(autoT)
        animando = false
        const [kk, titulo] = CATS[cat]
        const lista = (D.reinas[kk] || []).filter(x => x.lugar <= 3).sort((a, b) => a.lugar - b.lugar).slice(0, 3)
        // en pantalla van revueltas (la reina no siempre en medio) y fijas por categoría
        const orden = [[1, 0, 2], [2, 1, 0], [0, 2, 1], [1, 2, 0], [2, 0, 1], [0, 1, 2]][cat % 6]
        cartas = orden.filter(n => n < lista.length).map(n => ({ ...lista[n], hecha: false }))
        const hayResto = (D.reinas[kk] || []).some(x => x.lugar >= 4)
        etapas = ['intro', ...(hayResto ? ['pasarela'] : []), 'finalistas', ...Array(Math.max(0, cartas.length - 2)).fill('revela'), 'duelo', 'podio']
        etapa = 0
        $('[data-cat-t]').textContent = titulo
        $('[data-cat-n]').textContent = `${cat + 1} de ${CATS.length}`
        pintarReinas()
        pintarMeses(kk, reveladas.has(cat))
        escena()
    }
    const avanzar = () => {
        if (animando || cat < 0) return
        if (etapa < etapas.length - 1) { etapa++; escena(); return }
        if (cat < CATS.length - 1) mostrarCat(cat + 1)
        else seccionTras($('#top'))?.scrollIntoView({ behavior: 'smooth' })
    }
    on($('.reinas-n'), 'click', e => { const b = e.target.closest('[data-cat]'); if (b) mostrarCat(Number(b.dataset.cat)) })
    on($('[data-cat-ant]'), 'click', () => mostrarCat(cat - 1))
    on($('[data-cat-sig]'), 'click', () => mostrarCat(cat + 1))
    on($('[data-cat-otra]'), 'click', () => mostrarCat(cat))
    on($('[data-avanzar]'), 'click', avanzar)
    on($('[data-auto]'), 'change', programar)
    // el control de la presentación (o las flechas) avanza la ceremonia cuando está a la vista
    let cerVista = false
    on(document, 'keydown', e => {
        if (cerrarReina && ['ArrowRight', 'PageDown', 'Escape', 'Enter', ' '].includes(e.key)) { e.preventDefault(); cerrarReina(); return }
        if (enJunta || !cerVista || e.target.closest?.('input, textarea, select')) return
        if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); avanzar() }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); mostrarCat(cat) }
    })
    const ioV = new IntersectionObserver(([e]) => { cerVista = e.isIntersecting }, { threshold: .35 })
    limpiar.push(() => ioV.disconnect(), () => clearTimeout(autoT))
    pintarReinas()

    // ---- bonos ----
    $('.escalera').innerHTML = BONOS.filter(([k]) => (D.bonos || []).some(b => b.bono === k)).map(([k, monto, rango]) => {
        const g = (D.bonos || []).filter(b => b.bono === k).sort((a, b) => b.valor - a.valor)
        return `<div class="bono panel con"><div class="monto"><b>${pesos(monto)}</b><small>${rango}</small></div>`
            + `<div class="ganadoras">${g.map((b, i) => chip(b.p, pts(b.valor), i)).join('')}</div></div>`
    }).join('')
    // los escalones de arriba que nadie alcanzó: una sola línea, sin renglones vacíos
    const tope = Math.max(0, ...(D.bonos || []).map(b => BONOS.find(x => x[0] === b.bono)?.[1] || 0))
    const libres = BONOS.filter(([k, monto]) => monto > tope && !(D.bonos || []).some(b => b.bono === k)).reverse()
    if (libres.length) $('.libres').innerHTML = `<span>${tope ? 'Más arriba, libres para' : 'Libres para'} ${esc(D.mesEnCurso)}:</span>`
        + libres.map(([, monto, , desde]) => `<i><b>${pesos(monto)}</b> desde ${num(desde)} pts</i>`).join('')

    // ---- Cortes: el reconocimiento del año, cada una con su joya y las que van en ruta en grande ----
    const joya = n => `${op.joyas || '/boletin/joyas27'}/${n}.webp`
    const mNum = NOMBRE_MES.indexOf(mes) + 1
    const quedan = (6 - mNum + 12) % 12 || 12                     // meses que faltan para cerrar el Año Seminario (junio)
    const enRuta = (D.club || []).length + (D.corteVentas || []).length + (D.corteIniciacion || []).length
    $('[data-cortes-s]').innerHTML = `El reconocimiento más difícil y más importante del año: se gana sumando de julio a junio. Quedan <b>${quedan} meses</b>`
        + (enRuta ? ` y en tu área ya van <b>${enRuta === 1 ? '1 en ruta' : `${enRuta} en ruta`}</b>.` : '.')
    const contendiente = (p, valor, meta, unidad, n) => {
        const pct = Math.min(100, Math.round((valor / meta) * 100))
        const falta = Math.max(0, meta - valor)
        const porMes = Math.ceil(falta / quedan)
        return `<div class="cont" style="--v:${(pct / 100).toFixed(3)};--n:${n}"><div class="cont-foto">${cara(p, 'grande')}<span class="pct">${pct} %</span></div>`
            + `<b>${esc(quien(p).nombre)}</b><span class="lleva cifra">${num(valor)} de ${num(meta)} ${unidad}</span>`
            + `<div class="tubo"><i style="--v:${(pct / 100).toFixed(3)}"></i></div>`
            + `<small>${falta ? `Le ${falta === 1 ? 'falta' : 'faltan'} <b>${num(falta)}</b> · unos ${num(porMes)} por mes` : '<b>¡Ya llegó!</b>'}</small></div>`
    }
    const grupoCortes = (lista, fn) => {
        const top = lista.slice(0, 6)
        const resto = lista.slice(6)
        return `<div class="conts">${top.map((x, n) => fn(x, n)).join('')}</div>${resto.length ? `<p class="mas-c">Y ${resto.length} más van en ruta: ${resto.map(x => esc(corto(x.p))).join(', ')}.</p>` : ''}`
    }
    const ventas = [...(D.corteVentas || [])].sort((a, b) => b.valor - a.valor)
    const inicios = [...(D.corteIniciacion || [])].sort((a, b) => b.valor / b.meta - a.valor / a.meta)
    const club = D.club || []
    const NIVELES_UC = [
        [450000, 'Círculo de Distinción', 'uc450', 'Prendedor de oro 14K y placa grabada'],
        [600000, 'Círculo de Crecimiento', 'uc600', 'Anillo de oro blanco 14K con diamantes y prendedor', 'pin600'],
        [750000, 'Círculo de Logros', 'uc750', 'Anillo de oro amarillo 14K, prendedor y viaje a Asia', 'pin750'],
        [1100000, 'Círculo de Excelencia', 'uc1100', 'Anillo de oro blanco, viaje a Asia y bono de $110,000'],
    ]
    const bloque = (clase, img, premio, kicker, titulo, regla, cuerpo) => `<article class="corte-n panel revela ${clase}">`
        + `<div class="joya-c"><i class="brillo" aria-hidden="true"></i><img src="${img}" alt="${esc(premio)}"><small>${premio}</small></div>`
        + `<div class="corte-info"><p class="kicker">${kicker}</p><h3>${titulo}</h3><p class="regla">${regla}</p>${cuerpo}</div></article>`
    $('.cortes-lista').innerHTML = [
        bloque('c-ventas', joya('ventas'), 'Anillo de oro amarillo 14K con diamantes', 'Corte de Ventas', 'Su anillo, con 50,000 pts',
            'Producción personal acumulada en el Año Seminario (máximo 10,000 pts por mes).',
            ventas.length ? grupoCortes(ventas, (x, n) => contendiente(x.p, x.valor, x.valor + (x.falta || 0), 'pts', n)) : '<p class="nadie-c">Este mes nadie de tu área va en ruta. ¡Todavía hay tiempo!</p>'),
        bloque('c-inicios', joya('iniciacion'), 'Anillo de oro amarillo 14K con diamantes', 'Corte de Iniciación', 'Su anillo, con sus inicios',
            '36 inicios calificados de 600 pts o 24 de 1,800 pts en el Año Seminario (máximo 10 por mes).',
            inicios.length ? grupoCortes(inicios, (x, n) => contendiente(x.p, x.valor, x.meta, 'inicios calificados', n)) : '<p class="nadie-c">Este mes nadie de tu área va en ruta. ¡Todavía hay tiempo!</p>'),
        `<article class="corte-n panel revela c-uc"><div class="corte-info"><p class="kicker">Corte de Unit Club</p><h3>Los cuatro círculos del Unit Club</h3>`
        + `<p class="regla">Producción de unidad al cierre del Año Seminario. Cada círculo, su joya.</p><div class="uc-niveles">`
        + NIVELES_UC.map(([meta, nombre, img, premio, pin], k) => {
            const gente = club.filter(c => c.meta === meta)
            return `<div class="uc-nivel ${gente.length ? 'con' : ''}" style="--n:${k}"><div class="uc-joya"><i class="brillo" aria-hidden="true"></i><img src="${joya(img)}" alt="${esc(premio)}"></div>`
                + (pin ? `<img class="uc-pin" src="${joya(pin)}" alt="" aria-hidden="true">` : '')
                + `<b>${nombre}</b><span class="cifra">${num(meta)} pts</span><small>${premio}</small>`
                + `<div class="uc-gente">${gente.length ? gente.map((c, n) => contendiente(c.p, c.total, c.meta, 'pts', n)).join('') : '<span class="nadie-c">Nadie en ruta todavía</span>'}</div></div>`
        }).join('') + `</div><p class="nota-uc">Con 275,000 pts de producción de unidad de julio a diciembre se puede cambiar el anillo por un iPhone, una bolsa Carolina Herrera o un set de topacios.</p></div></article>`,
    ].join('')

    // ---- estrellas ----
    $('.gemas').innerHTML = GEMAS.filter(([k]) => (D.estrellas || []).some(e => e.estrella === k)).map(([k, nombre, cls]) => {
        const g = (D.estrellas || []).filter(e => e.estrella === k).sort((a, b) => b.puntos - a.puntos)
        return `<article class="gema panel ${cls}"><header><i></i><b>${nombre}</b><span>${g.length}</span></header>`
            + `<div class="lista">${g.map((e, i) => chip(e.p, pts(e.puntos), i)).join('')}</div></article>`
    }).join('')
    // las metas del trimestre que ya empezó
    $('.metas-e').innerHTML = `<span>${mNumero % 3 === 0 ? `El trimestre de ${triTexto(mNumero % 12 + 1)} ya empezó:` : 'Las metas del trimestre:'}</span>`
        + [...GEMAS].reverse().map(([, nombre, cls, meta]) => `<i class="${cls}"><u aria-hidden="true"></u><b>${nombre}</b> ${num(meta)} pts</i>`).join('')

    // ---- camino al éxito y trofeo sobre ruedas ----
    $('.camino').innerHTML = NIVELES.map(([k, nombre, regla], i) => {
        const g = (D.cumbre || []).filter(c => c.nivel === k)
        // las directoras paradas sobre su escalón; los escalones siempre suben, haya las que haya en cada uno
        return `<div class="peldano p${i + 1} ${g.length ? '' : 'vacio'}"><div class="gente">${g.length ? g.map((c, n) => chip(c.p, `${c.primeraLinea} en 1ra línea`, n)).join('') : '<span class="nadie-p">Este mes, nadie</span>'}</div>`
            + `<div class="bloque"><h3>${nombre}</h3><small>${regla}</small></div></div>`
    }).join('')
    // ---- Trofeo sobre ruedas: su propia sección, con el auto que entra manejando ----
    const tsr = D.tsr || []
    const ganaTsr = tsr.filter(x => x.grupo?.startsWith('winners'))
    const rutaTsr = tsr.filter(x => x.grupo?.startsWith('target'))
    const nivelTsr = x => ((x.nivel || x.grupo || '').includes('2') ? 'Segundo nivel' : 'Primer nivel')
    // su producción trimestre a trimestre: lo que la sostiene en el Trofeo
    const trimestres = x => {
        const t = x.historia.trimestres.slice(-4)
        const tope = Math.max(...t.map(q => q.pts))
        return `<div class="tri"><small>Su producción, trimestre a trimestre</small><div class="tri-barras">${t.map((q, i) => `<div class="tri-b ${i === t.length - 1 ? 'hoy' : ''}" style="--v:${(q.pts / tope).toFixed(3)};--n:${i}">`
            + `<span class="cifra">${num(q.pts)}</span><i></i><small>${esc(q.etiqueta)}</small></div>`).join('')}</div></div>`
    }
    const calif = D.calificacion || []
    if (tsr.length || calif.length) {
        $('#trofeo').hidden = false
        // quien ya lo traía y este mes lo sostiene con su producción lo CONSERVA; sólo quien lo estrena «se gana un auto»
        const mesActual = `${D.anio}-${String(NOMBRE_MES.indexOf(mes) + 1).padStart(2, '0')}`
        const conserva = x => !!x.historia?.desde && x.historia.desde < mesActual
        const auto = ganaTsr.some(x => x.premio === 'automovil')
        const nuevas = ganaTsr.filter(x => !conserva(x))
        const desdeTxt = x => {
            const h = x.historia || {}
            if (!h.desde) return ''
            const [y, m] = h.desde.split('-').map(Number)
            return h.todoElRegistro && m === 1 ? `todos los meses de ${y}` : `desde ${NOMBRE_MES[m - 1]} de ${y}`
        }
        void auto
        $('[data-tsr-t]').textContent = !ganaTsr.length ? 'Rumbo al auto rosa'
            : nuevas.length ? '¡Se gana su auto rosa!'
            : ganaTsr.length === 1 ? 'Conserva su auto rosa' : 'Conservan su auto rosa'
        // con una sola se cuenta su historia; con varias, una línea para todas (cada tarjeta trae lo suyo)
        const nombres = l => l.map(x => `<b>${esc(corto(x.p))}</b>`).join(', ').replace(/, ([^,]*)$/, ' y $1')
        const siguen = ganaTsr.length - nuevas.length
        $('[data-tsr-s]').innerHTML = !ganaTsr.length ? 'Las directoras que van en calificación al auto rosa con la producción de su unidad.'
            : ganaTsr.length === 1 ? (conserva(ganaTsr[0])
                ? `<b>${esc(corto(ganaTsr[0].p))}</b> mantiene su auto rosa: lo ha conservado ${desdeTxt(ganaTsr[0])}, trimestre a trimestre, con la producción de su unidad.`
                : `<b>${esc(corto(ganaTsr[0].p))}</b> calificó al auto rosa con la producción de su unidad.`)
            : nuevas.length ? `${nombres(nuevas)} ${nuevas.length === 1 ? 'calificó' : 'calificaron'} al auto rosa${siguen ? ` y <b>${siguen === 1 ? '1 directora más' : `${siguen} directoras más`}</b> ${siguen === 1 ? 'lo conserva' : 'lo conservan'}` : ''}, con la producción de su unidad.`
            : `<b>${ganaTsr.length} directoras</b> de tu área conservan su auto rosa, trimestre a trimestre, con la producción de su unidad.`
        $('.tsr-gente').innerHTML = (ganaTsr.length ? ganaTsr : calif.length ? [] : rutaTsr).map((x, n) => `<article class="tsr-ganadora" style="--n:${n}">`
            + `<div class="tsr-marco" style="--silueta:url(${base}/kit-silueta.webp)"><div class="foto-d">${quien(x.p).foto ? `<img src="${esc(quien(x.p).foto)}" alt="">` : `<span class="cara">${esc(iniciales(x.p))}</span>`}</div><img src="${base}/kit-marco.webp" alt="" aria-hidden="true"></div>`
            + `<div class="tsr-datos"><small>${nivelTsr(x)}${x.grupo?.startsWith('target') ? ' · en ruta' : ''}</small><b>${esc(quien(x.p).nombre)}</b>`
            + `${x.premio ? `<span class="tsr-premio">${x.premio === 'bono' ? (conserva(x) ? 'Conserva su auto rosa · lo recibe como bono' : 'Recibe su auto rosa como bono') : (conserva(x) ? 'Conserva su auto rosa' : '¡Estrena su auto rosa!')}</span>` : ''}`
            + (x.historia?.trimestres?.length ? trimestres(x) : `<div class="chips">${(x.trimestres || []).map((v, t) => (v ? `<span class="chip"><span>${t === 0 ? '1.er' : '2.º'} trimestre · <b>${pts(v)}</b></span></span>` : '')).join('')}</div>`)
            + `${x.falta ? `<small class="tsr-falta">Le faltan ${pts(x.falta)}</small>` : ''}</div></article>`).join('')
        // en calificación: van sumando dos trimestres seguidos de producción de unidad (230,000 el primer nivel, 350,000 el segundo)
        if (calif.length) {
            const c = $('.tsr-calif')
            c.hidden = false
            const mNum = NOMBRE_MES.indexOf(mes) + 1
            const sig = n => NOMBRE_MES[(mNum - 1 + n) % 12]
            const cuando = x => (x.mesesQuedan === 3 && mNum % 3 === 0 ? `en ${sig(1)}, ${sig(2)} y ${sig(3)}` : 'en lo que queda del trimestre')
            c.innerHTML = `<p class="kicker">En calificación al auto rosa</p><div class="calif-lista">${calif.map((x, n) => `<div class="avance calif" style="--n:${n}">${cara(x.p)}<div class="datos">`
                + `<span><b>${esc(quien(x.p).nombre)}</b><span class="cifra">${num(x.valor)} de ${num(x.meta)}</span></span>`
                + `<div class="tubo"><i style="--v:${Math.min(1, x.valor / x.meta).toFixed(3)}"></i></div>`
                + `<small>${x.nivel === 2 ? 'Segundo' : 'Primer'} nivel · le faltan <b>${pts(x.falta)}</b> ${cuando(x)}: unos ${pts(x.porMes)} por mes de producción de unidad.</small></div></div>`).join('')}</div>`
        }
        if (ganaTsr.length && rutaTsr.length) {
            const r = $('.tsr-ruta')
            r.hidden = false
            r.innerHTML = `<p class="kicker">En ruta al Trofeo</p><div class="chips">${rutaTsr.map((x, n) => chip(x.p, `${nivelTsr(x)}${x.falta ? ` · le faltan ${pts(x.falta)}` : ''}`, n)).join('')}</div>`
        }
    } else {
        $('[data-tsr-link]')?.remove()
    }

    // ---- celebraciones: tarjetas de fiesta, en orden de fecha ----
    const dia = f => { const [, m, d] = String(f || '').split('-').map(Number); return d ? `${d} de ${NOMBRE_MES[m - 1]}` : '' }
    const semana = f => { try { return new Date(`${f}T12:00:00`).toLocaleDateString('es-MX', { weekday: 'long' }) } catch { return '' } }
    const fiestas = [
        ...(D.cumple || []).map(c => ({ tipo: 'cumple', p: c.p, d: Number(String(c.fecha).slice(8, 10)), fecha: c.fecha })),
        ...(D.aniversarios || []).map(a => ({ tipo: 'aniv', p: a.p, d: Number(String(a.inicio).slice(8, 10)), anios: a.anios, inicio: a.inicio })),
    ].sort((a, b) => a.d - b.d)
    const nC = (D.cumple || []).length
    const nA = (D.aniversarios || []).length
    $('[data-fiestas-s]').innerHTML = `En ${esc(D.mesEnCurso)}, tu área celebra <b>${nC === 1 ? '1 cumpleaños' : `${nC} cumpleaños`}</b> y <b>${nA === 1 ? '1 aniversario' : `${nA} aniversarios`}</b>.`
    $('.fiestas').innerHTML = fiestas.length ? fiestas.map((f, n) => f.tipo === 'cumple'
        ? `<article class="festejo cumple-f" style="--n:${n}"><span class="globos" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>${cara(f.p, 'grande')}`
            + `<span class="cinta-f">¡Feliz cumpleaños!</span><b class="nombre-f">${esc(quien(f.p).nombre)}</b>`
            + `<div class="fecha-f"><b>${f.d}</b><span>${esc(NOMBRE_MES[Number(String(f.fecha).slice(5, 7)) - 1])}<small>${esc(semana(f.fecha))}</small></span></div></article>`
        : `<article class="festejo aniv-f" style="--n:${n}">${cara(f.p, 'grande')}<span class="cinta-f">¡Feliz aniversario!</span>`
            + `<b class="nombre-f">${esc(quien(f.p).nombre)}</b><div class="anios-f"><b>${f.anios}</b><span>${f.anios === 1 ? 'año' : 'años'} de ser<br>Mary Kay</span></div>`
            + `<small class="desde-f">Desde el ${esc(dia(f.inicio))} de ${String(f.inicio).slice(0, 4)}</small></article>`).join('')
        : '<p class="vacio">Este mes no hay cumpleaños ni aniversarios en tu área.</p>'
    // un estallido de confeti la primera vez que se ven
    const ioF = new IntersectionObserver(([e]) => { if (e.isIntersecting && fiestas.length) { confeti($('#celebraciones')); ioF.disconnect() } }, { threshold: .4 })
    ioF.observe($('#celebraciones'))
    limpiar.push(() => ioF.disconnect())

    // ---- la carrera de las unidades ----
    const filas = $('.filas')
    const alto = () => (matchMedia('(max-width: 760px)').matches ? 40 : 44)
    filas.style.height = `${unidades.length * alto()}px`
    const FILA = new Map()
    for (const u of unidades) {
        const el = document.createElement('div')
        el.className = 'fila'
        el.setAttribute('role', 'listitem')
        el.innerHTML = `<span class="pos"></span><span class="av">${cara(u.p)}</span><span class="nom">${esc(corto(u.p))}</span><span class="barra-f"><i></i></span><span class="pts cifra">0</span>`
        filas.appendChild(el)
        FILA.set(u.p, { el, pos: $('.pos', el), barra: $('.barra-f i', el), pts: $('.pts', el), av: $('.av', el), rk: -1 })
    }
    const maximo = Math.max(1, ...unidades.map(u => u.total))
    const n = mesesC.length
    const CORRE = 3400
    const PAUSA = 1300
    const DURA = n * (CORRE + PAUSA)
    const suave = x => (x < .5 ? 2 * x * x : 1 - (-2 * x + 2) ** 2 / 2)
    const valoresEn = t => {
        const k = Math.min(n - 1, Math.floor(t / (CORRE + PAUSA)))
        const resto = t - k * (CORRE + PAUSA)
        const f = resto >= CORRE ? 1 : suave(resto / CORRE)
        return { k, f, v: unidades.map(u => u.cum[k] + (u.cum[k + 1] - u.cum[k]) * f) }
    }
    const ordenEn = vals => unidades.map((u, i) => ({ u, v: vals[i] })).sort((a, b) => b.v - a.v || a.u.p.localeCompare(b.u.p))
    const avisos = $('.avisos')
    const mesNombre = k => NOMBRE_MES[Number(mesesC[k].slice(5)) - 1]
    const avisarMes = k => {
        const fin = ordenEn(unidades.map(u => u.cum[k + 1]))
        const antes = ordenEn(unidades.map(u => u.cum[k]))
        const lugarAntes = new Map(antes.map((x, i) => [x.u.p, i]))
        const lider = fin[0].u.p
        const msgs = []
        if (k === 0) msgs.push(`<b>${esc(cap(mesNombre(k)))}:</b> ${esc(corto(lider))} arrancó al frente con ${pts(fin[0].v)}.`)
        else if (antes[0].u.p !== lider) msgs.push(`<b>${esc(cap(mesNombre(k)))}:</b> ¡${esc(corto(lider))} tomó el primer lugar!`)
        else msgs.push(`<b>${esc(cap(mesNombre(k)))}:</b> ${esc(corto(lider))} sigue al frente.`)
        if (k > 0) {
            const sube = fin.map((x, i) => ({ p: x.u.p, d: lugarAntes.get(x.u.p) - i })).sort((a, b) => b.d - a.d)[0]
            if (sube && sube.d >= 2) msgs.push(`${esc(corto(sube.p))} subió ${sube.d} lugares.`)
        }
        avisos.insertAdjacentHTML('afterbegin', msgs.map(m => `<div class="aviso-c">${m}</div>`).join(''))
        $$('.aviso-c', avisos).slice(4).forEach(a => a.remove())
    }
    const lineas = $$('.linea-m span')
    const pintar = t => {
        const { k, f, v } = valoresEn(t)
        const orden = ordenEn(v)
        orden.forEach((x, i) => {
            const fl = FILA.get(x.u.p)
            if (fl.rk !== i) {
                fl.el.style.transform = `translateY(${i * alto()}px)`
                fl.pos.textContent = i + 1
                fl.el.classList.toggle('r1', i === 0 && x.v > 0)
                fl.el.classList.toggle('sube', fl.rk !== -1 && i < fl.rk)
                const corona = fl.av.querySelector('.corona')
                if (i === 0 && x.v > 0 && !corona) fl.av.insertAdjacentHTML('beforeend', '<i class="corona"></i>')
                if ((i !== 0 || x.v === 0) && corona) corona.remove()
                fl.rk = i
            }
        })
        unidades.forEach((u, i) => {
            const fl = FILA.get(u.p)
            fl.barra.style.transform = `scaleX(${(v[i] / maximo).toFixed(4)})`
            fl.pts.textContent = num(Math.round(v[i]))
        })
        $('[data-total]').textContent = `${num(Math.round(v.reduce((s, x) => s + x, 0)))} pts`
        $('[data-mes-c]').textContent = cap(mesNombre(k))
        lineas.forEach((l, i) => {
            l.querySelector('i').style.transform = `scaleX(${i < k ? 1 : i === k ? f : 0})`
            l.classList.toggle('hecho', i < k || (i === k && f >= 1))
        })
        const top = orden[0]
        const lid = $('[data-lider]')
        if (top.v > 0) {
            lid.hidden = false
            if (lid.dataset.p !== top.u.p) {
                lid.dataset.p = top.u.p
                lid.innerHTML = `${cara(top.u.p)}<div><small>Va al frente</small><b>${esc(corto(top.u.p))}</b><span class="cifra" data-lider-pts></span></div>`
            }
            $('[data-lider-pts]').textContent = pts(Math.round(top.v))
        }
    }
    let t = 0
    let corriendo = false
    let raf = 0
    let antes = 0
    let avisado = -1
    const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg>'
    const PAUSAR = '<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>'
    const boton = $('[data-play]')
    const paso = ahora => {
        const dt = Math.min(80, ahora - antes)
        antes = ahora
        t = Math.min(DURA, t + dt)
        pintar(t)
        // al terminar de correr cada mes se cuenta lo que pasó
        const k = Math.min(n - 1, Math.floor(t / (CORRE + PAUSA)))
        if (t >= k * (CORRE + PAUSA) + CORRE && avisado < k) { avisado = k; avisarMes(k) }
        if (t >= DURA) { detener(); return }
        raf = requestAnimationFrame(paso)
    }
    const correr = () => { if (corriendo) return; if (t >= DURA) reiniciar(); corriendo = true; boton.innerHTML = PAUSAR; boton.setAttribute('aria-label', 'Pausa'); antes = performance.now(); raf = requestAnimationFrame(paso) }
    const detener = () => { corriendo = false; cancelAnimationFrame(raf); boton.innerHTML = PLAY; boton.setAttribute('aria-label', 'Reproducir') }
    const reiniciar = () => { t = 0; avisado = -1; avisos.innerHTML = ''; FILA.forEach(f => { f.rk = -1 }); pintar(0) }
    boton.innerHTML = PLAY
    on(boton, 'click', () => (corriendo ? detener() : correr()))
    on($('[data-otra]'), 'click', () => { detener(); reiniciar(); correr() })
    pintar(0)

    // ---- lo que aparece al verse, la carrera arranca sola la primera vez ----
    const io = new IntersectionObserver(entradas => entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add('ver'); io.unobserve(e.target) } }), { threshold: .15 })
    $$('.revela').forEach(el => io.observe(el))
    const ioH = new IntersectionObserver(([e]) => { if (e.isIntersecting && cat < 0) { mostrarCat(0); ioH.disconnect() } }, { threshold: .3 })
    ioH.observe($('.ceremonia'))
    ioV.observe($('.ceremonia'))
    let arrancada = false
    const ioC = new IntersectionObserver(([e]) => { if (e.isIntersecting && !arrancada) { arrancada = true; correr() } }, { threshold: .35 })
    ioC.observe($('.pista'))

    // ---- navegación dentro del Shadow DOM ----
    on(root, 'click', e => {
        const a = e.target.closest('a[href^="#"]')
        if (a) { e.preventDefault(); $(a.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' }) }
        if (e.target.closest('[data-ir]')) seccionTras($('.entrada'))?.scrollIntoView({ behavior: 'smooth' })
        if (e.target.closest('[data-arriba]')) $('.entrada').scrollIntoView({ behavior: 'smooth' })
        if (e.target.closest('[data-volver]') && op.volver) op.volver()
    })
    const ioN = new IntersectionObserver(es => es.forEach(e => {
        if (!e.isIntersecting) return
        $$('.secciones a').forEach(a => a.classList.toggle('activa', a.getAttribute('href') === `#${e.target.id}`))
    }), { rootMargin: '-40% 0px -55% 0px' })
    $$('main > section[id]').forEach(s => ioN.observe(s))

    // ---- el mensaje de la Directora: sale al abrir, con su foto y su firma; lo escribe ella en Ajustes ----
    const pintarMensaje = t => {
        const texto = (t || '').trim()
        $('#mensaje').hidden = !texto
        $('[data-msj]').innerHTML = texto.split(/\n+/).map(x => x.trim()).filter(Boolean).map((x, i) => `<p style="--n:${i}">${esc(x)}</p>`).join('')
    }
    pintarMensaje(D.ajustes?.mensaje)
    if (op.editar) {
        const b = $('[data-ajustes]')
        const panel = $('#ajustes')
        const msg = $('[data-msg]')
        const guardado = $('.guardado')
        msg.value = D.ajustes?.mensaje || ''
        const mesSel = $('[data-mes-sel]')
        if (mesSel) on(mesSel, 'change', () => op.cambiarMes?.(mesSel.value))
        on(b, 'click', () => { panel.hidden = !panel.hidden; b.setAttribute('aria-expanded', String(!panel.hidden)) })
        on(root, 'click', e => { if (!panel.hidden && !e.target.closest('#ajustes, [data-ajustes]')) { panel.hidden = true; b.setAttribute('aria-expanded', 'false') } })
        // se guarda al dejar de escribir; mientras escribe, el mensaje se ve sin animarse
        let tMsg = 0
        on(msg, 'input', () => {
            $('.carta-n').classList.add('editando')
            pintarMensaje(msg.value)
            guardado.textContent = ''
            clearTimeout(tMsg)
            tMsg = setTimeout(() => {
                if (!op.guardarMensaje) return
                guardado.textContent = 'Guardando…'
                Promise.resolve(op.guardarMensaje(msg.value.trim())).then(() => { guardado.textContent = 'Guardado' }, () => { guardado.textContent = 'No se pudo guardar. Revisa tu conexión.' })
            }, 900)
        })
        limpiar.push(() => clearTimeout(tMsg))
    }

    // ---- Modo junta: presentar el boletín paso a paso (botón, flechas o el control de la presentación) ----
    // Igual que el de unidad: pantalla completa, bloques que caben en una pantalla y los mandos abajo. Además, en el
    // Cuadro de Honor la flecha avanza la ceremonia hasta coronar a la última reina, y la carrera vuelve a correr.
    const hud = $('.hud-junta')
    const nombreSeccion = el => {
        const s = el.closest('section')
        if (!s || s.matches('.entrada')) return ['Portada', '']
        if (s.matches('.cierre')) return ['Cierre', '']
        if (s.id === 'mensaje') return ['Mensaje de tu Directora', '']
        if (s.id === 'top') return ['Cuadro de Honor', `Top nacional de ${mes}`]
        return [$('h2', s)?.textContent || '', $('.kicker', s)?.textContent || '']
    }
    const calcularPasos = () => {
        const alto = innerHeight * .9
        const visible = c => !c.hidden && c.offsetHeight > 0
        // cada sección se parte en bloques; un bloque más alto que la pantalla se parte en sus hijos (los Cortes)
        const bloques = []
        $$('main > section:not([hidden])').forEach(s => {
            if (s.matches('.entrada, .cierre, #mensaje')) { bloques.push(s); return }
            ;[...s.children].filter(visible).forEach(c => {
                if (c.offsetHeight > alto && c.children.length > 1 && !c.matches('.ceremonia, .escenario')) bloques.push(...[...c.children].filter(visible))
                else bloques.push(c)
            })
        })
        const top = el => el.getBoundingClientRect().top + scrollY
        const res = []
        let inicio = null
        bloques.forEach(b => {
            // bloques seguidos que caben en una pantalla van juntos
            if (inicio === null || top(b) + b.offsetHeight - top(inicio) > alto || b.matches('.entrada, .cab, .ceremonia, .escenario, #mensaje, .cierre')) { res.push(b); inicio = b }
        })
        return res
    }
    const irPaso = i => {
        iPaso = Math.max(0, Math.min(pasos.length - 1, i))
        const el = pasos[iPaso]
        if (el.matches('.escenario')) arrancada = true // la arranca la junta, desde cero
        const y = el.getBoundingClientRect().top + scrollY - (el.matches('.entrada, .escenario, .ceremonia') ? 12 : 28)
        window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
        ponerHud()
        if (el.matches('.escenario')) { const t = setTimeout(() => { detener(); reiniciar(); correr() }, 700); limpiar.push(() => clearTimeout(t)) }
    }
    const cerTerminada = () => cat >= CATS.length - 1 && etapa >= etapas.length - 1
    function ponerHud() {
        const el = pasos[iPaso]
        if (!el) return
        const [h, k] = nombreSeccion(el)
        const extra = el.matches('.ceremonia') && cat >= 0 && !cerTerminada() ? `Sigue: ${etiqueta()}` : k
        $('.j-txt b').textContent = h
        $('.j-txt small').textContent = `${iPaso + 1} de ${pasos.length}${extra ? ` · ${extra}` : ''}`
    }
    // en la pantalla de la junta los mandos y el cursor se esconden solos; reaparecen al mover el mouse
    let tHud = 0
    const despertar = () => {
        hud.classList.remove('dormido')
        $('.pagina').classList.remove('quieta')
        clearTimeout(tHud)
        tHud = setTimeout(() => { if (enJunta && !hud.matches(':hover')) { hud.classList.add('dormido'); $('.pagina').classList.add('quieta') } }, 3000)
    }
    on(document, 'mousemove', () => { if (enJunta) despertar() })
    limpiar.push(() => clearTimeout(tHud))
    const siguiente = (saltar = false) => {
        const el = pasos[iPaso]
        if (!el) return
        if (!saltar && el.matches('.ceremonia') && CATS.length && !cerTerminada()) { if (cat < 0) mostrarCat(0); else avanzar(); return }
        // un bloque más alto que la pantalla se recorre antes de pasar al siguiente
        const r = el.getBoundingClientRect()
        if (!saltar && r.bottom > innerHeight + 40 && r.top < innerHeight * .5) { window.scrollBy({ top: Math.min(innerHeight * .8, r.bottom - innerHeight + 40), behavior: 'smooth' }); return }
        irPaso(iPaso + 1)
    }
    const anterior = () => {
        const r = pasos[iPaso]?.getBoundingClientRect()
        if (r && r.top < -40) { window.scrollBy({ top: -Math.min(innerHeight * .8, -r.top + 28), behavior: 'smooth' }); return }
        irPaso(iPaso - 1)
    }
    const junta = encender => {
        enJunta = encender
        $('.pagina').classList.toggle('junta', encender)
        hud.hidden = !encender
        if (encender) despertar()
        else $('.pagina').classList.remove('quieta')
        if (encender) {
            try { document.documentElement.requestFullscreen?.().catch(() => {}) } catch { /* sin pantalla completa: sigue igual */ }
            const t = setTimeout(() => { pasos = calcularPasos(); const i = pasos.findIndex(p => p.getBoundingClientRect().bottom > innerHeight * .4); irPaso(i < 0 ? 0 : i) }, 350)
            limpiar.push(() => clearTimeout(t))
        } else if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    }
    on($('[data-junta]'), 'click', () => junta(!enJunta))
    on($('[data-j-sig]'), 'click', () => siguiente())
    on($('[data-j-ant]'), 'click', anterior)
    on($('[data-j-salir]'), 'click', () => junta(false))
    on(document, 'fullscreenchange', () => { if (!document.fullscreenElement && enJunta) junta(false) })
    on(document, 'keydown', e => {
        const foco = root.activeElement || document.activeElement
        if (!enJunta || cerrarReina || /^(INPUT|SELECT|TEXTAREA)$/.test(foco?.tagName || '')) return
        if ((e.key === ' ' || e.key === 'Enter') && foco?.tagName === 'BUTTON') return // el botón ya hace lo suyo
        if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); siguiente() }
        else if (e.key === 'ArrowDown') { e.preventDefault(); siguiente(true) }
        else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); anterior() }
        else if (e.key === 'Home') { e.preventDefault(); irPaso(0) }
        else if (e.key === 'End') { e.preventDefault(); irPaso(pasos.length - 1) }
        else if (e.key === 'Escape') junta(false)
    }, true)
    on(window, 'resize', () => { if (enJunta) pasos = calcularPasos() })

    return {
        destruir() {
            if (document.fullscreenElement && enJunta) document.exitFullscreen?.().catch(() => {})
            detener()
            io.disconnect(); ioC.disconnect(); ioN.disconnect(); ioH.disconnect()
            limpiar.forEach(f => f())
            document.title = tituloAntes
            root.innerHTML = ''
        },
    }
}
