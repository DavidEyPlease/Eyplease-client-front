import { API_ROUTES } from "@/constants/api"
import useInfiniteListQuery from "@/hooks/useInfiniteListQuery"
import { CustomerOfClient, ICustomersOfClientFilters } from "@/interfaces/customerOfClients"
import { useMyClientsStore } from "@/store/my-clients"

const useListMyClients = () => {
    const { filters, setFilters, getListQueryKey } = useMyClientsStore(state => state)
    const listQueryKey = getListQueryKey()

    const infiniteQuery = useInfiniteListQuery<CustomerOfClient, ICustomersOfClientFilters>(
        API_ROUTES.MY_CLIENTS.LIST,
        {
            queryParams: filters,
            customQueryKey: listQueryKey,
        }
    )

    return {
        clients: infiniteQuery.data?.pages.flatMap(page => page.items) || [],
        setFilters,
        ...infiniteQuery
    }
}

export default useListMyClients