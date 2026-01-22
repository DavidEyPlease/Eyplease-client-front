import { API_ROUTES } from "@/constants/api"
import { BROWSER_EVENTS } from "@/constants/app"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { useIsFirstMount } from "@/hooks/useIsFirstMount"
import { CustomerOfClient, ICustomersOfClientFilters } from "@/interfaces/customerOfClients"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { useCallback, useEffect } from "react"

const useListMyClients = () => {
    // const { filters, setFilters, ...store } = useMyClientsStore(state => state)
    // const {
    //     items: clients,
    //     setItems,
    //     ...rest
    // } = useListStore({ endpoint: API_ROUTES.MY_CLIENTS.LIST, filters }, store)

    const {
        data: clients,
        updateItems,
        setFilter,
        ...rest
    } = useInfiniteListQuery<CustomerOfClient, ICustomersOfClientFilters>({
        endpoint: API_ROUTES.MY_CLIENTS.LIST,
        defaultFilters: { letter: '' },
    })

    const isFirstMount = useIsFirstMount()

    const handleRefreshList = useCallback((event: BrowserEvent<{ action: 'created' | 'updated' | 'deleted', data: CustomerOfClient }>) => {
        if (event.detail.action === 'updated') {
            updateItems(clients.map(client => client.id === event.detail.data.id ? event.detail.data : client))
        }

        if (event.detail.action === 'created') {
            updateItems([event.detail.data, ...clients])
        }
        if (event.detail.action === 'deleted') {
            updateItems(clients.filter(client => client.id !== event.detail.data.id))
        }
    }, [clients])

    useEffect(() => {
        subscribeEvent(BROWSER_EVENTS.CUSTOMER_CLIENTS_LIST_UPDATED, handleRefreshList as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.CUSTOMER_CLIENTS_LIST_UPDATED, handleRefreshList as EventListener)
        }
    }, [handleRefreshList])

    return {
        isFirstMount,
        clients,
        setFilters: setFilter,
        ...rest
    }
}

export default useListMyClients