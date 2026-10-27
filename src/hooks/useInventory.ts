import { useCallback, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import HttpService from '@/services/http'
import { API_ROUTES } from '@/constants/api'
import { ApiResponse, PaginationResponse } from '@/interfaces/common'
import { ConsultantInventory, CustomerSale, InventoryItem, InventorySummary, NewInventoryItemPayload, NewSalePayload } from '@/interfaces/inventory'
import useAuthStore from '@/store/auth'

/** Como el resto de la web: nada sale antes de tener a la usuaria (ni con la sesión cerrada) */
const useQueryGate = (enabled: boolean) => useAuthStore(state => enabled && !!state.user && !state.initialLoading)

export const INVENTORY_KEY = ['consultant', 'inventory']
export const SALES_KEY = ['consultant', 'sales']
/** La estrategia del mes se arma con el inventario y las ventas: se vuelve a pedir cuando cambian */
export const STRATEGY_KEY = ['consultant', 'strategy']
/** La lista de Mis Clientas: una venta con «guardarla» le suma una */
const MY_CLIENTS_KEY = ['entity', 'my-clients']

const round2 = (value: number) => Math.round(value * 100) / 100

/** La cuenta como la hace la API (sólo de lo que tiene): así se mueve al instante con − / +, antes de que conteste. */
export const summarize = (items: InventoryItem[]): InventorySummary => {
    const inStock = items.filter(item => item.on_hand > 0)
    const costed = inStock.filter(item => item.unit_cost !== null)
    return {
        products: inStock.length,
        units: round2(inStock.reduce((sum, item) => sum + item.on_hand, 0)),
        stale: inStock.filter(item => item.stale).length,
        catalog_value: round2(inStock.reduce((sum, item) => sum + item.price * item.on_hand, 0)),
        cost: round2(costed.reduce((sum, item) => sum + (item.unit_cost ?? 0) * item.on_hand, 0)),
        profit: round2(costed.reduce((sum, item) => sum + (item.profit_per_unit ?? 0) * item.on_hand, 0)),
        without_cost: inStock.length - costed.length,
    }
}

/** Un producto con otro «te quedan». Al agotarse deja de estar «Muévelo primero»; si vuelve a tener, recupera lo que traía. */
const withOnHand = (inventory: ConsultantInventory, sku: string, onHand: number, original?: InventoryItem): ConsultantInventory => {
    const items = inventory.items.map(item => item.sku !== sku ? item : {
        ...item,
        on_hand: onHand,
        stale: onHand > 0 && (original ?? item).stale,
        reviewed: true,
    })
    return { ...inventory, items, summary: summarize(items) }
}

const SAVE_DELAY_MS = 700

interface Options {
    enabled?: boolean
    /** No se pudo guardar un «te quedan»: la pantalla vuelve a lo que dice la API y avisa */
    onSaveError?: (error: unknown) => void
}

/**
 * Su inventario: sale solo de sus órdenes de Mary Kay y baja con cada venta. Cada respuesta de la API trae el
 * inventario completo, así que se pone tal cual en la caché.
 */
const useInventory = ({ enabled = true, onSaveError }: Options = {}) => {
    const queryClient = useQueryClient()
    const canRun = useQueryGate(enabled)

    const query = useQuery({
        queryKey: INVENTORY_KEY,
        queryFn: async () => (await HttpService.get<ApiResponse<ConsultantInventory>>(API_ROUTES.CONSULTANT.INVENTORY)).data,
        staleTime: 60_000,
        retry: 1,
        enabled: canRun,
    })

    // − / +: lo que ella ve cambia al instante; a la API sólo le llega el último número de cada producto.
    // Mientras un producto espera, la respuesta de otro no le pisa el número que ella acaba de poner.
    const pending = useRef(new Map<string, number>())
    const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
    const originals = useRef(new Map<string, InventoryItem>())
    const errorHandler = useRef(onSaveError)
    errorHandler.current = onSaveError

    const putServer = useCallback((data: ConsultantInventory | null | undefined) => {
        if (!data) return
        let merged = data
        pending.current.forEach((onHand, sku) => { merged = withOnHand(merged, sku, onHand, originals.current.get(sku)) })
        queryClient.setQueryData(INVENTORY_KEY, merged)
    }, [queryClient])

    const save = useCallback(async (sku: string) => {
        timers.current.delete(sku)
        const onHand = pending.current.get(sku)
        if (onHand === undefined) return
        try {
            const response = await HttpService.patch<ApiResponse<ConsultantInventory>>(API_ROUTES.CONSULTANT.INVENTORY_ITEM.replace('{sku}', encodeURIComponent(sku)), { on_hand: onHand })
            if (pending.current.get(sku) === onHand) {
                pending.current.delete(sku)
                originals.current.delete(sku)
            }
            putServer(response.data)
            queryClient.invalidateQueries({ queryKey: STRATEGY_KEY })
        } catch (error) {
            pending.current.delete(sku)
            originals.current.delete(sku)
            queryClient.invalidateQueries({ queryKey: INVENTORY_KEY })
            errorHandler.current?.(error)
        }
    }, [putServer, queryClient])

    const setOnHand = useCallback((sku: string, onHand: number) => {
        const value = Math.max(0, Math.min(9999, round2(onHand)))
        queryClient.setQueryData<ConsultantInventory>(INVENTORY_KEY, current => {
            if (!current) return current
            if (!originals.current.has(sku)) {
                const item = current.items.find(row => row.sku === sku)
                if (item) originals.current.set(sku, item)
            }
            return withOnHand(current, sku, value, originals.current.get(sku))
        })
        pending.current.set(sku, value)
        clearTimeout(timers.current.get(sku))
        timers.current.set(sku, setTimeout(() => { void save(sku) }, SAVE_DELAY_MS))
    }, [queryClient, save])

    /** − / + sobre lo que hay en la caché en este instante (no sobre lo último que se pintó) */
    const stepOnHand = useCallback((sku: string, delta: 1 | -1) => {
        const current = queryClient.getQueryData<ConsultantInventory>(INVENTORY_KEY)?.items.find(item => item.sku === sku)?.on_hand
        if (current === undefined) return
        setOnHand(sku, delta < 0 ? Math.max(0, Math.ceil(current) - 1) : Math.floor(current) + 1)
    }, [queryClient, setOnHand])

    // Si sale de la pantalla con un número sin mandar, se manda ya
    useEffect(() => () => {
        timers.current.forEach((timer, sku) => {
            clearTimeout(timer)
            void save(sku)
        })
    }, [save])

    const review = useMutation({
        mutationFn: async () => (await HttpService.post<ApiResponse<ConsultantInventory>>(API_ROUTES.CONSULTANT.INVENTORY_REVIEW, {})).data,
        onSuccess: data => { putServer(data); queryClient.invalidateQueries({ queryKey: STRATEGY_KEY }) },
    })

    const addItem = useMutation({
        mutationFn: async (payload: NewInventoryItemPayload) => (await HttpService.post<ApiResponse<ConsultantInventory>>(API_ROUTES.CONSULTANT.INVENTORY_ITEMS, payload)).data,
        onSuccess: data => { putServer(data); queryClient.invalidateQueries({ queryKey: STRATEGY_KEY }) },
    })

    return {
        data: query.data ?? null,
        loading: query.isLoading,
        error: query.error,
        refetch: query.refetch,
        setOnHand,
        stepOnHand,
        review,
        addItem,
    }
}

/** Sus ventas, de la más nueva a la más vieja; con `clientCustomerId`, sólo las de esa clienta (su historial). */
export const useSales = ({ clientCustomerId = null, perPage = 20, enabled = true }: { clientCustomerId?: string | null, perPage?: number, enabled?: boolean } = {}) => {
    const canRun = useQueryGate(enabled)
    return useQuery({
        queryKey: [...SALES_KEY, clientCustomerId ?? 'todas', perPage],
        queryFn: async () => {
            const params = new URLSearchParams({ perPage: String(perPage) })
            if (clientCustomerId) params.set('client_customer_id', clientCustomerId)
            return (await HttpService.get<ApiResponse<PaginationResponse<CustomerSale>>>(`${API_ROUTES.CONSULTANT.SALES}?${params}`)).data
        },
        staleTime: 30_000,
        enabled: canRun,
    })
}

/** Anotar y borrar ventas. Las dos mueven el inventario (la API lo recalcula): se vuelve a pedir. */
export const useSaleActions = () => {
    const queryClient = useQueryClient()
    const refresh = (savedCustomer = false) => Promise.all([
        queryClient.invalidateQueries({ queryKey: INVENTORY_KEY }),
        queryClient.invalidateQueries({ queryKey: SALES_KEY }),
        queryClient.invalidateQueries({ queryKey: STRATEGY_KEY }),
        ...(savedCustomer ? [queryClient.invalidateQueries({ queryKey: MY_CLIENTS_KEY })] : []),
    ])

    const record = useMutation({
        mutationFn: async (payload: NewSalePayload) => (await HttpService.post<ApiResponse<CustomerSale>>(API_ROUTES.CONSULTANT.SALES, payload)).data,
        onSuccess: (_sale, payload) => refresh(!!payload.save_customer),
    })

    const remove = useMutation({
        mutationFn: async (id: string) => { await HttpService.delete(API_ROUTES.CONSULTANT.SALE.replace('{id}', id)) },
        onSuccess: () => refresh(),
    })

    return { record, remove }
}

export default useInventory
