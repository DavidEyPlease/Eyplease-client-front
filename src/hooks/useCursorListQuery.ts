import { useMemo } from 'react'
import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query'

import HttpService from '@/services/http'
import { ApiResponse, CursorPaginationResponse } from '@/interfaces/common'
import { UseQueryFetchOptions } from '@/interfaces/tanstack-query.types'

/**
 * Listado infinito por cursor (cursorPaginate de Laravel): cada página trae
 * pagination_token y la siguiente se pide con ?cursor=. Complementa a
 * useInfiniteListQuery, que pagina por número de página.
 */
export default function useCursorListQuery<T>(apiEndpoint: string, options: UseQueryFetchOptions = {}) {
	const {
		customQueryKey,
		staleTime = 120_000,
		enabled = true,
		refetchOnWindowFocus = false,
	} = options

	const queryKey = useMemo(() => {
		return customQueryKey || ['fetch-cursor', apiEndpoint]
	}, [customQueryKey, apiEndpoint])

	const fetcher = async (cursor: string | null) => {
		const fullUrl = cursor ? `${apiEndpoint}?cursor=${encodeURIComponent(cursor)}` : apiEndpoint
		const response = await HttpService.get<ApiResponse<CursorPaginationResponse<T>>>(fullUrl)
		return response.data
	}

	const infiniteQuery = useInfiniteQuery<CursorPaginationResponse<T>, Error, InfiniteData<CursorPaginationResponse<T>>, QueryKey, string | null>({
		queryKey,
		initialPageParam: null,
		queryFn: ({ pageParam }) => fetcher(pageParam),
		getNextPageParam: (lastPage) => (lastPage.last_page ? undefined : lastPage.pagination_token),
		staleTime,
		enabled,
		refetchOnWindowFocus,
	})

	const items = useMemo(
		() => infiniteQuery.data?.pages.flatMap(page => page.items) ?? [],
		[infiniteQuery.data],
	)

	return {
		...infiniteQuery,
		items,
	}
}
