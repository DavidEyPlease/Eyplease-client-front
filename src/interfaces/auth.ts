import { FileUrls } from "./common"
import { IPlan } from "./plans"
import { ClientRole } from "./users"

type Photo = FileUrls & {
    has_photo: boolean
    filename: string
}

export interface IAuthUser {
    id: string
    user_id: string
    name: string
    email: string
    profile_picture: Photo | null
    account: string
    country: string
    phone: string
    client_role: ClientRole
    logotype: FileUrls | null
    on_notifications: boolean
    on_biometric_auth: boolean
    plan: IPlan
    canva_connected: boolean
    template_id: string | null
}