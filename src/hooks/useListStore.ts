import { useEffect } from 'react'
import HttpService from '@/services/http'
import { ApiResponse, CursorPaginationResponse, PaginationResponse } from '@/interfaces/common'
import { ListStore } from '@/store/list-store'

type UseListStoreParams = {
    endpoint: string
    filters?: Record<string, any>
    options?: {
        isPaginated?: boolean
        cursorPaginator?: boolean
        infiniteScroll?: boolean
    }
}

export const useListStore = <S>({
    endpoint,
    filters,
    options = { isPaginated: true, cursorPaginator: false, infiniteScroll: true } }: UseListStoreParams,
    store: ListStore<S>
) => {
    const onLoadMore = async (
        paginatorType: 'page' | 'cursor' = 'page',
        callback?: () => void
    ) => {
        store.setIsLoadMore(true)
        if (paginatorType === 'page') {
            store.setPage(store.page + 1)
        }
        if (paginatorType === 'cursor' && callback) {
            callback()
        }
    }

    const setItems = (items: S[]) => {
        if ((options.cursorPaginator && !store.cursor?.next) || (options.isPaginated && store.page === 1)) {
            store.setItems(items)
        } else {
            store.setItems(options.infiniteScroll ? [...store.items, ...items] : items)
        }
        // store.setItems(items)
    }

    const request = async <T>(url: string) => {
        const result = await HttpService.get<T>(url)
        return result
    }

    const fetchData = async () => {
        try {
            store.setLoading(true)
            const params = new URLSearchParams()
            const { page, search, perPage: per_page } = store

            const defaultParams = {
                search,
                per_page,
                ...(options.cursorPaginator ? { cursor: store.cursor?.next } : { page })
            }
            Object.entries({ ...defaultParams, ...(filters ? filters : {}) }).forEach(([key, value]) => {
                params.append(key, value as string)
            })
            const parseUrl = `${endpoint}?${params.toString()}`
            // console.log('options', options)
            if (options?.isPaginated) {
                console.log('isPaginated')
                const result = await request<ApiResponse<PaginationResponse<any>>>(parseUrl)
                setItems(result.data.items)
                store.setTotal(result.data.total_items)
                store.setLastPage(result.data.last_page)
            } else if (options?.cursorPaginator) {
                console.log('cursorPaginator')
                const result = await request<ApiResponse<CursorPaginationResponse<any>>>(parseUrl)
                setItems(result.data.items)
                store.setIsLastPage(result.data.last_page || false)
                store.setCursorPaginator({
                    next: result.data.pagination_token,
                    previous: result.data.previous_pagination_token
                })
            } else {
                console.log('no paginator')
                const result = await request<ApiResponse<any>>(parseUrl)
                store.setItems(result.data)
            }
        } catch (e) {
            console.log(e)
        } finally {
            store.setLoading(false)
            store.setIsLoadMore(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [endpoint, store.search, filters, store.page, store.perPage])

    useEffect(() => {
        return () => {
            store.resetState()
        }
    }, [])

    return {
        onLoadMore,
        fetchData,
        ...store
    }
}