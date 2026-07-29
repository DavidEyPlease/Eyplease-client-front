import { create } from 'zustand'
import { createListSlice, ListActions, ListState } from './list-store'
import { IPost, IPostsFilters, MainPostSectionTypes, PostArtifactType, PostSectionTypes } from '@/interfaces/posts'
import { QueryKey } from '@tanstack/react-query'
import { queryKeys } from '@/utils/cache'

type State = {
    filters: IPostsFilters
    /** Artefacto pedido al regenerar en esta sesión (el GET no lo informa): afina el ritmo del polling */
    regeneratingArtifacts: Record<string, PostArtifactType>
} & ListState<IPost>

type Actions = {
    setFilters: (filters: Partial<IPostsFilters>) => void
    setRegeneratingArtifact: (postId: string, artifact: PostArtifactType) => void
    getListQueryKey: () => QueryKey
} & ListActions<IPost>

export type PostsStore = State & Actions

export const usePostsStore = create<PostsStore>((set, get) => ({
    ...createListSlice<IPost>()(set),

    filters: {
        post_type: MainPostSectionTypes.UNITY,
        section: PostSectionTypes.BIRTHDAYS
    },
    regeneratingArtifacts: {},
    getListQueryKey: () => queryKeys.list('posts', { ...get().filters }),
    setFilters: (filters) => set((state) => ({ page: 1, filters: { ...state.filters, ...filters } })),
    setRegeneratingArtifact: (postId, artifact) => set((state) => ({
        regeneratingArtifacts: { ...state.regeneratingArtifacts, [postId]: artifact }
    }))
}))
