import { create } from 'zustand'
import { QueryKey } from '@tanstack/react-query'
import { createListSlice, ListActions, ListState } from './list-store'
import { resetters } from './middlewares'
import { queryKeys } from '@/utils/cache'
import { ISponsored, VendorFilterType } from '@/interfaces/sponsored'

type GalleryFilters = {
    vendorRole: VendorFilterType
    letter: string
    search?: string
}

type State = {
    filters: GalleryFilters
} & ListState<ISponsored>

type Actions = {
    setFilters: (filters: Partial<GalleryFilters>) => void
    getListQueryKey: () => QueryKey
} & ListActions<ISponsored>

export type GalleryStore = State & Actions

export const useGalleryStore = create<GalleryStore>(
    resetters((set, get) => ({
        ...createListSlice<ISponsored>()(set),

        filters: {
            vendorRole: 'unity',
            letter: '',
            search: '',
        },

        setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } })),
        getListQueryKey: () => queryKeys.list('gallery', get().filters),
    }))
)