import useInventory from '@/hooks/useInventory'
import { StrategyPiece } from '@/interfaces/strategy'

/** Lo que le costó la pieza (con IVA), con sus facturas; nulo si algún producto todavía no tiene. */
const usePieceCost = (piece: StrategyPiece | null) => {
    const { data } = useInventory({ enabled: !!piece })
    if (!piece || !data) return null
    let cost = 0
    for (const product of piece.products) {
        const item = data.items.find(row => row.sku === product.sku)
        if (!item || item.unit_cost === null) return null
        cost += item.unit_cost
    }
    return cost
}

export default usePieceCost
