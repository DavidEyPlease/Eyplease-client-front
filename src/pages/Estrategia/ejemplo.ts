import { ConsultantStrategy } from '@/interfaces/strategy'

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

/**
 * La estrategia de EJEMPLO que ve, con candado, una consultora con plan gratis: una consultora inventada que compró
 * mucho (la «Lupita» del prototipo). Sin fechas fijas ni momento del mes para que no caduque; las piezas van en boceto.
 */
export const estrategiaDeEjemplo = (): ConsultantStrategy => {
    const hoy = new Date()
    const mes = MESES[hoy.getMonth()]
    const pedido = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - 13)
    const fecha = `${pedido.getFullYear()}-${String(pedido.getMonth() + 1).padStart(2, '0')}-${String(pedido.getDate()).padStart(2, '0')}`
    const producto = (sku: string, name: string, price: number, onHand: number, category: string, shade: string | null = null) => ({ sku, name, shade, price, on_hand: onHand, category })

    return {
        month: mes,
        segment: 'big',
        headline: 'Enfócate en maquillaje',
        focus: { key: 'maquillaje', label: 'maquillaje' },
        diagnosis: 'Lo primero: If You Believe Eau de Toilette lleva 42 días guardado. Tienes 60 piezas, $25,650 a precio de clienta: si lo vendes todo, ganas $15,293.',
        level: { month: `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`, accumulated: 15855, earned: 50, kept: 0, kept_from: null, level: 50, next: null, keeps_next_month: false },
        moment: null,
        plan: [
            { text: 'Esta semana ofrece If You Believe Eau de Toilette a tus clientas de fragancias: tienes 8 piezas y te deja $458 cada una.', piece: 'ahora' },
            { text: 'Ofrece el Dúo CC Cream + Loción Desmaquillante de Ojos a $749 a quien te compre uno de los dos.', piece: 'duo' },
            { text: 'Ya ganaste el 50 % este mes: pide sólo lo que te vayan pidiendo.', piece: null },
        ],
        pieces: [
            { key: 'ahora', tag: 'Para entrega inmediata', title: 'If You Believe Eau de Toilette', products: [producto('ej-1', 'If You Believe Eau de Toilette', 664, 8, 'fragancia')], normal_price: 664, promo_price: null, profit: 458, message: '¡Hola! Lo tengo para entrega inmediata: If You Believe Eau de Toilette. Cuesta $664. ¿Te lo aparto?', slides: [] },
            { key: 'duo', tag: 'Dúo del mes', title: 'Dúo CC Cream + Loción Desmaquillante de Ojos', products: [producto('ej-2', 'CC Cream Crema Correctora de Color FPS 15', 404, 19, 'maquillaje', 'Light to Medium'), producto('ej-3', 'Loción Desmaquillante de Ojos Libre de Aceite', 414, 11, 'piel')], normal_price: 818, promo_price: 749, profit: 417, message: '¡Hola! Tengo el dúo CC Cream + Loción Desmaquillante de Ojos por $749. ¿Te lo aparto?', slides: [] },
            { key: 'tambien', tag: 'Disponible', title: 'Base de Maquillaje TimeWise 3D · Ivory C 110', products: [producto('ej-4', 'Base de Maquillaje TimeWise 3D', 389, 8, 'maquillaje', 'Ivory C 110')], normal_price: 389, promo_price: null, profit: 195, message: '¡Hola! Tengo disponible: Base de Maquillaje TimeWise 3D · Ivory C 110. Cuesta $389. ¿Te lo aparto?', slides: [] },
        ],
        reminders: [
            { client_customer_id: null, customer_name: 'Andrea Gorgonio', product: 'Base de Maquillaje TimeWise 3D', sold_at: fecha, weeks: 11, message: '¡Hola, Andrea! ¿Cómo te ha ido con Base de Maquillaje TimeWise 3D? Ya debe estar por acabarse: tengo para entrega inmediata.' },
        ],
        inventory: {
            summary: { products: 7, units: 60, stale: 2, catalog_value: 25650, cost: 10357, profit: 15293, without_cost: 0 },
            reviewed: true,
            last_order: { number: 'EJEMPLO', date: fecha },
        },
    }
}
