// SÓLO DEV: «Invitar con regalo» en el simulador. La página del regalo (sin sesión, por token) y las invitaciones de la
// Directora en Mi unidad, con gente inventada. La imagen de la invitación se arma aquí en un canvas sobre la base
// provisional (la API la arma con Imagick, ver InvitationImageService).
//
//   cuentas.html?registro=regalo&ir=/regalo/demo          con pedidos: su estrategia ya está lista
//   cuentas.html?registro=regalo&ir=/regalo/demo-sin      sin pedidos todavía
//   cuentas.html?registro=regalo&ir=/regalo/demo-cuenta   ya tiene cuenta (sin sesión): «Entrar para activarlo»
//   cuentas.html?registro=regalo&ir=/regalo/demo-activa   ya lo activó
//   cuentas.html?registro=regalo&ir=/regalo/demo-cerrada  su Directora dejó de pagar: cuenta gratis, sin regalo
//   cuentas.html?plan=gratis-consultora&ir=/regalo/demo-mia   ya tiene cuenta y entra con su sesión: lo activa ahí mismo
//   cuentas.html?plan=elite&ir=/my-unit                    la Directora: invitar una por una y cómo van

const DIRECTORA = { name: 'Mariana Demo', first_name: 'Mariana', initials: 'MD', photo: null }
const GIFT = { months: 1, name: 'Tu estrategia', value: 139, currency: 'MXN' }
const MES = new Date().toLocaleDateString('es-MX', { month: 'long' })
const URL_BASE = 'https://app.eyplease.com.mx/regalo/'

const enUnMes = () => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d }
const etiqueta = (d: Date) => d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

const preview = (ready: boolean) => ({
    month: MES,
    ready,
    headline: ready ? 'Enfócate en Cuidado de la piel' : null,
    focus: ready ? 'cuidado de la piel' : null,
    products: ready ? 9 : 0,
    last_order: ready ? new Date(Date.now() - 12 * 86400000).toISOString().slice(0, 10) : null,
    moment: { label: 'Buen Fin', dates: 'del 13 al 17 de noviembre' },
    pieces: ready ? [
        { key: 'ahora', tag: 'Para entrega inmediata', title: 'Loción Desmaquillante de Ojos', products: ['Loción Desmaquillante de Ojos Libre de Aceite'], image_key: '02_locion_desmaquillante_ojos', image_url: '/src/dev/cuentas/laminas/02_locion_desmaquillante_ojos.jpg' },
        { key: 'duo', tag: 'Buen Fin', title: 'Dúo CC Cream + Joy Emotion', products: ['CC Cream con FPS 15', 'Joy Emotion Eau de Parfum'], image_key: '08_cc_cream', image_url: '/src/dev/cuentas/laminas/08_cc_cream.jpg' },
        { key: 'regalo', tag: 'Regalo de Navidad', title: 'If You Believe', products: ['If You Believe Eau de Toilette'], image_key: '03_if_you_believe', image_url: '/src/dev/cuentas/laminas/03_if_you_believe.jpg' },
    ] : [],
})

const signup = { name: 'Ana Valadez Ángeles', username: 'DEMO123', country: 'MEX', director_name: DIRECTORA.name }

/** GET gifts/{token}: lo que ve la consultora. `mine`: entra con su sesión (la cuenta del simulador es ella). */
export const giftView = (token: string, state: { loggedIn: boolean, claimed: boolean, registered: boolean }) => {
    const base = { is_mine: false, consultant: { first_name: 'Ana', given_names: 'Ana' }, director: DIRECTORA }
    const gift = (extra = {}) => ({ ...GIFT, available: true, reason: null, message: null, ends_at: null, ends_label: null, ...extra })

    if (state.claimed || state.registered || token === 'demo-activa') {
        const fin = enUnMes()
        return { ...base, status: 'activated', gift: gift({ available: false, reason: 'activo', message: 'Tu regalo ya está activo.', ends_at: fin.toISOString(), ends_label: etiqueta(fin) }), preview: null, signup: null }
    }
    switch (token) {
        case 'demo':
            return { ...base, status: 'open', gift: gift(), preview: preview(true), signup }
        case 'demo-sin':
            return { ...base, status: 'open', gift: gift(), preview: preview(false), signup }
        case 'demo-cuenta':
            return { ...base, status: 'has_account', gift: gift(), preview: preview(true), signup: null }
        case 'demo-mia':
            return { ...base, status: 'has_account', is_mine: state.loggedIn, gift: gift(), preview: preview(true), signup: null }
        case 'demo-cerrada':
            return { ...base, status: 'open', gift: gift({ available: false, reason: 'directora', message: 'Este regalo ya no está disponible, pero puedes crear tu cuenta gratis.' }), preview: preview(true), signup }
        default:
            return null
    }
}

export const giftTrialEnds = () => enUnMes().toISOString()

// ---------------------------------------------------------------------------------------------------------------------
// La Directora: su unidad con las invitaciones
// ---------------------------------------------------------------------------------------------------------------------

type Status = 'sin_invitar' | 'invitada' | 'abrio' | 'activo' | 'ya_usa'
interface DemoRow { id: string, name: string, whatsapp: string | null, has_orders: boolean, status: Status, sentDays?: number, openedDays?: number, activatedDays?: number, plan?: string }

const UNIDAD: DemoRow[] = [
    { id: 'inv-1', name: 'Ana Valadez Ángeles', whatsapp: '524611234567', has_orders: true, status: 'sin_invitar' },
    { id: 'inv-2', name: 'Evangelina Caracheo Ruiz', whatsapp: null, has_orders: true, status: 'sin_invitar' },
    { id: 'inv-3', name: 'Andrea Gorgonio Luna', whatsapp: null, has_orders: true, status: 'sin_invitar' },
    { id: 'inv-4', name: 'María Elvia Aguilar Soto', whatsapp: null, has_orders: false, status: 'sin_invitar' },
    { id: 'inv-5', name: 'Rosa Luz Arteaga Mena', whatsapp: null, has_orders: false, status: 'sin_invitar' },
    { id: 'inv-6', name: 'Guadalupe García Torres', whatsapp: '524619876543', has_orders: true, status: 'invitada', sentDays: 2 },
    { id: 'inv-7', name: 'Karla Montes Aguirre', whatsapp: null, has_orders: true, status: 'invitada', sentDays: 5 },
    { id: 'inv-8', name: 'Diana Solís Peña', whatsapp: null, has_orders: true, status: 'abrio', sentDays: 4, openedDays: 3 },
    { id: 'inv-9', name: 'Fernanda Ríos Cano', whatsapp: null, has_orders: true, status: 'activo', sentDays: 6, openedDays: 6, activatedDays: 5 },
    { id: 'inv-10', name: 'Paola Medina Cruz', whatsapp: null, has_orders: true, status: 'activo', sentDays: 3, openedDays: 2, activatedDays: 2 },
    { id: 'inv-11', name: 'Lucía Herrera Vega', whatsapp: null, has_orders: false, status: 'ya_usa', plan: 'Plan Gratis Consultora' },
]

const ago = (days?: number) => (days === undefined ? null : new Date(Date.now() - days * 86400000).toISOString())
const first = (name: string) => name.split(' ')[0]
const given = (name: string) => { const w = name.split(' '); return w.length <= 2 ? w[0] : w.slice(0, w.length - 2).join(' ') }

export const createUnitInvitationsDemo = () => {
    const rows = UNIDAD.map(row => ({ ...row, timesSent: row.sentDays !== undefined ? 1 : 0, reminders: 0, lastSent: ago(row.sentDays) }))

    const invitation = (row: typeof rows[number]) => row.status === 'sin_invitar' && !row.timesSent ? null : {
        id: row.id, url: URL_BASE + 'demo', status: row.status === 'sin_invitar' ? 'sin_enviar' : row.status,
        sent_at: ago(row.sentDays), last_sent_at: row.lastSent, times_sent: row.timesSent,
        opened_at: ago(row.openedDays), times_opened: row.openedDays !== undefined ? 1 : 0,
        activated_at: ago(row.activatedDays), gift_applied: row.status === 'activo',
        gift_ends_at: row.activatedDays !== undefined ? new Date(Date.now() + (30 - row.activatedDays) * 86400000).toISOString() : null,
        reminded_at: row.reminders ? row.lastSent : null, times_reminded: row.reminders,
    }
    const person = (row: typeof rows[number]) => ({
        id: row.id, name: row.name, first_name: first(row.name), account: `D${row.id.replace(/\D/g, '').padStart(5, '0')}`, country: 'MEX',
        phone: row.whatsapp ? row.whatsapp.slice(2) : null, whatsapp: row.whatsapp, photo: null,
    })
    const order: Record<Status, number> = { sin_invitar: 0, invitada: 1, abrio: 2, activo: 3, ya_usa: 4 }

    const list = () => {
        const people = [...rows]
            .sort((a, b) => order[a.status] - order[b.status] || Number(b.has_orders) - Number(a.has_orders) || a.name.localeCompare(b.name))
            .map(row => ({ ...person(row), has_orders: row.has_orders, has_account: row.status === 'activo' || row.status === 'ya_usa', plan: row.plan ?? (row.status === 'activo' ? 'Plan Standard' : null), status: row.status, invitation: invitation(row) }))
        const invs = people.map(p => p.invitation).filter(Boolean) as NonNullable<ReturnType<typeof invitation>>[]
        return {
            available: true, reason: null, message: null, gift: GIFT,
            totals: {
                unit: people.length, with_app: people.filter(p => p.has_account).length, to_invite: people.filter(p => p.status === 'sin_invitar').length,
                invited: invs.filter(i => i.sent_at || i.opened_at || i.activated_at).length, opened: invs.filter(i => i.opened_at).length,
                activated: invs.filter(i => i.activated_at).length, gifts: invs.filter(i => i.gift_applied).length,
            },
            next_person_id: people.find(p => p.status === 'sin_invitar')?.id ?? null,
            people,
        }
    }

    const share = (row: typeof rows[number]) => {
        const url = URL_BASE + 'demo'
        const hola = `¡Hola, ${first(row.name)}!`
        const que = row.has_orders
            ? `Con tus pedidos ya te armaron tu estrategia de ${MES}: qué ofrecer esta semana con lo que tienes e imágenes con tu nombre para tus clientas.`
            : 'Te dice qué ofrecer cada semana con lo que tienes y te da imágenes con tu nombre para tus clientas.'
        const messages = {
            invite: `${hola} Te tengo un regalo.\n\nEs un mes de «Tu estrategia» en Eyplease+, sin costo para ti.\n${que}\n\nÁbrelo aquí: ${url}\n\n¿Me cuentas qué te parece?`,
            reminder: `${hola} ¿Ya viste tu regalo?\n\nEs tu mes de «Tu estrategia», sin costo. Se activa en un minuto${row.has_orders ? ` y tu estrategia de ${MES} ya está lista` : ''}.\n\nAquí está otra vez: ${url}\n\n¿Te ayudo con algo?`,
        }
        const message = row.status === 'invitada' || row.status === 'abrio' ? messages.reminder : messages.invite
        return {
            ...(invitation(row) ?? { id: row.id, url, status: 'sin_enviar', sent_at: null, last_sent_at: null, times_sent: 0, opened_at: null, times_opened: 0, activated_at: null, gift_applied: false, gift_ends_at: null, reminded_at: null, times_reminded: 0 }),
            list_status: row.status,
            person: { ...person(row), has_orders: row.has_orders },
            image_url: `/unit/invitations/${row.id}/image`,
            image_name: `regalo-${first(row.name).toLowerCase()}.jpg`,
            messages, message,
            whatsapp_url: row.whatsapp ? `https://wa.me/${row.whatsapp}?text=${encodeURIComponent(message)}` : null,
        }
    }

    return {
        list,
        ensure: (personId: string) => { const row = rows.find(r => r.id === personId); return row ? share(row) : null },
        sent: (id: string, reminder: boolean) => {
            const row = rows.find(r => r.id === id)
            if (!row) return null
            if (reminder && row.timesSent) row.reminders += 1
            row.timesSent += 1
            row.lastSent = new Date().toISOString()
            if (row.sentDays === undefined) row.sentDays = 0
            if (row.status === 'sin_invitar') row.status = 'invitada'
            return share(row)
        },
        image: async (id: string) => {
            const row = rows.find(r => r.id === id)
            return row ? composeInvitation(given(row.name).length > 20 ? first(row.name) : given(row.name), DIRECTORA.name, DIRECTORA.initials) : null
        },
    }
}

/** La imagen de la invitación, como la arma la API (mismas zonas que config/invitations.php: la base de Astra), en un canvas. */
const composeInvitation = async (name: string, director: string, initials: string): Promise<Blob> => {
    const base = new Image()
    base.src = '/src/dev/cuentas/regalo/invitacion_base.jpg'
    await base.decode()
    const canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(base, 0, 0)
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    // Astra usó Arial Black y Arial; la API, Inter 800 e Inter 400 (aquí, la que tenga el navegador)
    const sans = 'Inter, "Arial Black", Arial, sans-serif'

    // Su nombre: a la izquierda, arriba de «Tu estrategia»
    ctx.fillStyle = '#5315CC'
    let size = 64
    do { ctx.font = `800 ${size}px ${sans}`; size -= 2 } while (ctx.measureText(name).width > 620 && size > 24)
    ctx.fillText(name, 130, 380 + 45)

    // La foto (aquí, sus iniciales) en el círculo
    ctx.beginPath()
    ctx.arc(300, 1065, 130, 0, Math.PI * 2)
    ctx.fillStyle = '#5315CC'
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.textAlign = 'center'
    ctx.font = `800 96px ${sans}`
    ctx.fillText(initials, 300, 1068)

    // «De parte de tu Directora» y su nombre, a la derecha de la foto
    ctx.textAlign = 'left'
    ctx.fillStyle = '#1A1830'
    ctx.font = `400 37px ${sans}`
    ctx.fillText('De parte de tu Directora', 455, 1024)
    ctx.fillStyle = '#5315CC'
    ctx.font = `800 52px ${sans}`
    ctx.fillText(director, 455, 1079)

    return new Promise(resolve => canvas.toBlob(blob => resolve(blob!), 'image/jpeg', 0.88))
}
