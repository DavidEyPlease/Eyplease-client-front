import { create } from 'zustand'
import { createListSlice, ListActions, ListState } from './list-store'
import { UserRequestService } from '@/interfaces/requestService'

type RequestServiceActionType = 'view' | 'create' | 'edit' | 'none' | 'uploadFiles'

type State = {
    openAction: RequestServiceActionType
} & ListState<UserRequestService>

type Actions = {
    setOpenAction: (action: RequestServiceActionType) => void
} & ListActions<UserRequestService>

export type RequestServicesStore = State & Actions

export const useRequestServicesStore = create<RequestServicesStore>((set) => ({
    ...createListSlice<UserRequestService>()(set),
    openAction: 'none',
    setOpenAction: (action: RequestServiceActionType) => set(() => ({ openAction: action }))
}))