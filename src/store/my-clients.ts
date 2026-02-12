import { create } from 'zustand'
import { createListSlice, ListActions, ListState } from './list-store'
import { CustomerOfClient, ICustomersOfClientFilters } from '@/interfaces/customerOfClients'
import { queryKeys } from '@/utils/cache'
import { QueryKey } from '@tanstack/react-query'

type State = {
    filters: ICustomersOfClientFilters
} & ListState<CustomerOfClient>

type Actions = {
    setFilters: (filters: Partial<ICustomersOfClientFilters>) => void
    getListQueryKey: () => QueryKey
} & ListActions<CustomerOfClient>

export type MyClientsStore = State & Actions

export const useMyClientsStore = create<MyClientsStore>((set, get) => ({
    ...createListSlice<CustomerOfClient>()(set),

    filters: {
        letter: ''
    },
    getListQueryKey: () => queryKeys.list('my-clients', get().filters),
    setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } }))
}))