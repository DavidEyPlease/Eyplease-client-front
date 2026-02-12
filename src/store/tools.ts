import { create } from 'zustand'
import { QueryKey } from '@tanstack/react-query'
import { createListSlice, ListActions, ListState } from './list-store'
import { queryKeys } from '@/utils/cache'
import { ITool, IToolsFilters, ToolSectionTypes } from '@/interfaces/tools'

type State = {
    filters: IToolsFilters
} & ListState<ITool>

type Actions = {
    setFilters: (filters: Partial<IToolsFilters>) => void
    getListQueryKey: () => QueryKey
} & ListActions<ITool>

export type ToolStore = State & Actions

export const useToolsStore = create<ToolStore>((set, get) => ({
    ...createListSlice<ITool>()(set),

    filters: {
        cursor: null,
        section: ToolSectionTypes.STAY_INFORMED
    },

    setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } })),
    getListQueryKey: () => queryKeys.list('tools', { section: get().filters.section }),
}))