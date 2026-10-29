// SÓLO DEV: «Tu estrategia», «Tu inventario» y «Ya me compró» de la consultora demo, con la forma EXACTA de la API en
// producción (ConsultantInventoryService, CustomerSaleService y ConsultantStrategyService; API fe0b83c y 98f96df, 27-oct-2026).
// La estrategia se arma con las MISMAS reglas que la API (config/strategy.php), así que reacciona a lo que ella vende o corrige.
// Perfiles: el de siempre es «Lupita» del prototipo (compra grande al 50 %, perfumes de septiembre guardados, CC Cream del
// Ordena Ya). Variantes: ?inventario=empieza (va empezando, al 35 %) | vacio | revisado | sin-ligar
import type { ConsultantInventory, CustomerSale, InventoryItem } from '@/interfaces/inventory'
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
}

const LAST_ORDER_DAYS = 13
const OLDER_ORDER_DAYS = 42

const row = (sku: string, name: string, shade: string | null, purchased: number, onHand: number, price: number, cost: number | null, when: string, ordenaYa = false): Stock => ({
    sku, name, shade, manual: false, is_ordena_ya: ordenaYa, purchased, on_hand: onHand, price, unit_cost: cost,
    last_purchased_at: when, oldest_unit_at: when, reviewed: false,
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
    ]
}

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
    { key: 'fragancia', label: 'fragancias', words: ['eau de parfum', 'eau de toilette', 'extrait de parfum', 'perfume', 'fragancia', 'body mist'], reorder: 16 },
    { key: 'cuerpo', label: 'cuidado del cuerpo', words: ['satin hands', 'satin lips', 'locion corporal', 'crema para manos', 'corporal', 'cuerpo'], reorder: 8 },
    { key: 'maquillaje', label: 'maquillaje', words: ['base', 'cc cream', 'corrector', 'polvo', 'rubor', 'sombra', 'delineador', 'labial', 'brillo', 'mascara para pestanas', 'rimel', 'lapiz', 'bronceador', 'paleta', 'iluminador', 'primer', 'fijador', 'cejas', 'pestanas', 'esponja', 'brocha', 'pincel', 'maquillaje'], reorder: 10 },
    { key: 'piel', label: 'cuidado de la piel', words: ['timewise', 'limpiador', 'limpiadora', 'crema', 'gel', 'protector solar', 'balsamo', 'parches', 'mascarilla', 'tonico', 'agua micelar', 'desmaquillante', 'suero', 'serum', 'exfoliante', 'microexfoliacion', 'skinvigorate', 'clear proof', 'botanical', 'contorno de ojos', 'repair', 'volu-firm'], reorder: 8 },
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
            `Tienes ${count(summary.units, 'pieza', 'piezas')}, ${money(summary.catalog_value)} a precio de clienta${summary.profit > 0 ? `: si lo vendes todo, ganas ${money(summary.profit)}.` : '.'}`,
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
    let stock: Stock[] = variant === 'vacio' ? [] : start ? seedStart() : seedBig()
    if (variant === 'revisado') stock = [...stock.map(item => ({ ...item, reviewed: true })), { ...row('M-7QK2D9XA', 'Mascarilla de carbón (de un pedido viejo)', null, 0, 1, 0, null, dateOnly(2)), manual: true, last_purchased_at: null, reviewed: true }]
    let sales: CustomerSale[] = variant === 'vacio' || start ? [] : seedSales(options.customerName)
    const lastOrder = variant === 'vacio' ? null : { number: '19876543', date: dateOnly(start ? 20 : LAST_ORDER_DAYS) }
    const level: StrategyLevel = start
        ? { month: monthKey(new Date()), accumulated: 1702.59, earned: 35, kept: 0, kept_from: null, level: 35, next: { level: 40, from: 3600, missing: r2(3600 - 1702.59) }, keeps_next_month: true }
        : { month: monthKey(new Date()), accumulated: variant === 'vacio' ? 0 : 15855.17, earned: variant === 'vacio' ? 0 : 50, kept: 0, kept_from: null, level: variant === 'vacio' ? 0 : 50, next: variant === 'vacio' ? { level: 35, from: 1200, missing: 1200 } : null, keeps_next_month: true }

    const toRow = (item: Stock): InventoryItem => {
        const onHand = Math.max(r2(item.on_hand), 0)
        const days = onHand > 0 ? daysSince(item.oldest_unit_at) : 0
        return {
            sku: item.sku, name: item.name, shade: item.shade, manual: item.manual, is_ordena_ya: item.is_ordena_ya, purchased: item.purchased,
            on_hand: onHand, price: item.price, unit_cost: item.unit_cost, profit_per_unit: item.unit_cost !== null ? r2(item.price - item.unit_cost) : null,
            last_purchased_at: item.last_purchased_at, oldest_unit_at: onHand > 0 ? item.oldest_unit_at : null, days_stored: days,
            stale: onHand > 0 && days >= STALE_DAYS, reviewed: item.reviewed,
        }
    }
    const inventory = (): ConsultantInventory => {
        const rows = stock.map(toRow).sort((a, b) => Number(b.on_hand > 0) - Number(a.on_hand > 0) || b.days_stored - a.days_stored || a.name.localeCompare(b.name))
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
        }
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
        if (path === '/consultant/inventory/items' && method === 'POST') {
            const sku = String(body.sku ?? '').trim() || `M-${Math.random().toString(36).slice(2, 10).toUpperCase()}`
            const existing = stock.find(item => item.sku === sku)
            const quantity = Number(body.quantity ?? 0)
            if (existing) existing.on_hand += quantity
            else stock.push({ ...row(sku, String(body.name ?? '').trim(), null, 0, quantity, body.price ? Math.round(Number(body.price)) : 0, null, dateOnly(0)), manual: true, last_purchased_at: null, reviewed: true })
            return ok(inventory())
        }
        const itemMatch = path.match(/^\/consultant\/inventory\/items\/(.+)$/)
        if (itemMatch && method === 'PATCH') {
            const item = stock.find(r => r.sku === decodeURIComponent(itemMatch[1]))
            if (!item) return fail('No query results for model [App\\Models\\InventoryItem].')
            item.on_hand = Number(body.on_hand ?? 0)
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
