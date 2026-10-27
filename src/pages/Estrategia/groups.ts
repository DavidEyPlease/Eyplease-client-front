import { ConsultantInventory, InventoryItem } from '@/interfaces/inventory'

export interface InventoryGroups {
    /** Lo que trae guardado de pedidos anteriores al último (aquí sale «Muévelo primero») */
    older: InventoryItem[]
    /** Lo de su último pedido */
    last: InventoryItem[]
    /** Lo que agregó ella porque no sale en sus pedidos */
    manual: InventoryItem[]
    /** Se le acabó: va al final, plegado, por si lo quiere corregir */
    out: InventoryItem[]
}

/**
 * Parte su inventario como lo cuenta el prototipo: lo guardado de pedidos anteriores primero y luego lo del último pedido.
 * Un producto es «anterior» si su pieza más vieja es de antes del último pedido (o si se marca para mover primero).
 * El orden dentro de cada parte es el de la API (lo guardado más tiempo primero).
 */
export const groupItems = (inventory: Pick<ConsultantInventory, 'items' | 'last_order'>): InventoryGroups => {
    const lastDate = inventory.last_order?.date ?? null
    const groups: InventoryGroups = { older: [], last: [], manual: [], out: [] }
    for (const item of inventory.items) {
        if (item.on_hand <= 0) groups.out.push(item)
        else if (item.manual) groups.manual.push(item)
        else if (!lastDate || item.stale || (item.oldest_unit_at !== null && item.oldest_unit_at < lastDate)) groups.older.push(item)
        else groups.last.push(item)
    }
    return groups
}
