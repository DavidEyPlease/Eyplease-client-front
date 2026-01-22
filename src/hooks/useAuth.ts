import { useState } from "react"

import HttpService from '@/services/http'
import { ApiResponse, GlobalUtilData } from "@/interfaces/common"
import { useLocation, useNavigate } from "react-router"
import useAuthStore from "@/store/auth"
import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { API_ROUTES } from "@/constants/api"
import { IChangePasswordData, IUser, IUserUpdate } from "@/interfaces/users"
import { toast } from "sonner"
import { FileTypes } from "@/interfaces/files"
import { uploadFile } from "@/utils/files"
import { IAuthUser } from "@/interfaces/auth"
import { PermissionKeys } from "@/interfaces/permissions"

const useAuth = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { user, logout, setUtilData, setAuth, setUser, setInitialLoading } = useAuthStore(state => state)
    const [loadingAction, setLoadingAction] = useState('')
    const [pending, setPending] = useState(true)

    const updateUser = async (data: IUserUpdate) => {
        try {
            const response = await HttpService.put<ApiResponse<IAuthUser>>(API_ROUTES.UPDATE_USER, data)
            if (response.data) {
                setUser(response.data)
                toast.success('Perfil actualizado correctamente')
            }
            return response?.data
        } catch (error) {
            console.error(error)
            toast.error(error?.message || 'Error al actualizar el perfil')
        }
    }

    const getAuthUtilData = async (user: IAuthUser) => {
        const response = await HttpService.get<ApiResponse<GlobalUtilData>>('/util-data')
        if (response.data) {
            setUtilData({
                ...response.data,
                newsletters: response.data.newsletters.filter(({ code }) => user.plan.accesses.find(i => i.permission_key.toString() === code.toString()))
            })
        }
    }

    const handleLogout = () => {
        HttpService.post(API_ROUTES.LOGOUT, {}).finally(() => {
            logout()
            navigate(APP_ROUTES.AUTH.SIGN_IN)
            localStorage.removeItem(SESSION_KEY)
        })
    }

    const hasAccess = (access: PermissionKeys) => {
        const { accesses = [] } = user?.plan || {}
        const accessesKeys = accesses.map(({ permission_key }) => permission_key)
        return accessesKeys.includes(access)
    }

    const getMe = async () => {
        HttpService.getMe<ApiResponse<IAuthUser>>().then(async response => {
            if (response.data) {
                const { plan } = response.data
                setAuth(response.data, plan.accesses.filter(i => i.permission_key).map(({ permission_key }) => permission_key))
                if (['/', APP_ROUTES.AUTH.SIGN_IN].includes(location.pathname)) {
                    navigate(APP_ROUTES.HOME.INITIAL)
                }
                await getAuthUtilData(response.data)
            } else {
                navigate(APP_ROUTES.AUTH.SIGN_IN)
            }
        }).catch(() => {
            if (!Object.values(APP_ROUTES.AUTH).includes(location.pathname)) {
                navigate(APP_ROUTES.AUTH.SIGN_IN)
            }
        }).finally(() => {
            setPending(false)
            setInitialLoading(false)
        })
    }

    const uploadUserPhoto = async (file: File, type: FileTypes, uri: string, filename: string, updateKey?: keyof IUserUpdate) => {
        try {
            const fileKey = await uploadFile({
                file, fileType: type, filename: `${uri}/${filename}`
            })
            if (fileKey && updateKey) {
                await updateUser({ [updateKey]: filename })
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al subir la foto de perfil')
        }
    }

    const changePassword = async (data: IChangePasswordData) => {
        try {
            setLoadingAction('changePassword')
            const response = await HttpService.post<ApiResponse<IUser>>(API_ROUTES.CHANGE_PASSWORD, data)
            if (response.success && response.data) {
                toast.success(response.message || 'Contraseña modificada correctamente')
                handleLogout()
                localStorage.removeItem(SESSION_KEY)
                navigate(APP_ROUTES.AUTH.SIGN_IN)
            }
        } catch (error) {
            console.error(error)
            toast.error('Error al cambiar la contraseña')
        } finally {
            setLoadingAction('')
        }
    }

    return {
        pending,
        user,
        isLogged: !!user,
        loadingAction,
        getAuthUtilData,
        setUser,
        hasAccess,
        uploadUserPhoto,
        getMe,
        handleLogout,
        updateUser,
        changePassword
    }
}

export default useAuth