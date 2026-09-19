// SÓLO DEV: una API de mentira para recorrer la web ENTERA como cada plan real, sin sesión ni contraseñas.
// Es el mismo simulador que tiene la app (su `src/dev/cuentas`): los planes y el catálogo son copia de
// producción (19-sep-2026); la gente y las piezas son inventadas. No entra en el build.
import plans from './planes.json'
import utilData from './util-data.json'

export type DemoPlan = typeof plans[number]
export const PLANS: DemoPlan[] = plans

const PEOPLE = ['Ana Valadez Ángeles', 'Evangelina Caracheo', 'Andrea Gorgonio', 'María Elvia Aguilar', 'Rosa Luz Arteaga', 'Guadalupe García']
const now = new Date()
const iso = (daysAgo = 0) => new Date(now.getTime() - daysAgo * 86400000).toISOString()
const month = (back = 0) => { const d = new Date(now.getFullYear(), now.getMonth() - back, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01` }

/** Pieza de ejemplo: un SVG con el nombre de la sección y de la persona, en la proporción del artefacto. */
const piece = (title: string, subtitle: string, hue: number, ratio: '4:5' | '1:1' | '9:16' = '4:5') => {
    const h = ratio === '4:5' ? 1350 : ratio === '1:1' ? 1080 : 1920
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 ${h}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue},70%,45%)"/><stop offset="1" stop-color="hsl(${(hue + 60) % 360},75%,30%)"/></linearGradient></defs><rect width="1080" height="${h}" fill="url(#g)"/><circle cx="540" cy="${h * 0.36}" r="200" fill="rgba(255,255,255,.18)"/><text x="540" y="${h * 0.64}" font-family="Inter,Arial" font-size="74" font-weight="800" fill="#fff" text-anchor="middle">${title}</text><text x="540" y="${h * 0.64 + 86}" font-family="Inter,Arial" font-size="44" fill="rgba(255,255,255,.85)" text-anchor="middle">${subtitle}</text><text x="540" y="${h - 60}" font-family="Inter,Arial" font-size="30" fill="rgba(255,255,255,.6)" text-anchor="middle">PIEZA DE EJEMPLO</text></svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const file = (id: string, url: string, assetType: string | null = 'image') => ({ id, url, uri: `demo/${id}.svg`, name: `${id}.svg`, ext: 'svg', type: 'post', template_asset_type: assetType })

const hueOf = (text: string) => [...text].reduce((n, c) => (n * 31 + c.charCodeAt(0)) % 360, 7)

const labelOf = (plan: DemoPlan, section: string) => {
    for (const access of plan.accesses) {
        const found = (access.custom_permissions as Array<{ key: string, label: string }>).find(item => item.key === section)
        if (found) return found.label
    }
    return section
}

/**
 * Tres escenas distintas según la sección, para que el feed se parezca a un día de verdad: cumpleaños
 * con varias piezas HOY (una sin foto), Círculo Rosa con dos versiones por consultora, y el resto
 * como lote del cierre de hace unos días, con alguna ya enviada.
 */
const postsFor = (plan: DemoPlan, section: string): unknown[] => {
    const label = labelOf(plan, section)
    const isCustomer = section === 'customer_birthdays'
    const hue = hueOf(section)
    const base = (index: number, name: string) => ({
        title: `${label} · ${name}`,
        type: isCustomer ? 'my_clients' : 'newsletter',
        is_regenerating: false,
        metadata: null,
        vendorable: { id: `${isCustomer ? 'customer' : 'person'}-${index}`, name, type: isCustomer ? 'customer' : 'sponsored' },
        newsletter_section: null,
        version_key: null, version_label: null, version_group: null,
    })

    if (section.includes('birthdays')) {
        return PEOPLE.slice(0, 4).map((name, index) => ({
            ...base(index, name),
            id: `post-${section}-${index}`,
            created_at: iso(index < 3 ? 0 : 2),
            shared_at: index === 2 ? iso(0) : null,
            has_photo: index !== 1,
            files: [
                file(`post-${section}-${index}`, piece(label, name, hue)),
                file(`post-${section}-${index}-sq`, piece(label, name, hue, '1:1'), 'image_square'),
            ],
            newsletter_date: month(0),
            live_event_at: index < 3 ? iso(0) : iso(2),
        }))
    }

    if (section === 'pink_circle') {
        return PEOPLE.slice(0, 2).flatMap((name, index) => (['a', 'b'] as const).map(version => ({
            ...base(index, name),
            id: `post-${section}-${index}-${version}`,
            created_at: iso(0),
            shared_at: null,
            has_photo: true,
            files: [file(`post-${section}-${index}-${version}`, piece(version === 'a' ? label : `${label} · producto`, name, (hue + (version === 'b' ? 40 : 0)) % 360))],
            newsletter_date: month(0),
            live_event_at: iso(0),
            version_key: version,
            version_label: version === 'a' ? 'Sólo el logro' : 'Con el producto',
            version_group: `pc-${index}`,
        })))
    }

    return PEOPLE.slice(0, 3).map((name, index) => ({
        ...base(index, name),
        id: `post-${section}-${index}`,
        created_at: iso(3),
        shared_at: index === 2 ? iso(1) : null,
        has_photo: index !== 1,
        files: [file(`post-${section}-${index}`, piece(label, name, hue))],
        newsletter_date: month(1),
        live_event_at: null,
    }))
}

const TOOL_LABELS: Record<string, string> = { stay_informed: 'Entérate Ya', learn: 'Publicación', explain: 'Historia', products: 'Productos', proposals: 'Propuestas', get_started: 'Inicia' }
const toolsFor = (section: string) => [0, 1, 2].map(index => ({
    id: `tool-${section}-${index}`,
    title: `${TOOL_LABELS[section] ?? section} ${index + 1}`,
    description: 'Pieza de ejemplo de la biblioteca',
    section,
    created_at: iso(index),
    slug: `tool-${section}-${index}`,
    /* La primera es un carrusel de tres: así se prueba la barra por tramos del visor */
    files: (index === 0 ? [1, 2, 3] : [1]).map(n => file(
        `tool-${section}-${index}-${n}`,
        piece(TOOL_LABELS[section] ?? section, index === 0 ? `Lámina ${n} de 3` : `Novedad ${index + 1}`, (hueOf(section + 'tool') + n * 25) % 360, section === 'learn' ? '4:5' : '9:16'),
        null,
    )),
}))

const page = <T,>(items: T[]) => ({ items, current_page: 1, last_page: 1, per_page: items.length || 15, total_items: items.length, next_cursor: null })

const RANK_NAMES: Record<string, string> = { director: 'Directora', executive_director: 'Directora Ejecutiva', national_director: 'Directora Nacional', elite_director: 'Directora Élite', user_consultant: 'Consultora' }

const userFor = (plan: DemoPlan, role: 'director' | 'consultant', rank?: string | null) => ({
    id: 'demo-person', user_id: 'demo-user', email: 'demo@ejemplo.com',
    name: role === 'consultant' ? 'Carla Consultora Demo' : 'Mariana Directora Demo',
    profile_picture: null, country: 'MEX', phone: '4610000000', account: role === 'consultant' ? 'DEMOCONS' : 'DEMOTIENDA', gender: 'female',
    user_role: { name: 'Cliente', slug: 'client' },
    client_role: rank ? { name: RANK_NAMES[rank] ?? rank, slug: rank } : role === 'consultant' ? { name: 'Consultora', slug: 'user_consultant' } : { name: 'Directora', slug: 'director' },
    on_biometric_auth: false, on_notifications: true, logotype: null,
    plan: { id: plan.id, name: plan.name, features: plan.features, price: plan.price, color: plan.color, trial_days: 0, accesses: plan.accesses },
    canva_connected: false, template_id: null, unread_notifications_count: 2, trial_ends_at: null, on_trial: false,
})

const NO_ENFORCEMENT = { days_overdue: 0, show_reminder_popup: false, show_home_banner: false, show_global_banner: false, restricted_features: [], days_until_block: null, block_date: null, account_blocked: false, paused_reason: null }
const periodOf = (back = 0) => month(back).slice(0, 7)
const dayOfThisMonth = (day: number, monthsAhead = 0) => { const d = new Date(now.getFullYear(), now.getMonth() + monthsAhead, day); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }

/**
 * Cobro de ejemplo, manual y con el mes en curso por pagar (`&cobro=aldia` lo deja al corriente y
 * `&cobro=atrasado` con dos meses vencidos): así se ven el botón de comprobante y los tres estados.
 */
const billingFor = (plan: DemoPlan, scenario: string) => {
    const price = Number(plan.price) || 0
    const owed = scenario === 'aldia' || !price ? [] : scenario === 'atrasado' ? [periodOf(1), periodOf(0)] : [periodOf(0)]
    const overdue = scenario === 'atrasado'
    return {
        billing_type: 'manual', plan: { name: plan.name, price }, next_amount: price, currency: 'MXN',
        next_charge_date: dayOfThisMonth(5, 1), payment_day: 5, balance: price * owed.length,
        oldest_unpaid_period: owed[0] ?? null, unpaid_periods: owed.length,
        payment_method: { type: 'manual', accounts: [{ bank: 'Banco de ejemplo', beneficiary: 'Beneficiario de ejemplo', number: '000000000000000000', numberType: 'CLABE' }], instructions: 'Pon tu número de cuenta Mary Kay en el concepto.', card_checkout: { enabled: false } },
        current_payment: owed.length ? {
            period: owed[owed.length - 1], status: overdue ? 'overdue' : 'pending', amount: price, remaining: price, currency: 'MXN',
            due_date: overdue ? dayOfThisMonth(5, -1) : dayOfThisMonth(25), is_due: true, is_overdue: overdue, has_receipt: false, can_upload_receipt: true,
            enforcement: { ...NO_ENFORCEMENT, days_overdue: overdue ? 14 : 0, show_home_banner: overdue },
        } : null,
        debt: { total: price * owed.length, currency: 'MXN', periods: owed.map(period => ({ period, remaining: price, status: overdue ? 'overdue' : 'pending' })) },
        payment_years: price ? [now.getFullYear()] : [],
    }
}

const paymentsFor = (plan: DemoPlan, scenario: string) => {
    const price = Number(plan.price) || 0
    if (!price) return []
    const owed = scenario === 'aldia' ? 0 : scenario === 'atrasado' ? 2 : 1
    return [0, 1, 2, 3, 4].map(back => {
        const pending = back < owed
        return {
            id: `pay-${back}`, period: periodOf(back), amount: price, paid: pending ? 0 : price, remaining: pending ? price : 0, currency: 'MXN',
            status: pending ? (scenario === 'atrasado' ? 'overdue' : 'pending') : 'paid', method: pending ? null : 'transfer',
            paid_at: pending ? null : iso(back * 30 - 12), reference_number: pending ? null : `REF${4821 + back}`,
            receipt_uploaded_at: pending ? null : iso(back * 30 - 12), has_receipt: !pending, receipt_url: null, can_upload_receipt: pending,
        }
    })
}


const FILE_PATH = '/files/download'

/** Guardados de ejemplo: viven en memoria y se pierden al recargar */
let savedStore: Array<Record<string, unknown>> = []

const person = (index: number) => ({ id: `person-${index}`, name: PEOPLE[index].toUpperCase(), account: `00${index}4${index}1`, photo: null })
const monthKey = () => month(0).slice(0, 7)
const monthEnd = () => { const d = new Date(now.getFullYear(), now.getMonth() + 1, 0); return `${monthKey()}-${String(d.getDate()).padStart(2, '0')}` }

/** Retos de ejemplo: uno suyo (cobertura) y uno puesto a la unidad, con su tabla por persona. */
const challengeStore = {
    personal: [{
        id: 'ch-coverage', scope: 'personal', type: 'coverage', title: 'Llega a Constante: 25% de tu unidad', description: 'Que 13 de tus 52 consultoras reciban algo tuyo este mes.',
        target: 25, prize: null, period: monthKey(), ends_on: monthEnd(), is_open: true, awards_count: 0,
        progress: { current: 13, goal: 25, measure: 'percent', done: false, detail: '7 de 52 consultoras', data_missing: false },
    }] as Array<Record<string, unknown>>,
    unit: [{
        id: 'ch-points', scope: 'unit', type: 'unit_points', title: '1,800 puntos antes de fin de mes', description: null,
        target: 1800, prize: 'Set de brochas + reconocimiento en el boletín', period: monthKey(), ends_on: monthEnd(), is_open: true, awards_count: 0,
        progress: { current: 2, goal: 52, measure: 'people', done: false, detail: null, data_missing: false },
    }] as Array<Record<string, unknown>>,
}
const challengeRows = [2450, 1910, 1320, 880, 410].map((current, index) => ({ ...person(index), current, goal: 1800, done: current >= 1800, awarded: false }))
const suggestions = [
    { type: 'section_share', title: 'Comparte todo Círculo Rosa esta semana', description: 'Es la sección que nunca has enviado y hoy tiene piezas en vivo.\nSon 3 piezas: con mandarlas llegas a 3 consultoras más.', target: 3, params: { section: 'pink_circle' }, people: [] },
    { type: 'leaders_five', title: 'Reto de las 5', description: 'Dos de tus líderes están a una activa de tener 5 en su grupo.', target: 5, params: null, people: [0, 1].map(index => ({ ...person(index), actives: 4 })) },
]

/** Lo que se pidió y a qué se contestó: `window.__cuentas.calls` dice qué no estaba previsto. */
export const calls: Array<{ method: string, path: string, mocked: boolean }> = []

const respond = (data: unknown, status = 200) => new Response(JSON.stringify({ success: status < 400, data, message: status < 400 ? 'OK' : 'Sin permiso (simulado)' }), { status, headers: { 'Content-Type': 'application/json' } })

export const installMockApi = (plan: DemoPlan, role: 'director' | 'consultant', rank?: string | null) => {
    const base = import.meta.env.VITE_API_URL as string
    const realFetch = window.fetch.bind(window)
    const owned = new Set<string>(plan.accesses.map(access => access.permission_key))
    const ownedSections = new Set<string>(plan.accesses.flatMap(access => (access.custom_permissions as Array<{ key: string }>).map(item => item.key)))

    window.fetch = async (input, init) => {
        const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
        if (!raw.startsWith(base)) return realFetch(input, init)

        const url = new URL(raw)
        const path = url.pathname.replace(new URL(base).pathname.replace(/\/$/, ''), '') || '/'
        const method = (init?.method ?? 'GET').toUpperCase()
        const q = url.searchParams
        let known = true
        let response: Response

        const scenario = sessionStorage.getItem('cuentas:cobro') ?? 'toca'

        if (path === '/me') response = respond(userFor(plan, role, rank))
        else if (path === '/util-data') response = respond(utilData)
        else if (path === '/billing/overview') response = respond(billingFor(plan, scenario))
        else if (path === '/billing/payments') response = respond(page(paymentsFor(plan, scenario)))
        else if (path.startsWith('/billing/')) response = respond(page([]))
        else if (path === '/posts') {
            const section = q.get('section') ?? ''
            // Como la API real: una sección que el plan no trae no devuelve nada
            response = ownedSections.has(section) ? respond(page(postsFor(plan, section))) : respond(null, 403)
        }
        else if (path === '/posts/stats/coverage') response = respond(owned.has('unity') ? { people_count: 52, people_reached: 7, percent: 13 } : { people_count: 0, people_reached: 0, percent: 0 })
        else if (path === '/posts/stats/month') response = respond((q.get('sections') ?? q.get('section') ?? '').split(',').filter(Boolean).map(section_key => ({ section_key, posts_count: 3, posts_sent_count: section_key === 'pink_circle' ? 0 : 1, posts_live_today_count: section_key.includes('birthdays') ? 2 : 0 })))
        else if (path === '/posts/my-birthday') response = respond(null)
        else if (/^\/posts\/[^/]+\/(sent|regenerate)$/.test(path)) response = respond(null)
        else if (path === '/tools/saved') response = respond(page(savedStore))
        else if (/^\/tools\/saved\/[^/]+$/.test(path) && method === 'DELETE') {
            savedStore = savedStore.filter(item => item.id !== path.split('/')[3])
            response = respond(null)
        }
        else if (/^\/tools\/[^/]+\/save$/.test(path) && method === 'POST') {
            const toolId = path.split('/')[2]
            const section = toolId.replace(/^tool-/, '').replace(/-\d+$/, '')
            const tool = toolsFor(section).find(item => item.id === toolId)
            const entry = { ...tool, id: `saved-${toolId}`, tool_id: toolId }
            savedStore = [entry, ...savedStore.filter(item => item.id !== entry.id)]
            response = respond(entry)
        }
        else if (path === '/tools') {
            const section = q.get('section') ?? ''
            response = owned.has(section) ? respond(page(toolsFor(section))) : respond(null, 403)
        }
        /* Descargar: llega un archivo de verdad (un SVG), para que «descargar y marcar enviada» se pueda probar */
        else if (path === FILE_PATH) response = new Response(new Blob(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 108 135"><rect width="108" height="135" fill="#6C47FF"/></svg>'], { type: 'image/svg+xml' }))
        else if (path === '/indicators/business') response = respond({ month: monthKey(), unit_size: owned.has('unity') ? 52 : 0, leaders: { count: 2, period: monthKey(), people: [] }, ordered: { count: 11, total: 52, source: 'sales' }, with_hearts: { count: 22 }, near_gift: { count: null } })
        else if (path === '/challenges/suggestions') response = respond(suggestions)
        else if (path === '/challenges' && method === 'POST') {
            const body = JSON.parse(String(init?.body ?? '{}'))
            const unit = String(body.type).startsWith('unit_')
            const created = {
                id: `ch-${Date.now()}`, scope: unit ? 'unit' : 'personal', type: body.type, description: null, target: body.target, prize: body.prize ?? null,
                title: body.title ?? (unit ? `${Number(body.target).toLocaleString('es-MX')} ${body.type === 'unit_hearts' ? 'corazones' : 'puntos'} antes del cierre` : suggestions.find(item => item.type === body.type)?.title ?? 'Nuevo reto'),
                period: monthKey(), ends_on: body.ends_on ?? monthEnd(), is_open: true, awards_count: 0,
                progress: { current: 0, goal: unit ? 52 : body.target, measure: unit ? 'people' : 'pieces', done: false, detail: null, data_missing: false },
            }
            challengeStore[unit ? 'unit' : 'personal'].push(created)
            response = respond(created)
        }
        else if (path === '/challenges') response = respond(challengeStore)
        else if (/^\/challenges\/[^/]+\/awards$/.test(path)) {
            const row = challengeRows.find(item => item.id === JSON.parse(String(init?.body ?? '{}')).person_id)
            if (row) row.awarded = true
            response = respond({ ...challengeStore.unit[0], rows: challengeRows })
        }
        else if (/^\/challenges\/[^/]+$/.test(path)) {
            const id = path.split('/')[2]
            if (method === 'DELETE') {
                challengeStore.personal = challengeStore.personal.filter(item => item.id !== id)
                challengeStore.unit = challengeStore.unit.filter(item => item.id !== id)
                response = respond(null)
            } else {
                const found = [...challengeStore.personal, ...challengeStore.unit].find(item => item.id === id)
                response = found ? respond({ ...found, rows: found.scope === 'unit' ? challengeRows : [] }) : respond(null, 404)
            }
        }
        else if (path === '/users/notifications') response = respond(page([]))
        else if (path === '/reports/uploads') {
            // Todos los reportes cargados menos el último de cada boletín: así se ve el aviso de «falta uno»
            const uploads = (utilData.newsletters as Array<{ code: string, sections: Array<{ id: string, name: string, canImported: number }> }>)
                .filter(n => owned.has(n.code))
                .flatMap(n => n.sections.filter(sec => sec.canImported).slice(0, -1).map(sec => ({ id: `up-${sec.id}`, status: 'completed', year_month: month(1).slice(0, 7), created_at: iso(2), updated_at: iso(2), newsletter: n, newsletter_section: sec })))
            response = respond(uploads)
        }
        else if (path.startsWith('/reports/generate-')) response = respond(null, 403)
        else if (path === '/reports/preferences') {
            // Como la API real: sólo los boletines que su plan trae, con las secciones del catálogo
            const newsletters = (utilData.newsletters as Array<{ code: string, name: string, sections: Array<{ sectionKey: string, name: string }> }>)
                .filter(n => owned.has(n.code))
                .map(n => ({ code: n.code, name: n.name, sections: n.sections.filter(sec => owned.has(sec.sectionKey)).map(sec => ({ section_key: sec.sectionKey, name: sec.name, is_hidden: false, positions: [], sub_sections: [] })) }))
            response = respond({ newsletters })
        }
        else if (path.startsWith('/trainings')) response = owned.has('trainings') ? respond(path === '/trainings' ? { recently: { items: [] }, categories: [] } : page([])) : respond(null, 403)
        /* Misma forma que la API real: el texto de la respuesta va suelto en `message` */
        else if (path === '/chat/services') response = respond({ conversation_id: 'demo', message: 'Esto es el simulador: aquí el Asistente no está conectado. Con tu sesión real contesta con tus datos.' })
        else if (/^\/chat\/conversations\/[^/]+\/messages$/.test(path)) response = respond([])
        else if (path === '/chat/conversations' || path === '/request-services' || path === '/events' || path === '/customers/client' || path === '/sponsored') response = respond(page([]))
        else { known = false; response = respond(method === 'GET' ? page([]) : null) }

        calls.push({ method, path: path + (url.search || ''), mocked: known })
        return response
    }
}
