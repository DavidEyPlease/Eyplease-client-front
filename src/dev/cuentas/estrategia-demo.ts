// SÓLO DEV: «Tu estrategia», «Tu inventario» y «Ya me compró» de la consultora demo, con la forma EXACTA de la API en
// producción (ConsultantInventoryService, CustomerSaleService y ConsultantStrategyService; API fe0b83c y 98f96df, 27-oct-2026).
// La estrategia se arma con las MISMAS reglas que la API (config/strategy.php), así que reacciona a lo que ella vende o corrige.
// Perfiles: el de siempre es «Lupita» del prototipo (compra grande al 50 %, perfumes de septiembre guardados, CC Cream del
// Ordena Ya). Variantes: ?inventario=empieza (va empezando, al 35 %) | vacio | revisado | sin-ligar
// «Tu inventario» (API cfb7ffb, 9-nov-2026): cada producto con imagen trae su `piece` para «Compartir», y «Agregar» busca
// en una lista de Mary Kay de mentira (`consultant/inventory/catalog?q=`). Con ?inventario=vacio se ve como una consultora
// sin pedidos conectados: todo lo agrega a mano, escogiéndolo de la lista.
// Noviembre 2026 (lo que pidieron las clientas): cada producto con su `category`, «Para tu próximo pedido» (`next_order`,
// las mismas reglas que ConsultantInventoryService::nextOrder), la lista sin `q` (lo más pedido, de todo o por categoría)
// y `consultant/inventory/items/batch` («Agrega lo que tienes»). ?inventario=a-mano: como Violeta, todo cargado a mano
// hace 2 días, sin pedidos bajados.
import type { CatalogProduct, ConsultantInventory, CustomerSale, InventoryItem, InventoryPiece, NextOrder, NextOrderLine } from '@/interfaces/inventory'
import type { ConsultantStrategy, StrategyLevel, StrategyMoment, StrategyPiece, StrategyProduct, StrategyStep } from '@/interfaces/strategy'

const STALE_DAYS = 30
const DAY = 86400000

/** Fecha local de hace n días, como la manda la API (`toDateString`) */
const dateOnly = (daysAgo: number) => {
    const d = new Date(Date.now() - daysAgo * DAY)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const startOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const parseDay = (text: string) => { const [y, m, d] = text.split('-').map(Number); return new Date(y, m - 1, d) }
const daysSince = (date: string) => Math.round((startOf(new Date()).getTime() - parseDay(date).getTime()) / DAY)
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const r2 = (n: number) => Math.round(n * 100) / 100

interface Stock {
    sku: string
    name: string
    shade: string | null
    manual: boolean
    is_ordena_ya: boolean
    purchased: number
    on_hand: number
    price: number
    unit_cost: number | null
    last_purchased_at: string | null
    oldest_unit_at: string
    reviewed: boolean
    /** Lo que agregó ella a mano (en la API, los ajustes con +): con lo comprado y lo que le queda da lo que salió */
    added: number
}

const LAST_ORDER_DAYS = 13
const OLDER_ORDER_DAYS = 42

const row = (sku: string, name: string, shade: string | null, purchased: number, onHand: number, price: number, cost: number | null, when: string, ordenaYa = false): Stock => ({
    sku, name, shade, manual: false, is_ordena_ya: ordenaYa, purchased, on_hand: onHand, price, unit_cost: cost,
    last_purchased_at: when, oldest_unit_at: when, reviewed: false, added: 0,
})

/** Lo que agregó ella (de la lista o escrito), hace `daysAgo` días */
const manualRow = (sku: string, name: string, added: number, onHand: number, price: number, daysAgo: number): Stock => ({
    ...row(sku, name, null, 0, onHand, price, null, dateOnly(daysAgo)), manual: true, last_purchased_at: null, reviewed: true, added,
})

const seedBig = (): Stock[] => {
    const older = dateOnly(OLDER_ORDER_DAYS)
    const last = dateOnly(LAST_ORDER_DAYS)
    return [
        row('10195642', 'Mary Kay If You Believe® Eau de Toilette', null, 8, 8, 664, 206, older, true),
        row('10236911', 'Agua Micelar Mary Kay®', null, 4, 2, 394, 197, older),
        row('10216713', 'CC Cream Crema Correctora de Color FPS 15', 'Light to Medium', 20, 19, 404, 125.17, last, true),
        row('10207045', 'Base de Maquillaje TimeWise 3D®', 'Ivory C 110', 8, 8, 389, 194.5, last),
        row('10224187', 'Sombra Mate para Ojos en Barra', 'Smoky Quartz', 10, 8, 254, 127, last),
        row('10045632', 'Loción Desmaquillante de Ojos Libre de Aceite', null, 12, 11, 414, 207, last),
        row('10230518', 'Mary Kay Joy Emotion Scent® Eau de Parfum', null, 4, 4, 544, 272, last),
        row('10180326', 'Crema para Manos Satin Hands® Libre de Fragancia', null, 3, 0, 244, 122, older),
        // Lo que se mueve: lo que bajó con − (sin anotarlo como venta) también cuenta para «Para tu próximo pedido»
        row('10219874', 'Gel Limpiador TimeWise® 4 en 1', null, 6, 1, 459, 229.5, last),
        row('10240034', 'Bálsamo Labial Satin Lips®', null, 6, 0, 199, 99.5, older),
        row('10219890', 'Crema de Noche TimeWise®', null, 3, 1, 589, 294.5, older),
    ]
}

/**
 * «Todo a mano» (como Violeta, DDU522, 17-nov-2026: «manejo mucho inventario y a veces solo pido poquitos»): sin
 * pedidos bajados, lo cargó escogiendo de la lista hace 2 días y ya bajó con − lo que vendió. Uno lo escribió a su modo
 * y sin precio (como le pasó a Norma).
 */
const seedByHand = (): Stock[] => [
    // Escrito a mano sin precio, como le pasó a Norma: sale «Ponle precio»
    manualRow('M-HTSPY26R', 'Rubor rosy nude', 2, 2, 0, 2),
    manualRow('10216713', 'CC Cream Crema Correctora de Color FPS 15 Tono Light to Medium', 6, 4, 404, 2),
    manualRow('10207045', 'Base de Maquillaje TimeWise 3D Tono Ivory C 110', 3, 3, 389, 2),
    manualRow('10219874', 'Gel Limpiador TimeWise 4 en 1', 4, 2, 459, 2),
    manualRow('10219890', 'Crema de Noche TimeWise', 2, 2, 589, 2),
    manualRow('10219882', 'Crema de Día TimeWise FPS 30', 2, 1, 589, 2),
    manualRow('10233417', 'Máscara para Pestañas Lash Love', 5, 3, 329, 2),
    manualRow('10252210', 'Labial Líquido Mate At Play Tono Red My Mind', 3, 3, 299, 2),
    manualRow('10252232', 'Labial Líquido Mate At Play Tono Nude Attitude', 2, 0, 299, 2),
    manualRow('10230518', 'Joy Emotion Scent Eau de Parfum', 2, 2, 544, 2),
    manualRow('10241155', 'Velvet Scent Eau de Parfum', 1, 1, 523, 2),
    manualRow('10180326', 'Crema para Manos Satin Hands Libre de Fragancia', 4, 1, 244, 2),
    manualRow('10240034', 'Bálsamo Labial Satin Lips', 3, 3, 199, 2),
    manualRow('10236911', 'Agua Micelar', 2, 2, 394, 2),
    manualRow('10229031', 'Tónico Balanceador', 1, 1, 319, 2),
    manualRow('M-9QX4TB2L', 'Desmaquillante bifásico', 2, 2, 0, 2),
]

/** «Va empezando»: su primer pedido (el de Sofía en el prototipo), al 35 % */
const seedStart = (): Stock[] => {
    const last = dateOnly(20)
    return [
        row('10216713', 'CC Cream Crema Correctora de Color FPS 15', 'Light to Medium', 2, 2, 404, 262.6, last),
        row('10224187', 'Sombra Mate para Ojos en Barra', 'Smoky Quartz', 2, 2, 254, 165.1, last),
        row('10045632', 'Loción Desmaquillante de Ojos Libre de Aceite', null, 1, 1, 414, 269.1, last),
        row('10180326', 'Crema para Manos Satin Hands® Libre de Fragancia', null, 1, 1, 244, 158.6, last),
    ]
}

/** Las ventas que ya explican lo que bajó, y una de hace 11 semanas: a Andrea ya le toca volver a ofrecerle */
const seedSales = (customerName: (id: string) => string | null): CustomerSale[] => {
    const at = (daysAgo: number) => new Date(Date.now() - daysAgo * DAY).toISOString()
    return [
        { id: 'venta-3', client_customer_id: 'customer-1', customer_name: customerName('customer-1') ?? 'Evangelina Caracheo', total: 922, sold_at: at(1), source: 'app', note: null,
            items: [{ sku: '10224187', name: 'Sombra Mate para Ojos en Barra', quantity: 2, unit_price: 254 }, { sku: '10045632', name: 'Loción Desmaquillante de Ojos Libre de Aceite', quantity: 1, unit_price: 414 }] },
        { id: 'venta-2', client_customer_id: null, customer_name: 'Vecina de mi mamá', total: 788, sold_at: at(4), source: 'app', note: null,
            items: [{ sku: '10236911', name: 'Agua Micelar Mary Kay®', quantity: 2, unit_price: 394 }] },
        { id: 'venta-1', client_customer_id: 'customer-0', customer_name: customerName('customer-0') ?? 'Ana Valadez Ángeles', total: 404, sold_at: at(6), source: 'app', note: null,
            items: [{ sku: '10216713', name: 'CC Cream Crema Correctora de Color FPS 15', quantity: 1, unit_price: 404 }] },
        { id: 'venta-0', client_customer_id: 'customer-2', customer_name: customerName('customer-2') ?? 'Andrea Gorgonio', total: 389, sold_at: at(77), source: 'app', note: null,
            items: [{ sku: '10207045', name: 'Base de Maquillaje TimeWise 3D®', quantity: 1, unit_price: 389 }] },
    ]
}

// ---------- Las reglas de la estrategia (copia de config/strategy.php de la API) ----------

const CATEGORIES: Array<{ key: string, label: string, words: string[], reorder: number }> = [
    { key: 'fragancia', label: 'fragancias', words: ['eau de parfum', 'eau de toilette', 'extrait de parfum', 'eau de cologne', 'colonia', 'perfume', 'body mist', 'if you believe', ' scent'], reorder: 16 },
    { key: 'cuerpo', label: 'cuidado del cuerpo', words: ['satin hands', 'satin lips', 'locion corporal', 'crema para manos', 'corporal', 'cuerpo', 'para pies', 'piernas'], reorder: 8 },
    { key: 'maquillaje', label: 'maquillaje', words: ['base', 'cc cream', 'corrector', 'polvo', 'rubor', 'sombra', 'delineador', 'labial', 'brillo', 'labios con color', 'pestanina', 'palet', 'contorno de rostro', 'mascara para pestanas', 'rimel', 'lapiz', 'bronceador', 'paleta', 'iluminador', 'primer', 'fijador', 'cejas', 'pestanas', 'esponja', 'brocha', 'pincel', 'maquillaje'], reorder: 10 },
    { key: 'piel', label: 'cuidado de la piel', words: ['timewise', 'limpiador', 'limpiadora', 'crema', 'gel', 'protector solar', 'balsamo', 'parches', 'mascarilla', 'tonico', 'agua micelar', 'desmaquillante', 'suero', 'serum', 'exfoliante', 'microexfoliacion', 'skinvigorate', 'clear proof', 'botanical', 'contorno de ojos', 'repair', 'volu-firm', 'clinical solutions', 'facial', 'rutina'], reorder: 8 },
]
const OTHER: { key: string, label: string, words: string[], reorder: number } = { key: 'otros', label: 'tus productos', words: [], reorder: 10 }
const MOMENTS: Record<string, Array<{ key: string, label: string, from: string, to: string }>> = {
    '2026-11': [{ key: 'buen_fin', label: 'Buen Fin', from: '2026-11-13', to: '2026-11-17' }],
    '2026-12': [{ key: 'navidad', label: 'Navidad', from: '2026-12-01', to: '2026-12-24' }],
}

const category = (name: string) => {
    const plain = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    return CATEGORIES.find(cat => cat.words.some(word => plain.includes(word))) ?? OTHER
}
const short = (name: string) => name.replace(/\s*Mary Kay\s*®?/g, ' ').replace(/\s*de Edición (Especial|Limitada)/g, '').replace(/®/g, '').replace(/\s+/g, ' ').trim()
const money = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`
const count = (n: number, one: string, many: string) => `${Number.isInteger(n) ? n : n} ${n === 1 ? one : many}`
const monthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const range = (from: Date, to: Date) => from.getMonth() === to.getMonth()
    ? `del ${from.getDate()} al ${to.getDate()} de ${MONTHS[to.getMonth()]}`
    : `del ${from.getDate()} de ${MONTHS[from.getMonth()]} al ${to.getDate()} de ${MONTHS[to.getMonth()]}`

type Row = InventoryItem & { cat: typeof OTHER }

/**
 * La biblioteca de Astra de la demo (parte 4): qué productos ya tienen lámina. En la API se busca por nombre en
 * config/strategy_library.php; aquí por producto. Las imágenes de prueba están en ./laminas (con un logo de ejemplo).
 */
const LIBRARY: Record<string, string> = {
    '10216713': '08_cc_cream',
    '10045632': '02_locion_desmaquillante_ojos',
    '10195642': '03_if_you_believe',
    '10230518': '07_joy_emotion',
}
const COVERS: Record<string, string> = { buen_fin: '00_portada_buen_fin' }
const slideUrl = (key: string) => `${import.meta.env.VITE_API_URL}/consultant/strategy/images/${key}`

/** Como StrategyLibraryService::slides: el dúo lleva la portada del momento; si a un producto le falta, ninguna */
const slidesFor = (piece: StrategyPiece, moment: StrategyMoment | null) => {
    const keys: string[] = []
    if (piece.key === 'duo' && moment && COVERS[moment.key]) keys.push(COVERS[moment.key])
    for (const item of piece.products) {
        const key = LIBRARY[item.sku]
        if (!key) return []
        keys.push(key)
    }
    return keys.map(key => ({ key, url: slideUrl(key) }))
}

const product = (item: Row): StrategyProduct => ({ sku: item.sku, name: short(item.name), shade: item.shade, price: item.price, on_hand: item.on_hand, category: item.cat.key })

const single = (key: StrategyPiece['key'], tag: string, item: Row, phrase: string): StrategyPiece => {
    const title = short(item.name) + (item.shade ? ` · ${item.shade}` : '')
    return { key, tag, title, products: [product(item)], normal_price: item.price, promo_price: null, profit: item.profit_per_unit, message: `¡Hola! ${phrase}: ${title}. Cuesta ${money(item.price)}. ¿Te lo aparto?` }
}

const duo = (a: Row, b: Row, moment: StrategyMoment | null, level: StrategyLevel): StrategyPiece => {
    const names = `${short(a.name)} + ${short(b.name)}`
    const normal = a.price + b.price
    const cost = a.unit_cost !== null && b.unit_cost !== null ? a.unit_cost + b.unit_cost : null
    let promo: number | null = null
    if (cost !== null && level.level >= 40) {
        const candidate = Math.floor((normal * 0.92) / 10) * 10 - 1
        if (candidate > 0 && (candidate - cost) / candidate >= 0.3) promo = candidate
    }
    const price = promo ?? normal
    return {
        key: 'duo', tag: moment?.label ?? 'Dúo del mes', title: `Dúo ${names}`, products: [product(a), product(b)], normal_price: normal, promo_price: promo,
        profit: cost !== null ? r2(price - cost) : null,
        message: moment && promo
            ? `¡Hola! Por el ${moment.label} te aparté el dúo ${names} a ${money(promo)} (normal ${money(normal)}), ${moment.dates}. ¿Te lo guardo?`
            : `¡Hola! Tengo el dúo ${names} por ${money(price)}. ¿Te lo aparto?`,
    }
}

const buildStrategy = (inventory: ConsultantInventory, sales: CustomerSale[], level: StrategyLevel, firstOrderDays: number | null): ConsultantStrategy => {
    const today = new Date()
    const stock: Row[] = inventory.items.filter(item => item.on_hand > 0).map(item => ({ ...item, cat: category(item.name) }))
    const value = (item: Row) => item.price * item.on_hand

    const units = stock.reduce((s, i) => s + i.on_hand, 0)
    const total = stock.reduce((s, i) => s + value(i), 0)
    const segment = !stock.length ? 'empty' : units >= 40 || total >= 10000 ? 'big' : firstOrderDays !== null && firstOrderDays <= 60 ? 'start' : 'medium'

    const byCat = new Map<string, { key: string, label: string, value: number }>()
    stock.forEach(item => { const cur = byCat.get(item.cat.key) ?? { key: item.cat.key, label: item.cat.label, value: 0 }; cur.value += value(item); byCat.set(item.cat.key, cur) })
    const focus = [...byCat.values()].sort((a, b) => b.value - a.value)[0] ?? null

    const byValue = [...stock].sort((a, b) => value(b) - value(a))
    const priority = byValue.find(item => item.stale) ?? byValue[0] ?? null

    let moment: StrategyMoment | null = null
    for (const month of [today, new Date(today.getFullYear(), today.getMonth() + 1, 1)]) {
        for (const m of MOMENTS[monthKey(month)] ?? []) {
            const from = parseDay(m.from), to = parseDay(m.to)
            if (!moment && to.getTime() + DAY > today.getTime() && from.getTime() <= today.getTime() + 31 * DAY) {
                moment = { key: m.key, label: m.label, from: m.from, to: m.to, dates: range(from, to), active: from <= today }
            }
        }
    }

    const pieces: StrategyPiece[] = []
    if (priority) {
        pieces.push(single('ahora', 'Para entrega inmediata', priority, 'Lo tengo para entrega inmediata'))
        const used = [short(priority.name)]
        const lead = byValue[0]
        const byUnits = [...stock].sort((a, b) => b.on_hand - a.on_hand || a.price - b.price)
        const partner = byUnits.find(item => item.cat.key !== lead.cat.key) ?? byUnits.find(item => short(item.name) !== short(lead.name))
        if (partner) {
            pieces.push(duo(lead, partner, moment, level))
            used.push(short(lead.name), short(partner.name))
        }
        const gift = [11, 12].includes(today.getMonth() + 1) ? byValue.find(item => item.cat.key === 'fragancia') : undefined
        const third = gift ?? byValue.find(item => !used.includes(short(item.name)))
        if (third) pieces.push(gift ? single('regalo', 'Regalo de Navidad', gift, 'Ya estoy apartando regalos de Navidad, tengo') : single('tambien', 'Disponible', third, 'Tengo disponible'))
    }

    const summary = inventory.summary
    const diagnosis = segment === 'empty'
        ? 'Todavía no veo productos en tu inventario. Cuando llegue tu próximo pedido, aquí te digo cómo venderlo; si tienes producto guardado, agrégalo en «Tu inventario».'
        : [
            priority?.stale ? `Lo primero: ${short(priority.name)}${priority.shade ? ` (${priority.shade})` : ''} lleva ${priority.days_stored} días guardado.` : null,
            `En todo tu inventario tienes ${count(summary.units, 'pieza', 'piezas')}, ${money(summary.catalog_value)} a precio de clienta${summary.profit > 0 ? `: si lo vendes todo, ganas ${money(summary.profit)}.` : '.'}`,
            segment === 'start' ? 'Tu meta #1 es recuperar lo que invertiste antes de pensar en el siguiente pedido.' : null,
        ].filter(Boolean).join(' ')

    const month = MONTHS[today.getMonth()]
    const nextMonth = MONTHS[(today.getMonth() + 1) % 12]
    const levelLine = level.kept > level.earned
        ? `Este mes compras al ${level.kept} % por lo que ganaste el mes pasado.`
        : level.next
            ? `Te faltan ${money(level.next.missing)} en tu orden de ${month} (sin IVA) para ganar el ${level.next.level} %.${level.keeps_next_month && level.earned > 0 ? ` El ${level.earned} % que ya ganaste lo conservas en ${nextMonth}.` : ''}`
            : level.earned === 50 ? `Ya ganaste el 50 % este mes: pide sólo lo que te vayan pidiendo.${level.keeps_next_month ? ` Lo conservas en ${nextMonth}.` : ''}` : null

    const plan: StrategyStep[] = []
    if (segment === 'empty') {
        plan.push({ text: 'Revisa «Tu inventario»: si tienes producto guardado que no sale en tus pedidos, agrégalo.', piece: null })
        plan.push({ text: 'Registra a tus clientas en Mis Clientas: así te aviso cuándo volver a ofrecerles.', piece: null })
    } else if (segment === 'start') {
        plan.push({ text: `Escríbeles a 10 personas cercanas y mándales «${pieces[0].title}»: con 3 que te compren empiezas a recuperar lo que invertiste.`, piece: 'ahora' })
        plan.push({ text: 'Cada vez que vendas, anótalo con «Ya me compró»: así sabes cuánto llevas ganado y a quién volver a ofrecerle.', piece: null })
    } else {
        const first = pieces[0]
        const item = stock.find(i => i.sku === first.products[0].sku)
        plan.push({ text: `Esta semana ofrece ${first.title} a tus clientas de ${item?.cat.label ?? 'siempre'}: tienes ${count(item?.on_hand ?? 0, 'pieza', 'piezas')}${first.profit !== null ? ` y te deja ${money(first.profit)} cada una.` : '.'}`, piece: 'ahora' })
        const d = pieces.find(p => p.key === 'duo')
        if (d) {
            const price = d.promo_price ? ` a ${money(d.promo_price)}` : ''
            plan.push({ text: moment ? `${moment.dates.charAt(0).toUpperCase()}${moment.dates.slice(1)} (${moment.label}): el ${d.title}${price}.` : `Ofrece el ${d.title}${price} a quien te compre uno de los dos.`, piece: 'duo' })
        }
    }
    if (levelLine) plan.push({ text: levelLine, piece: null })

    const seen = new Set<string>()
    const reminders = [...sales]
        .sort((a, b) => String(b.sold_at).localeCompare(String(a.sold_at)))
        .filter(sale => { const k = sale.client_customer_id ?? `nombre:${sale.customer_name.toLowerCase()}`; if (seen.has(k)) return false; seen.add(k); return true })
        .flatMap(sale => {
            const weeks = Math.floor((Date.now() - new Date(String(sale.sold_at)).getTime()) / (7 * DAY))
            const due = Math.min(...sale.items.map(item => category(item.name).reorder))
            if (!sale.items.length || weeks < due) return []
            const productName = short(sale.items[0].name)
            return [{ client_customer_id: sale.client_customer_id, customer_name: sale.customer_name, product: productName, sold_at: String(sale.sold_at).slice(0, 10), weeks, message: `¡Hola, ${sale.customer_name.trim().split(' ')[0]}! ¿Cómo te ha ido con ${productName}? Ya debe estar por acabarse: tengo para entrega inmediata.` }]
        })
        .sort((a, b) => b.weeks - a.weeks)
        .slice(0, 5)

    return {
        month,
        segment,
        headline: segment === 'empty' ? 'Arma tu inventario' : segment === 'start' ? 'Recupera tu inversión' : `Enfócate en ${focus?.label ?? 'tus productos'}`,
        focus: focus ? { key: focus.key, label: focus.label } : null,
        diagnosis,
        level,
        moment,
        plan,
        pieces: pieces.map(piece => ({ ...piece, slides: slidesFor(piece, moment) })),
        reminders,
        inventory: { summary: inventory.summary, reviewed: inventory.reviewed, last_order: inventory.last_order },
    }
}

// ---------- «Tu inventario»: la pieza de cada producto y la lista de Mary Kay ----------

const plainName = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()

/** Como StrategyLibraryService::normalize: sin «Mary Kay», sin el «Tono …» que escriben a mano y sin el tono entre paréntesis */
const libraryName = (name: string) => plainName(short(name).replace(/^(\S+(?:\s+\S+)+?)\s+tono\s+.+$/iu, '$1').replace(/\s*\([^)]*\)\s*$/u, ''))

/** Los productos de LIBRARY por nombre: lo agregado a mano (con o sin clave) encuentra su imagen igual que en la API */
const LIBRARY_BY_NAME: Record<string, string> = {
    [libraryName('CC Cream Crema Correctora de Color FPS 15')]: '08_cc_cream',
    [libraryName('Loción Desmaquillante de Ojos Libre de Aceite')]: '02_locion_desmaquillante_ojos',
    [libraryName('Mary Kay If You Believe® Eau de Toilette')]: '03_if_you_believe',
    [libraryName('Mary Kay Joy Emotion Scent® Eau de Parfum')]: '07_joy_emotion',
}
const libraryKey = (sku: string, name: string) => LIBRARY[sku] ?? LIBRARY_BY_NAME[libraryName(name)] ?? null

/** Como ConsultantInventoryService::piece: su lámina con el logo y «Lo tengo para entrega inmediata…»; null sin imagen */
const pieceFor = (item: { sku: string, name: string, shade: string | null }, price: number): InventoryPiece | null => {
    const key = libraryKey(item.sku, item.name)
    if (!key) return null
    const title = short(item.name) + (item.shade ? ` · ${item.shade}` : '')
    return {
        slides: [{ key, url: slideUrl(key) }],
        message: `¡Hola! Lo tengo para entrega inmediata: ${title}.${price > 0 ? ` Cuesta ${money(price)}.` : ''} ¿Te lo aparto?`,
    }
}

/**
 * La lista de mentira de `consultant/inventory/catalog` (en la API sale de lo pedido en su país en 6 meses): nombre
 * corto, tono, precio de lista con IVA y cuántas veces se pidió (para ordenar). Las claves de Lupita son las mismas.
 */
const CATALOG: Array<{ sku: string, name: string, shade: string | null, price: number | null, total: number }> = [
    { sku: '10216713', name: 'CC Cream Crema Correctora de Color FPS 15', shade: 'Light to Medium', price: 404, total: 412 },
    { sku: '10216709', name: 'CC Cream Crema Correctora de Color FPS 15', shade: 'Medium to Deep', price: 404, total: 288 },
    { sku: '10216705', name: 'CC Cream Crema Correctora de Color FPS 15', shade: 'Very Light', price: 404, total: 141 },
    { sku: '10045632', name: 'Loción Desmaquillante de Ojos Libre de Aceite', shade: null, price: 414, total: 530 },
    { sku: '10195642', name: 'If You Believe Eau de Toilette', shade: null, price: 664, total: 205 },
    { sku: '10230518', name: 'Joy Emotion Scent Eau de Parfum', shade: null, price: 544, total: 176 },
    { sku: '10241155', name: 'Velvet Scent Eau de Parfum', shade: null, price: 523, total: 98 },
    { sku: '10236911', name: 'Agua Micelar', shade: null, price: 394, total: 377 },
    { sku: '10229031', name: 'Tónico Balanceador', shade: null, price: 319, total: 154 },
    { sku: '10207045', name: 'Base de Maquillaje TimeWise 3D', shade: 'Ivory C 110', price: 389, total: 233 },
    { sku: '10207052', name: 'Base de Maquillaje TimeWise 3D', shade: 'Beige N 150', price: 389, total: 199 },
    { sku: '10207068', name: 'Base de Maquillaje TimeWise 3D', shade: 'Bronze W 200', price: 389, total: 87 },
    { sku: '10224187', name: 'Sombra Mate para Ojos en Barra', shade: 'Smoky Quartz', price: 254, total: 121 },
    { sku: '10180326', name: 'Crema para Manos Satin Hands Libre de Fragancia', shade: null, price: 244, total: 309 },
    { sku: '10252210', name: 'Labial Líquido Mate At Play', shade: 'Red My Mind', price: 299, total: 64 },
    { sku: '10252226', name: 'Labial Líquido Mate At Play', shade: 'Mauve Mood', price: 299, total: 58 },
    { sku: '10252232', name: 'Labial Líquido Mate At Play', shade: 'Nude Attitude', price: 299, total: 71 },
    { sku: '10252248', name: 'Labial Líquido Mate At Play', shade: 'Pink Pow', price: 299, total: 40 },
    { sku: '10219874', name: 'Gel Limpiador TimeWise 4 en 1', shade: null, price: 459, total: 266 },
    { sku: '10219890', name: 'Crema de Noche TimeWise', shade: null, price: 589, total: 190 },
    { sku: '10219882', name: 'Crema de Día TimeWise FPS 30', shade: null, price: 589, total: 184 },
    { sku: '10233417', name: 'Máscara para Pestañas Lash Love', shade: null, price: 329, total: 150 },
    { sku: '10228650', name: 'Protector Solar FPS 50', shade: null, price: 409, total: 92 },
    { sku: '10240034', name: 'Bálsamo Labial Satin Lips', shade: null, price: 199, total: 133 },
    { sku: '10247719', name: 'Mascarilla Purificante de Carbón Clear Proof', shade: null, price: null, total: 22 },
    { sku: '10198731', name: 'Limpiador Botanical Effects', shade: null, price: 279, total: 118 },
    { sku: '10198747', name: 'Crema Hidratante Botanical Effects', shade: null, price: 299, total: 104 },
    { sku: '10211583', name: 'Gel Limpiador Clarificante Clear Proof', shade: null, price: 329, total: 97 },
    { sku: '10226654', name: 'Set de Microexfoliación Renovadora TimeWise', shade: null, price: 899, total: 143 },
    { sku: '10237120', name: 'Contorno de Ojos TimeWise Repair Volu-Firm', shade: null, price: 799, total: 61 },
    { sku: '10243305', name: 'Parches de Hidrogel para Contorno de Ojos', shade: null, price: 349, total: 88 },
    { sku: '10204412', name: 'Polvo Mineral Compacto', shade: 'Ivory 1', price: 349, total: 126 },
    { sku: '10204428', name: 'Polvo Mineral Compacto', shade: 'Beige 2', price: 349, total: 109 },
    { sku: '10210038', name: 'Corrector Perfeccionador', shade: 'Light Ivory', price: 279, total: 95 },
    { sku: '10209456', name: 'Rubor Chromafusion', shade: 'Shy Blush', price: 229, total: 77 },
    { sku: '10213307', name: 'Delineador de Ojos', shade: 'Black', price: 219, total: 102 },
    { sku: '10239915', name: 'Lápiz Labial Supreme', shade: 'Berry Couture', price: 349, total: 69 },
    { sku: '10231102', name: 'Brillo Labial Unlimited', shade: 'Pink Luster', price: 259, total: 74 },
    { sku: '10222876', name: 'Primer Facial TimeWise', shade: null, price: 379, total: 58 },
    { sku: '10225541', name: 'Polvo Suelto Traslúcido', shade: null, price: 329, total: 83 },
    { sku: '10232064', name: 'Thinking of You Eau de Parfum', shade: null, price: 589, total: 91 },
    { sku: '10227713', name: 'Cityscape Eau de Parfum', shade: null, price: 619, total: 57 },
    { sku: '10234480', name: 'True Original Eau de Toilette para Él', shade: null, price: 569, total: 49 },
    { sku: '10236655', name: 'Loción Corporal Satin Body', shade: null, price: 289, total: 66 },
    { sku: '10180334', name: 'Juego Suavizante de Manos Satin Hands', shade: null, price: 763, total: 112 },
]

const catalogProduct = (row: typeof CATALOG[number]): CatalogProduct => ({
    sku: row.sku, name: row.name, shade: row.shade, price: row.price, has_image: !!libraryKey(row.sku, row.name), category: category(row.name).key,
})

/**
 * Como ConsultantInventoryService::searchCatalog: con texto, todas las palabras (de 2 letras o más), primero lo que
 * empieza igual (15); sin texto, lo más pedido (40), de todo o de una categoría.
 */
const searchCatalog = (query: string, categoryKey: string | null): CatalogProduct[] => {
    const words = plainName(query).split(' ').filter(word => word.length >= 2)
    const inCategory = CATALOG.filter(row => !categoryKey || category(row.name).key === categoryKey)
    if (!words.length) return [...inCategory].sort((a, b) => b.total - a.total).slice(0, 40).map(catalogProduct)
    return inCategory
        .filter(row => words.every(word => plainName(`${row.name} ${row.shade ?? ''}`).includes(word)))
        .sort((a, b) => Number(plainName(b.name).startsWith(words[0])) - Number(plainName(a.name).startsWith(words[0])) || b.total - a.total)
        .slice(0, 15)
        .map(catalogProduct)
}

// ---------- «Para tu próximo pedido» (ConsultantInventoryService::nextOrder) ----------

const COVER_WEEKS = 4
const MIN_WEEKS = 4

/**
 * Lo que salió de cada producto (lo comprado y lo agregado, menos lo que le queda) entre las semanas desde que lo tiene
 * (mínimo 4) da cuántas salen por semana; se pide lo que falta para cubrir 4 semanas. Se le acabó → «out»; no le alcanza
 * → «low». Lo agotado primero (lo que más sale arriba) y luego lo que le dura menos.
 */
const nextOrderOf = (stock: Stock[]): NextOrder => {
    const lines: NextOrderLine[] = []
    let signal = false
    for (const item of stock) {
        const onHand = Math.max(r2(item.on_hand), 0)
        const out = r2(item.purchased + item.added - onHand)
        if (out < 1) continue
        signal = true
        const weekly = out / Math.max(MIN_WEEKS, daysSince(item.oldest_unit_at) / 7)
        const need = Math.max(1, Math.ceil(weekly * COVER_WEEKS - 0.2))
        if (onHand >= need) continue
        lines.push({
            sku: item.sku, name: short(item.name).replace(/\s+Tono\s+.+$/u, ''), shade: item.shade ?? (item.name.match(/\s+Tono\s+(.+)$/u)?.[1] ?? null),
            reason: onHand <= 0 ? 'out' : 'low', on_hand: onHand, monthly: Math.round(weekly * 4.35 * 10) / 10,
            weeks_left: onHand > 0 ? Math.round((onHand / weekly) * 10) / 10 : null, suggested: Math.ceil(need - onHand),
            price: item.price, unit_cost: item.unit_cost, manual_name: item.sku.startsWith('M-'),
        })
    }
    lines.sort((a, b) => Number(b.reason === 'out') - Number(a.reason === 'out') || (a.reason === 'out' ? b.monthly - a.monthly : (a.weeks_left ?? 0) - (b.weeks_left ?? 0)))
    return { has_signal: signal, cover_weeks: COVER_WEEKS, lines: lines.slice(0, 12) }
}

// ---------- «Mándale cómo usarlo» (StrategyLibraryService::howToFor) ----------

/** 3 de las 9 piezas «Cómo usarlo» de Astra (lote 2, v2): sus láminas de prueba están en ./laminas */
const HOWTO_LIBRARY = [
    { key: 'u02_como_usar_desmaquillante', match: 'locion desmaquillante de ojos', title: 'Loción Desmaquillante de Ojos' },
    { key: 'u04_como_usar_base_timewise_3d', match: 'base de maquillaje timewise 3d', title: 'Base TimeWise 3D' },
    { key: 'u07_como_usar_joy_emotion', match: 'joy emotion', title: 'Joy Emotion' },
]
const plainText = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[®™]/g, '').toLowerCase()

/** Las láminas de cómo usar lo que se llevó y el mensaje para la clienta, o null si ninguno tiene pieza */
const howToFor = (names: string[], customerName: string) => {
    // En el orden de la venta y sin repetir, como la API
    const found = names
        .map(name => HOWTO_LIBRARY.find(item => plainText(name).includes(item.match)))
        .filter((item, index, all): item is typeof HOWTO_LIBRARY[number] => !!item && all.findIndex(other => other?.key === item.key) === index)
    if (!found.length) return null
    const titles = found.map(item => `tu ${item.title}`)
    const list = titles.length > 1 ? `${titles.slice(0, -1).join(', ')} y ${titles[titles.length - 1]}` : titles[0]
    const first = customerName.trim().split(/\s+/)[0] ?? ''
    return {
        slides: found.map(item => ({ key: item.key, url: `/consultant/strategy/images/${item.key}` })),
        message: `${first ? `¡Hola, ${first}!` : '¡Hola!'} Te mando cómo usar ${list} para que le saques todo el provecho. Cualquier duda, escríbeme.`,
    }
}
const withHowTo = (sale: CustomerSale): CustomerSale => ({ ...sale, howto: howToFor(sale.items.map(item => item.name), sale.customer_name) })

// ---------- La API de mentira ----------

type Reply = { status: number, data: unknown, message?: string }

/**
 * Contesta `consultant/strategy`, `consultant/inventory*` y `consultant/sales*`. `customerName` sale de sus clientas de
 * Mis Clientas; `onCustomerSaved` agrega a Mis Clientas la que se guarda con «+ Otra».
 */
export const createStrategyDemo = (options: {
    customerName: (id: string) => string | null
    onCustomerSaved: (name: string) => string
    /** El tope de clientas de su plan (las gratis); sin él, no hay tope */
    customersMax?: number | null
    customersCount?: () => number
}) => {
    const variant = sessionStorage.getItem('cuentas:inventario') ?? ''
    const start = variant === 'empieza'
    const byHand = variant === 'a-mano'
    let stock: Stock[] = variant === 'vacio' ? [] : byHand ? seedByHand() : start ? seedStart() : seedBig()
    if (variant === 'revisado') stock = [...stock.map(item => ({ ...item, reviewed: true })), { ...row('M-7QK2D9XA', 'Mascarilla de carbón (de un pedido viejo)', null, 0, 1, 0, null, dateOnly(2)), manual: true, last_purchased_at: null, reviewed: true }]
    let sales: CustomerSale[] = variant === 'vacio' || start || byHand ? [] : seedSales(options.customerName)
    const lastOrder = variant === 'vacio' || byHand ? null : { number: '19876543', date: dateOnly(start ? 20 : LAST_ORDER_DAYS) }
    const level: StrategyLevel = start
        ? { month: monthKey(new Date()), accumulated: 1702.59, earned: 35, kept: 0, kept_from: null, level: 35, next: { level: 40, from: 3600, missing: r2(3600 - 1702.59) }, keeps_next_month: true }
        : { month: monthKey(new Date()), accumulated: variant === 'vacio' ? 0 : 15855.17, earned: variant === 'vacio' ? 0 : 50, kept: 0, kept_from: null, level: variant === 'vacio' ? 0 : 50, next: variant === 'vacio' ? { level: 35, from: 1200, missing: 1200 } : null, keeps_next_month: true }

    const toRow = (item: Stock, reorder: Set<string>): InventoryItem => {
        const onHand = Math.max(r2(item.on_hand), 0)
        const days = onHand > 0 ? daysSince(item.oldest_unit_at) : 0
        return {
            sku: item.sku, name: item.name, shade: item.shade, manual: item.manual, is_ordena_ya: item.is_ordena_ya, purchased: item.purchased,
            on_hand: onHand, price: item.price, unit_cost: item.unit_cost, profit_per_unit: item.unit_cost !== null ? r2(item.price - item.unit_cost) : null,
            last_purchased_at: item.last_purchased_at, oldest_unit_at: onHand > 0 ? item.oldest_unit_at : null, days_stored: days,
            // Lo que hay que volver a pedir se está vendiendo: no es «Muévelo primero» aunque su pieza sea vieja
            stale: onHand > 0 && days >= STALE_DAYS && !reorder.has(item.sku), reviewed: item.reviewed, piece: pieceFor(item, item.price),
            category: { key: category(item.name).key, label: category(item.name).label },
        }
    }
    const inventory = (): ConsultantInventory => {
        const nextOrder = nextOrderOf(stock)
        const reorder = new Set(nextOrder.lines.map(line => line.sku))
        const rows = stock.map(item => toRow(item, reorder)).sort((a, b) => Number(b.on_hand > 0) - Number(a.on_hand > 0) || b.days_stored - a.days_stored || a.name.localeCompare(b.name))
        const inStock = rows.filter(i => i.on_hand > 0)
        const costed = inStock.filter(i => i.unit_cost !== null)
        return {
            country: 'MEX', reviewed: stock.some(i => i.reviewed), lookback_months: 6, last_order: lastOrder,
            summary: {
                products: inStock.length, units: r2(inStock.reduce((s, i) => s + i.on_hand, 0)), stale: inStock.filter(i => i.stale).length,
                catalog_value: r2(inStock.reduce((s, i) => s + i.price * i.on_hand, 0)), cost: r2(costed.reduce((s, i) => s + (i.unit_cost ?? 0) * i.on_hand, 0)),
                profit: r2(costed.reduce((s, i) => s + (i.profit_per_unit ?? 0) * i.on_hand, 0)), without_cost: inStock.length - costed.length,
            },
            items: rows,
            next_order: nextOrder,
        }
    }

    /** Un producto que agrega ella (como ConsultantInventoryService::addManual): si ya lo tiene, se le suma */
    const addOne = (body: Record<string, unknown>) => {
        const sku = String(body.sku ?? '').trim() || `M-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
        const existing = stock.find(item => item.sku === sku)
        const quantity = Number(body.quantity ?? 0)
        if (existing) {
            existing.on_hand += quantity
            existing.added += quantity
        } else stock.push(manualRow(sku, String(body.name ?? '').trim(), quantity, quantity, body.price ? Math.round(Number(body.price)) : 0, 0))
    }

    const ok = (data: unknown): Reply => ({ status: 200, data })
    const fail = (message: string, status = 500): Reply => ({ status, data: null, message })

    return (method: string, path: string, query: URLSearchParams, body: Record<string, unknown>): Reply | null => {
        if (!path.startsWith('/consultant/inventory') && !path.startsWith('/consultant/sales') && path !== '/consultant/strategy') return null
        if (variant === 'sin-ligar') return fail('Tu cuenta no está ligada a tu número de consultora')

        if (path === '/consultant/strategy') return ok(buildStrategy(inventory(), sales, level, lastOrder ? daysSince(lastOrder.date) : null))
        if (path === '/consultant/inventory' && method === 'GET') return ok(inventory())
        if (path === '/consultant/inventory/review' && method === 'POST') {
            stock = stock.map(item => ({ ...item, reviewed: true }))
            return ok(inventory())
        }
        if (path === '/consultant/inventory/catalog' && method === 'GET') {
            const q = (query.get('q') ?? '').trim()
            if (q.length === 1) return fail('El campo q debe contener al menos 2 caracteres.', 422)
            return ok(searchCatalog(q, query.get('category')))
        }
        if (path === '/consultant/inventory/items' && method === 'POST') {
            addOne(body)
            return ok(inventory())
        }
        if (path === '/consultant/inventory/items/batch' && method === 'POST') {
            const items = Array.isArray(body.items) ? body.items as Array<Record<string, unknown>> : []
            if (!items.length) return fail('Escoge al menos un producto.', 422)
            items.forEach(addOne)
            return ok(inventory())
        }
        const itemMatch = path.match(/^\/consultant\/inventory\/items\/(.+)$/)
        if (itemMatch && method === 'PATCH') {
            const item = stock.find(r => r.sku === decodeURIComponent(itemMatch[1]))
            if (!item) return fail('No query results for model [App\\Models\\InventoryItem].')
            if (body.price !== undefined) {
                if (!item.manual || item.purchased > 0) return fail('Este precio viene de tu pedido de Mary Kay. Si lo vendes a otro precio, ponlo al anotar «Ya me compró».', 422)
                item.price = Number(body.price)
            }
            if (body.on_hand !== undefined) item.on_hand = Number(body.on_hand)
            item.reviewed = true
            return ok(inventory())
        }
        if (path === '/consultant/sales' && method === 'GET') {
            const customer = query.get('client_customer_id')
            const perPage = Number(query.get('perPage') ?? 20)
            const mine = sales.filter(sale => !customer || sale.client_customer_id === customer).sort((a, b) => String(b.sold_at).localeCompare(String(a.sold_at)))
            return ok({ current_page: 1, items: mine.slice(0, perPage).map(withHowTo), per_page: perPage, total_items: mine.length, last_page: Math.max(1, Math.ceil(mine.length / perPage)), is_last_page: mine.length <= perPage })
        }
        if (path === '/consultant/sales' && method === 'POST') {
            let customerId = (body.client_customer_id as string | undefined) ?? null
            const name = customerId ? options.customerName(customerId) : String(body.customer_name ?? '').trim()
            if (customerId && !name) return fail('No query results for model [App\\Models\\ClientCustomer].')
            if (!name) return fail('Falta a quién le vendiste')
            if (!customerId && body.save_customer) {
                if (options.customersMax && options.customersCount && options.customersCount() >= options.customersMax) return fail('PLAN_LIMIT_CUSTOMERS')
                customerId = options.onCustomerSaved(name)
            }
            const items = (body.items as Array<{ sku?: string, name?: string, quantity: number, unit_price?: number }>).map(item => ({
                sku: item.sku ?? null, name: item.name?.trim() || stock.find(r => r.sku === item.sku)?.name || 'Producto', quantity: Number(item.quantity), unit_price: Number(item.unit_price ?? 0),
            }))
            // Como la API: sólo baja lo que está en su inventario
            items.forEach(item => { const found = item.sku ? stock.find(r => r.sku === item.sku) : null; if (found) found.on_hand -= item.quantity })
            const sale: CustomerSale = {
                id: `venta-${Date.now()}`, client_customer_id: customerId, customer_name: name, total: Number(body.total ?? items.reduce((s, i) => s + i.quantity * i.unit_price, 0)),
                sold_at: new Date().toISOString(), source: String(body.source ?? 'app'), note: (body.note as string | undefined) ?? null, items,
            }
            sales = [sale, ...sales]
            return ok(withHowTo(sale))
        }
        const saleMatch = path.match(/^\/consultant\/sales\/([^/]+)$/)
        if (saleMatch && method === 'DELETE') {
            const sale = sales.find(r => r.id === saleMatch[1])
            if (!sale) return fail('No query results for model [App\\Models\\CustomerSale].')
            sale.items.forEach(item => { const found = item.sku ? stock.find(r => r.sku === item.sku) : null; if (found) found.on_hand += item.quantity })
            sales = sales.filter(r => r.id !== sale.id)
            return ok(true)
        }
        return fail('Ruta de «Tu estrategia» no prevista en el simulador', 404)
    }
}
