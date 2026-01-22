import { create } from 'zustand'
import { createListSlice, ListActions, ListState } from './list-store'
import { CustomerOfClient, ICustomersOfClientFilters } from '@/interfaces/customerOfClients'

type State = {
    filters: ICustomersOfClientFilters
} & ListState<CustomerOfClient>

type Actions = {
    setFilters: (filters: Partial<ICustomersOfClientFilters>) => void
} & ListActions<CustomerOfClient>

export type MyClientsStore = State & Actions

export const useMyClientsStore = create<MyClientsStore>((set) => ({
    ...createListSlice<CustomerOfClient>()(set),

    filters: {
        letter: ''
    },

    setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } }))
}))