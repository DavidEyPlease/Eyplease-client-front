import { SIDEBAR_ITEMS } from '@/constants/app'
import { IAuthUser } from '@/interfaces/auth'
import { GlobalUtilData, MenuItem } from '@/interfaces/common'
import { PermissionKeys } from '@/interfaces/permissions'
import { create } from 'zustand'

type State = {
    initialLoading: boolean
    user: IAuthUser | null
    utilData: GlobalUtilData
    sidebarMenu: MenuItem[]
    permissions: PermissionKeys[]
}

type Actions = {
    setUser: (user: IAuthUser) => void
    logout: () => void
    setUtilData: (utilData: GlobalUtilData) => void
    setAuth: (user: IAuthUser, permissionKeys: PermissionKeys[]) => void
    setInitialLoading: (loading: boolean) => void
}

const useAuthStore = create<State & Actions>((set) => ({
    user: null,
    permissions: [],
    sidebarMenu: [],
    initialLoading: true,
    utilData: {
        templates: [],
        newsletters: [],
        faqs: [],
        plans: [],
        task_categories: [],
    },
    setAuth: (user: IAuthUser, permissionKeys: PermissionKeys[]) => set(() => {
        const sidebarMenu = SIDEBAR_ITEMS.filter(item => {
            if (!item.requiredPermission) return true
            return permissionKeys.some(key => item.permissionKeys?.includes(key))
        }).map(item => {
            if (item.children) {
                const children = item.children.filter(child => {
                    if (!child.requiredPermission) return true
                    return permissionKeys.some(key => child.permissionKeys?.includes(key))
                })
                return { ...item, children }
            }
            return item
        })
        return { user, sidebarMenu, permissions: permissionKeys }
    }),
    setUser: (user: IAuthUser) => set({ user }),
    logout: () => set({ user: null }),
    setUtilData: (utilData: GlobalUtilData) => set({ utilData }),
    setInitialLoading: (initialLoading) => set({ initialLoading }),
}))

export default useAuthStore