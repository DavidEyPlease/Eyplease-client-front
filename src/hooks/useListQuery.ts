import { QueryKey } from '@tanstack/react-query'

import { ApiResponse } from '@/interfaces/common'
import useFetchQuery from './useFetchQuery'
import useListBase from './useListBase'

type UseListInitResult<T, F> = {
    response: ApiResponse<T> | undefined;
    isLoading: boolean;
    page: number;
    search: string;
    error: Error | null;
    orderBy: string;
    perPage: number;
    // sort: SortDirectionTypes;
    filters: Partial<F>;
    setData: (_data: T) => void;
    // setFilters: (_filters: FilterValues) => void;
    setSearch: (_query: string) => void;
    setFilter: (_values: Partial<F>) => void;
    onChangePage: (_page: number) => void;
    setSortBy: (_sortBy: string) => void;
    fetchRetry: () => void;
    setPerPage: (_perPage: number) => void;
    onChangeFilter: (_key: string, _value: unknown) => void;
};

type UseListInitParams<F = unknown> = {
    endpoint: string;
    defaultPerPage?: number
    defaultSearch?: string;
    defaultPage?: number;
    sortActive?: string;
    customQueryKey?: QueryKey | ((params: Record<string, unknown>) => QueryKey)
    defaultFilters?: F extends object ? Partial<F> : never;
    staleTime?: number
    cacheTime?: number
    enabled?: boolean
    refetchOnWindowFocus?: boolean
}

const useListQuery = <T, F = unknown>({
    endpoint,
    sortActive = '',
    defaultPerPage = 15,
    defaultSearch = '',
    defaultPage = 1,
    defaultFilters,
    customQueryKey,
    staleTime,
    cacheTime,
    enabled,
    refetchOnWindowFocus
}: UseListInitParams<F>): UseListInitResult<T, F> => {

    // Usar la lógica base compartida
    const {
        search,
        page,
        perPage,
        filters,
        orderBy,
        queryParams,
        setSearch,
        setFilter,
        onChangePage,
        setSortBy,
        setPerPage,
        onChangeFilter,
        generateQueryKey
    } = useListBase<F>({
        defaultPerPage,
        defaultSearch,
        defaultPage,
        sortActive,
        defaultFilters
    })

    const generatedQueryKey = generateQueryKey(endpoint, customQueryKey)

    const {
        error,
        loading: isLoading,
        response: apiResponse,
        setData,
        fetchRetry,
    } = useFetchQuery<T>(endpoint, {
        queryParams,
        customQueryKey: generatedQueryKey,
        staleTime,
        cacheTime,
        enabled,
        refetchOnWindowFocus,
    })

    return {
        response: apiResponse,
        filters,
        isLoading,
        error,
        page,
        orderBy,
        search,
        perPage,
        setPerPage,
        setFilter,
        fetchRetry,
        setData,
        setSearch,
        onChangePage,
        onChangeFilter,
        setSortBy,
    }
}

export default useListQuery