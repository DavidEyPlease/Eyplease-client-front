import { InventoryItem } from '@/interfaces/inventory'

/**
 * Las categorías de «Tu inventario» (las de config/strategy.php de la API), en el orden en que se enseñan: lo de la piel
 * primero, como el catálogo de Mary Kay. La API manda la de cada producto; lo que no trae categoría va en «Otros».
 */
export const CATEGORIES: Array<{ key: string, title: string, short: string }> = [
    { key: 'piel', title: 'Cuidado de la piel', short: 'Piel' },
    { key: 'maquillaje', title: 'Maquillaje', short: 'Maquillaje' },
    { key: 'fragancia', title: 'Fragancias', short: 'Fragancias' },
    { key: 'cuerpo', title: 'Cuidado del cuerpo', short: 'Cuerpo' },
    { key: 'otros', title: 'Otros', short: 'Otros' },
]

const keyOf = (item: Pick<InventoryItem, 'category'>) => {
    const key = item.category?.key ?? 'otros'
    return CATEGORIES.some(category => category.key === key) ? key : 'otros'
}

export interface CategoryGroup {
    key: string
    title: string
    items: InventoryItem[]
    units: number
    /** Lo que tiene de esa categoría, a precio de clienta */
    value: number
}

/** Lo que tiene, por categoría (sin las vacías). El orden dentro de cada una es el de la API: lo guardado más tiempo primero. */
export const groupByCategory = (items: InventoryItem[]): CategoryGroup[] => CATEGORIES
    .map(category => {
        const mine = items.filter(item => keyOf(item) === category.key)
        return {
            key: category.key,
            title: category.title,
            items: mine,
            units: mine.reduce((sum, item) => sum + item.on_hand, 0),
            value: mine.reduce((sum, item) => sum + item.price * item.on_hand, 0),
        }
    })
    .filter(group => group.items.length > 0)
