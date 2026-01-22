import { useMemo, useCallback } from 'react'
import { useInfiniteQuery, QueryKey, useQueryClient, InfiniteData } from '@tanstack/react-query'

import { ApiResponse, PaginationResponse, CursorPaginationResponse } from '@/interfaces/common'
import HttpService from '@/services/http'
import useListBase from './useListBase'

// Nuevo tipo para especificar el tipo de paginación
type PaginationType = 'page' | 'cursor'

// Tipo híbrido para la respuesta
type HybridPaginationResponse<T> = PaginationResponse<T> | CursorPaginationResponse<T>

type UseInfiniteListResult<T, F> = {
    data: T[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasNextPage: boolean;
    search: string;
    error: Error | null;
    orderBy: string;
    perPage: number;
    filters: Partial<F>;
    totalItems: number;
    currentPage: number;
    currentCursor?: string | null;
    setSearch: (_query: string) => void;
    setFilter: (_values: Partial<F>) => void;
    setSortBy: (_sortBy: string) => void;
    setPerPage: (_perPage: number) => void;
    onChangeFilter: (_key: string, _value: unknown) => void;
    loadMore: () => void;
    refetch: () => void;
    reset: () => void;
    updateItems: (_newItems: T[]) => void;
};

type UseInfiniteListParams<F = unknown> = {
    endpoint: string;
    defaultPerPage?: number
    defaultSearch?: string;
    sortActive?: string;
    customQueryKey?: QueryKey | ((params: Record<string, unknown>) => QueryKey)
    defaultFilters?: F extends object ? Partial<F> : never;
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
    paginationType?: PaginationType; // Nuevo parámetro
}

const useInfiniteListQuery = <T, F = unknown>({
    endpoint,
    sortActive = '',
    defaultPerPage = 15,
    defaultSearch = '',
    defaultFilters,
    customQueryKey,
    staleTime,
    cacheTime,
    enabled = true,
    paginationType = 'page' // Default a paginación tradicional
}: UseInfiniteListParams<F>): UseInfiniteListResult<T, F> => {
    const queryClient = useQueryClient()

    const {
        search,
        perPage,
        filters,
        orderBy,
        queryParams: baseQueryParams,
        setSearch,
        setFilter,
        setSortBy,
        setPerPage,
        onChangeFilter,
        generateQueryKey
    } = useListBase<F>({
        defaultPerPage,
        defaultSearch,
        sortActive,
        defaultFilters
    })

    const infiniteQueryKey = useMemo(() => {
        const baseKey = generateQueryKey(endpoint, customQueryKey)
        if (Array.isArray(baseKey)) {
            return ['infinite', ...baseKey.slice(1)]
        }
        return ['infinite', baseKey]
    }, [generateQueryKey, endpoint, customQueryKey])

    // Fetcher para infinite query híbrido
    const fetcher = useCallback(async ({ pageParam }: { pageParam: unknown }) => {
        const params = new URLSearchParams()

        let queryParamsWithPagination: Record<string, unknown>

        if (paginationType === 'cursor') {
            // Para cursor: usar pagination_token en lugar de page
            queryParamsWithPagination = {
                ...baseQueryParams
            }
            if (pageParam) {
                queryParamsWithPagination.pagination_token = pageParam
            }
            // Remover 'page' si existe
            delete queryParamsWithPagination.page
        } else {
            // Para paginación tradicional: usar page
            queryParamsWithPagination = {
                ...baseQueryParams,
                page: pageParam || 1
            }
        }

        Object.entries(queryParamsWithPagination).forEach(([key, value]) => {
            if (value !== undefined && value !== null && (typeof value !== 'string' || value !== '')) {
                if (Array.isArray(value)) {
                    value.forEach(v => {
                        params.append(`${key}[]`, String(v))
                    })
                } else {
                    params.append(key, String(value))
                }
            }
        })

        const fullUrl = params.toString() ? `${endpoint}?${params.toString()}` : endpoint
        return await HttpService.get<ApiResponse<HybridPaginationResponse<T>>>(fullUrl)
    }, [endpoint, baseQueryParams, paginationType])

    // Función híbrida para getNextPageParam
    const getNextPageParam = useCallback((lastPage: ApiResponse<HybridPaginationResponse<T>>) => {
        const pagination = lastPage.data

        if (paginationType === 'cursor') {
            // Para cursor: verificar last_page y pagination_token
            const cursorData = pagination as CursorPaginationResponse<T>
            return !cursorData.last_page && cursorData.pagination_token
                ? cursorData.pagination_token
                : undefined
        } else {
            // Para paginación tradicional: comparar current_page con last_page
            const pageData = pagination as PaginationResponse<T>
            return pageData.current_page < pageData.last_page
                ? pageData.current_page + 1
                : undefined
        }
    }, [paginationType])

    const {
        data,
        error,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useInfiniteQuery({
        queryKey: infiniteQueryKey,
        queryFn: fetcher,
        getNextPageParam,
        initialPageParam: paginationType === 'cursor' ? null : 1, // Parámetro inicial dinámico
        staleTime,
        gcTime: cacheTime,
        enabled,
    })

    // Flatten all pages data into a single array
    const flattenedData = useMemo(() => {
        return data?.pages.flatMap(page => page.data.items) || []
    }, [data])

    const totalItems = useMemo(() => {
        if (!data?.pages[0]) return 0

        const firstPage = data.pages[0].data

        if (paginationType === 'cursor') {
            // Para cursor: calcular basado en items cargados (no hay total exacto)
            return flattenedData.length
        } else {
            // Para paginación tradicional: usar total_items
            return (firstPage as PaginationResponse<T>).total_items || 0
        }
    }, [data, paginationType, flattenedData.length])

    const currentPage = useMemo(() => {
        if (paginationType === 'cursor') {
            // Para cursor: número de páginas cargadas
            return data?.pages.length || 0
        } else {
            // Para paginación tradicional: página actual del último conjunto
            const lastPage = data?.pages[data.pages.length - 1]?.data as PaginationResponse<T>
            return lastPage?.current_page || 0
        }
    }, [data, paginationType])

    const loadMore = useCallback(() => {
        if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
        }
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    const reset = useCallback(() => {
        refetch()
    }, [refetch])

    const updateItems = useCallback((newItems: T[]) => {
        queryClient.setQueryData(infiniteQueryKey, (oldData: InfiniteData<ApiResponse<HybridPaginationResponse<T>>>) => {
            if (!oldData) return oldData

            // Mapear sobre todas las páginas
            return {
                ...oldData,
                pages: oldData.pages.map(page => ({
                    ...page,
                    data: {
                        ...page.data,
                        // Mapear sobre los items de cada página
                        items: newItems
                    }
                })),
                // Mantener otras propiedades como pageParams
                pageParams: oldData.pageParams
            }
        })
    }, [queryClient, infiniteQueryKey])

    // console.log(data)

    return {
        data: flattenedData,
        isLoading,
        isFetchingNextPage,
        hasNextPage: hasNextPage || false,
        currentCursor: paginationType === 'cursor' ? (data?.pages[data.pages.length - 1]?.data as CursorPaginationResponse<T>)?.pagination_token : undefined,
        error: error as Error | null,
        search,
        orderBy,
        perPage,
        filters,
        totalItems,
        currentPage,
        updateItems,
        setSearch,
        setFilter,
        setSortBy,
        setPerPage,
        onChangeFilter,
        loadMore,
        refetch: reset,
        reset,
    }
}

export default useInfiniteListQuery