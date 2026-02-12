import { useMemo } from "react"
import { InfiniteData, QueryKey, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"

import { UseQueryFetchOptions } from "@/interfaces/tanstack-query.types"
import HttpService from '@/services/http'
import { ApiResponse, PaginationResponse, QueryParams } from '@/interfaces/common'
import { objectToQueryParams } from "@/utils"

interface UseInfiniteListOptions<F> extends UseQueryFetchOptions {
    queryParams?: QueryParams<F>
    filters?: F
}

export default function useInfiniteListQuery<T, F = unknown>(apiEndpoint: string, options: UseInfiniteListOptions<F> = {}) {
    const {
        queryParams = {},
        customQueryKey,
        staleTime = 120_000,
        enabled = true,
        refetchOnWindowFocus = false,
        refetchOnMount = false,
    } = options

    const queryClient = useQueryClient()

    const queryKey = useMemo(() => {
        return customQueryKey || ['fetch', apiEndpoint, queryParams]
    }, [customQueryKey, apiEndpoint, queryParams])

    const fetcher = async (page?: number) => {
        const mergedParams = {
            ...queryParams,
            ...(page ? { page } : {})
        }

        const qParams = objectToQueryParams({ ...mergedParams })

        const fullUrl = qParams ? `${apiEndpoint}?${qParams}` : apiEndpoint
        const response = await HttpService.get<ApiResponse<PaginationResponse<T>>>(fullUrl)
        return response.data
    }

    const infiniteQuery = useInfiniteQuery<PaginationResponse<T>, Error, InfiniteData<PaginationResponse<T>>, QueryKey, number>({
        queryKey,
        initialPageParam: 1,
        queryFn: ({ pageParam }) => fetcher(pageParam),
        getNextPageParam: (lastPage) => {
            if (lastPage.current_page >= lastPage.last_page) {
                return undefined
            }
            return lastPage.current_page + 1
        },
        staleTime,
        enabled,
        refetchOnWindowFocus,
        refetchOnMount,
    })

    const handleRefresher = async () => {
        queryClient.removeQueries({ queryKey })
        await infiniteQuery.refetch()
    }

    return {
        ...infiniteQuery,
        handleRefresher
    }
}
