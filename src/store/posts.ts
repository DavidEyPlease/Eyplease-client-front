import { create } from 'zustand'
import { createListSlice, ListActions, ListState } from './list-store'
import { IPost, IPostsFilters, MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'
import { QueryKey } from '@tanstack/react-query'
import { queryKeys } from '@/utils/cache'

type State = {
    filters: IPostsFilters
} & ListState<IPost>

type Actions = {
    setFilters: (filters: Partial<IPostsFilters>) => void
    getListQueryKey: () => QueryKey
} & ListActions<IPost>

export type PostsStore = State & Actions

export const usePostsStore = create<PostsStore>((set, get) => ({
    ...createListSlice<IPost>()(set),

    filters: {
        post_type: MainPostSectionTypes.UNITY,
        section: PostSectionTypes.BIRTHDAYS
    },
    getListQueryKey: () => queryKeys.list('posts', { ...get().filters }),
    setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } }))
}))