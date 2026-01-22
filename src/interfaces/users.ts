import { FileUrls } from "./common"
import { IPlan } from "./plans"

export interface ClientRole {
    name: string
    slug: string
}

export interface IUser {
    id: string
    name: string
    email: string
    profile_picture: FileUrls | null
    account: string
    country: string
    phone: string
    client_role: ClientRole
    logotype: FileUrls | null
    on_notifications: boolean
    on_biometric_auth: boolean
    plan: IPlan
    canva_connected: boolean
}

export interface IUserUpdate {
    name?: string
    email?: string
    phone?: string
    onNotifications?: boolean
    onBiometricAuthentication?: boolean
    profilePicture?: string
    logotype?: string
}

export interface IChangePasswordData {
    currentPassword: string
    newPassword: string
    confirmPassword: string
}