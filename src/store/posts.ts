import { create } from 'zustand'
import { createListSlice, ListActions, ListState } from './list-store'
import { IPost, IPostsFilters, MainPostSectionTypes, PostSectionTypes } from '@/interfaces/posts'

type State = {
    filters: IPostsFilters
} & ListState<IPost>

type Actions = {
    setFilters: (filters: Partial<IPostsFilters>) => void
} & ListActions<IPost>

export type PostsStore = State & Actions

export const usePostsStore = create<PostsStore>((set) => ({
    ...createListSlice<IPost>()(set),

    filters: {
        mainSection: MainPostSectionTypes.UNITY,
        section: PostSectionTypes.BIRTHDAYS
    },

    setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } }))
}))