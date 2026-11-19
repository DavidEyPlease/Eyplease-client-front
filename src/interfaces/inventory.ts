import { StrategySlide } from './strategy'

/**
 * «Tu estrategia» (plan Standard de consultora), parte 1: su inventario y lo que vende a sus clientas.
 * El inventario sale solo de sus órdenes de Mary Kay (últimos `lookback_months` meses) y baja cuando anota una venta.
 * Precios y costos llegan CON IVA. API: `consultant/inventory*` y `consultant/sales*`.
 */

export interface InventoryItem {
    sku: string
    name: string
    shade: string | null
    /** Lo agregó ella (no sale en sus órdenes) */
    manual: boolean
    is_ordena_ya: boolean
    /** Lo que compró en sus órdenes de la ventana */
    purchased: number
    /** «Te quedan» */
    on_hand: number
    /** Precio para la clienta, con IVA (0 si lo agregó sin precio) */
    price: number
    /** Lo que le costó cada pieza según sus facturas, con IVA. Nulo = todavía sin factura */
    unit_cost: number | null
    profit_per_unit: number | null
    last_purchased_at: string | null
    /** Desde cuándo tiene guardada su pieza más vieja */
    oldest_unit_at: string | null
    days_stored: number
    /** Lleva guardado más de lo debido: «Muévelo primero» */
    stale: boolean
    reviewed: boolean
    /** Su imagen de la biblioteca (con su logo) y el mensaje para mandarlo suelto; nulo si todavía no tiene imagen */
    piece?: InventoryPiece | null
    /** Su categoría por el nombre (config/strategy.php de la API); sin ella, va en «Otros» */
    category?: InventoryCategory
}

/** Las categorías de la estrategia: piel, maquillaje, fragancia, cuerpo y otros */
export interface InventoryCategory {
    key: string
    label: string
}

export interface InventoryPiece {
    /** `url` = consultant/strategy/images/{key}: se baja como las piezas de la estrategia */
    slides: StrategySlide[]
    /** «¡Hola! Lo tengo para entrega inmediata: … Cuesta $X. ¿Te lo aparto?» */
    message: string
}

/** Un producto de la lista de Mary Kay de su país (lo que se ha pedido ahí), para agregarlo a mano ligado a su clave */
export interface CatalogProduct {
    sku: string
    name: string
    shade: string | null
    /** Precio de lista con IVA, en pesos enteros; nulo si no lo tenemos */
    price: number | null
    /** Ya tiene su imagen en la biblioteca: al agregarlo, sale con «Compartir» */
    has_image: boolean
    /** La clave de su categoría (piel, maquillaje, fragancia, cuerpo u otros) */
    category?: string
}

export interface InventorySummary {
    products: number
    units: number
    stale: number
    /** Lo que tiene, a precio de catálogo */
    catalog_value: number
    /** Lo que le costó (sólo productos con factura) */
    cost: number
    profit: number
    /** Productos sin factura todavía: su ganancia no entra en la cuenta */
    without_cost: number
}

export interface ConsultantInventory {
    country: string
    /** Ya hizo su revisión de una sola vez */
    reviewed: boolean
    lookback_months: number
    last_order: { number: string, date: string } | null
    summary: InventorySummary
    /** Ya viene ordenado: lo que tiene primero y, de eso, lo guardado más tiempo */
    items: InventoryItem[]
    /** «Para tu próximo pedido»: lo que se le acabó o le va a faltar, según lo que sale de su inventario */
    next_order?: NextOrder
}

/**
 * «Para tu próximo pedido». Lo que sale de cada producto (sus ventas y lo que bajó con −) entre el tiempo desde que lo
 * tiene (mínimo 4 semanas) da cuántas salen por semana; se sugiere lo que le falta para cubrir `cover_weeks`.
 */
export interface NextOrder {
    /** Ya hay salidas (ventas o −) con qué calcular; si no, todavía no sabemos qué se vende */
    has_signal: boolean
    /** Para cuántas semanas se sugiere tener */
    cover_weeks: number
    /** Lo agotado primero y luego lo que le alcanza para menos tiempo */
    lines: NextOrderLine[]
}

export interface NextOrderLine {
    sku: string
    name: string
    shade: string | null
    /** `out`: se le acabó · `low`: le alcanza para menos de `cover_weeks` */
    reason: 'out' | 'low'
    on_hand: number
    /** Cuántas salen al mes, con un decimal */
    monthly: number
    /** Para cuántas semanas le alcanza lo que tiene (nulo si se le acabó) */
    weeks_left: number | null
    /** Cuántas pedir */
    suggested: number
    /** Precio para la clienta, con IVA (0 si lo agregó sin precio) */
    price: number
    unit_cost: number | null
    /** Lo agregó escrito a mano (sin clave de Mary Kay) */
    manual_name: boolean
}

export interface CustomerSaleItem {
    sku: string | null
    name: string
    quantity: number
    /** Lo que cobró por pieza, con IVA */
    unit_price: number
}

export interface CustomerSale {
    id: string
    client_customer_id: string | null
    customer_name: string
    total: number
    sold_at: string | null
    source: 'app' | 'assistant' | 'manual' | string
    note: string | null
    items: CustomerSaleItem[]
    /** «Mándale cómo usarlo»: las láminas de cómo usar lo que se llevó (con su logo) y el mensaje; nulo si ninguno tiene */
    howto?: SaleHowTo | null
}

export interface SaleHowTo {
    /** `url` = consultant/strategy/images/{key}: se baja como las piezas de la estrategia */
    slides: StrategySlide[]
    /** Ya escrito para la clienta: «¡Hola, Ana! Te mando cómo usar tu…» */
    message: string
}

export interface NewSalePayload {
    client_customer_id?: string
    customer_name?: string
    /** Con un nombre nuevo: guardarla también en Mis Clientas */
    save_customer?: boolean
    items: Array<{ sku?: string, name?: string, quantity: number, unit_price?: number }>
    total?: number
    sold_at?: string
    source: 'app'
    note?: string
}

export interface NewInventoryItemPayload {
    name: string
    quantity: number
    price?: number
    sku?: string
}

/** «Agrega lo que tienes»: varios de una vez (máx. 150) */
export interface NewInventoryItemsBatchPayload {
    items: NewInventoryItemPayload[]
}
