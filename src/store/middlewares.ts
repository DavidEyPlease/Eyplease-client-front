import { StoreApi } from 'zustand'

export const resetAllAction = 'RESET_ALL' as const

type State = Record<string, any>

type Set<T = State> = {
    (partial: T | Partial<T> | ((state: T) => T | Partial<T>), replace?: false): void
    (state: T | ((state: T) => T), replace: true): void
}

type ResetAction = {
    type: typeof resetAllAction
}

export const resetters = <T extends State>(
    config: (
        set: (
            nextStateOrUpdater: T | Partial<T> | ((state: T) => T | Partial<T>) | ResetAction,
            shouldReplace?: boolean
        ) => void,
        get: () => T,
        api: StoreApi<T>
    ) => T
) => (
    set: Set<T>,
    get: () => T,
    api: StoreApi<T>
) => {
        return config(
            (...args) => {
                set(...(args as [any, any?]))
                if ((args[0] as ResetAction)?.type === resetAllAction) {
                    Object.keys(api.getState()).forEach((key) => {
                        const state = api.getState()
                        if (typeof state[key]?.reset === 'function') {
                            state[key].reset()
                        }
                    })
                }
            },
            get,
            api
        )
    }