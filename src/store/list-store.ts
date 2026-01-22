type CursorPaginatorTokens = {
    next: string | null
    previous: string | null
}

export type ListState<T> = {
    items: T[]

    // Pagination properties
    page: number
    perPage: number
    lastPage: number

    // Cursor Pagination properties
    isLastPage: boolean
    cursor: CursorPaginatorTokens

    search: string
    isLoading: boolean
    total: number
    isLoadMore: boolean
    selectedItem: T | null
}

export type ListActions<T> = {
    setPage: (page: number) => void
    setPerPage: (perPage: number) => void
    setLastPage: (lastPage: number) => void
    setSearch: (search: string) => void
    setItems: (data: T[]) => void
    setTotal: (total: number) => void
    setLoading: (loading: boolean) => void
    setIsLoadMore: (isLoadMore: boolean) => void
    setSelectedItem: (item: T | null) => void
    setIsLastPage: (isLastPage: boolean) => void
    setCursorPaginator: (cursor: CursorPaginatorTokens) => void
    resetState: () => void
}

export type ListStore<T> = ListState<T> & ListActions<T>

const INITIAL_STATE = {
    items: [],
    page: 1,
    perPage: 10,
    lastPage: 0,
    search: '',
    isLoading: false,
    total: 0,
    isLastPage: false,
    isLoadMore: false,
    selectedItem: null,

    cursor: {
        next: null,
        previous: null
    }
}

export const createListSlice = <T>() => (set: any): ListStore<T> => ({
    ...INITIAL_STATE,

    setPage: (page) => set({ page }),
    setPerPage: (perPage) => set({ perPage }),
    setSearch: (search) => set({ search, page: 1 }),
    setItems: (items) => set({ items }),
    setTotal: (total) => set({ total }),
    setLoading: (loading) => set({ isLoading: loading }),
    setLastPage: (lastPage) => set({ lastPage }),
    setIsLoadMore: (isLoadMore) => set({ isLoadMore }),
    setSelectedItem: (selectedItem) => set({ selectedItem }),
    setIsLastPage: (isLastPage) => set({ isLastPage }),
    setCursorPaginator: (cursor) => set({ cursor }),
    resetState: () => set(INITIAL_STATE),
})