import { useState, useMemo, useCallback } from 'react'
import { QueryKey } from '@tanstack/react-query'

export type UseListBaseParams<F = unknown> = {
    defaultPerPage?: number
    defaultSearch?: string;
    defaultPage?: number;
    sortActive?: string;
    defaultFilters?: F extends object ? Partial<F> : never;
}

export type UseListBaseResult<F> = {
    search: string;
    page: number;
    perPage: number;
    filters: Partial<F>;
    orderBy: string;
    queryParams: Record<string, unknown>;
    setSearch: (_query: string) => void;
    setFilter: (_values: Partial<F>) => void;
    onChangePage: (_page: number) => void;
    setSortBy: (_sortBy: string) => void;
    setPerPage: (_perPage: number) => void;
    onChangeFilter: (_key: string, _value: unknown) => void;
    resetPage: () => void;
    generateQueryKey: (endpoint: string, customQueryKey?: QueryKey | ((params: Record<string, unknown>) => QueryKey)) => QueryKey;
}

const useListBase = <F = unknown>({
    defaultPerPage = 15,
    defaultSearch = '',
    defaultPage = 1,
    sortActive = '',
    defaultFilters,
}: UseListBaseParams<F>): UseListBaseResult<F> => {
    const [search, setSearch] = useState(defaultSearch)
    const [page, setPage] = useState(defaultPage)
    const [perPage, setPerPage] = useState(defaultPerPage)
    const [filters, setFilters] = useState<Partial<F>>(defaultFilters || {})
    const [orderBy, setSortBy] = useState(sortActive)

    const queryParams = useMemo(() => {
        return { search, page, perPage, orderBy, ...filters }
    }, [search, page, perPage, orderBy, filters])

    const generateQueryKey = useCallback((endpoint: string, customQueryKey?: QueryKey | ((params: Record<string, unknown>) => QueryKey)): QueryKey => {
        if (typeof customQueryKey === 'function') return customQueryKey(queryParams)
        return customQueryKey || ['list', endpoint, queryParams]
    }, [queryParams])

    const handleSearch = useCallback((newQuery: string) => {
        setSearch(newQuery)
        setPage(1)
    }, [])

    const setFilter = useCallback((newFilters: Partial<F>) => {
        const onlyWithValues = Object.fromEntries(
            Object.entries({ ...filters, ...newFilters }).filter(([, value]) => {
                const typeofValue = typeof value

                if (['string', 'number', 'boolean'].includes(typeofValue)) return value !== ''
                if (typeofValue === 'object') {
                    if (Array.isArray(value)) return value.length > 0
                    return value && Object.values(value).some(i => i !== '')
                }
            }),
        ) as Partial<F>
        setFilters(onlyWithValues)
        setPage(1)
    }, [filters])

    const onChangeFilter = useCallback((key: string, value: unknown) => {
        setFilters(prev => ({ ...prev, [key]: value }))
        setPage(1)
    }, [])

    const resetPage = useCallback(() => {
        setPage(1)
    }, [])

    return {
        search,
        page,
        perPage,
        filters,
        orderBy,
        queryParams,
        setSearch: handleSearch,
        setFilter,
        onChangePage: setPage,
        setSortBy,
        setPerPage,
        onChangeFilter,
        resetPage,
        generateQueryKey,
    }
}

export default useListBase