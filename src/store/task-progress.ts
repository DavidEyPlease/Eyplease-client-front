import { create } from 'zustand'

type State = {
    taskProgressText: string
}

type Actions = {
    setTaskProgressText: (text: string) => void
}

export type TaskProgressStore = State & Actions

export const useTaskProgressStore = create<TaskProgressStore>((set) => ({
    taskProgressText: '',
    setTaskProgressText: (text) => set({ taskProgressText: text })
}))