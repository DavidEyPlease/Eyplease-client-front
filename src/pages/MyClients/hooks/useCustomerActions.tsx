import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { PaginationResponse } from "@/interfaces/common"
import { CustomerOfClient } from "@/interfaces/customerOfClients"
import { useMyClientsStore } from "@/store/my-clients"
import { InfiniteData, useQueryClient } from "@tanstack/react-query"

const useCustomerActions = () => {
    const { getListQueryKey } = useMyClientsStore(state => state)
    const { request, requestState } = useRequestQuery()
    const queryClient = useQueryClient()

    const listQueryKey = getListQueryKey()

    const addCachedCustomer = (item: CustomerOfClient) => {
        queryClient.setQueryData<InfiniteData<PaginationResponse<CustomerOfClient>>>(listQueryKey, (current) => {
            if (!current) {
                return {
                    pages: [{
                        items: [item],
                        current_page: 1,
                        last_page: 1,
                        per_page: 1,
                        total_items: 1
                    }],
                    pageParams: [1]
                }
            }

            const [first, ...rest] = current.pages
            const updatedFirst = {
                ...first,
                items: [item, ...first.items],
                total_items: (first.total_items || 0) + 1
            }

            return {
                ...current,
                pages: [updatedFirst, ...rest]
            }
        })
    }

    const updateCachedCustomer = (itemId: string, data?: Partial<CustomerOfClient>) => {
        queryClient.setQueryData<InfiniteData<PaginationResponse<CustomerOfClient>>>(listQueryKey, (current) => {
            if (!current) return current

            const pages = current.pages.map((page) => {
                const items = data
                    ? page.items.map((item) => item.id === itemId ? { ...item, ...data } : item)
                    : page.items.filter((item) => item.id !== itemId)

                return { ...page, items }
            })

            return { ...current, pages }
        })
    }

    const onRemoveCustomer = async (itemId: string) => {
        try {
            const response = await request('DELETE', API_ROUTES.MY_CLIENTS.DELETE.replace('{id}', itemId))
            if (response.success) {
                updateCachedCustomer(itemId)
            }
        } catch (error) {
            console.error(error)
        }
    }

    return {
        requestState,
        addCachedCustomer,
        updateCachedCustomer,
        onRemoveCustomer
    }
}

export default useCustomerActions