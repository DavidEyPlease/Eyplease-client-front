import { QueryKey } from "@tanstack/react-query"

export interface UseQueryFetchOptions {
    customQueryKey?: QueryKey
    // additional options for react-query
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    refetchOnMount?: boolean
}

export type QueryParams = { paginationToken?: string | null, perPage?: number, search?: string, page?: number } | Record<string, any>