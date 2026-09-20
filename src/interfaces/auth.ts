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
    /**
     * Las otras cuentas de la MISMA persona (su unidad de otro país). Vacío para casi todas:
     * el selector sólo se pinta cuando hay más de una. El `id` es OPACO — no es el id de la
     * cuenta, sino el de la liga — y es lo único que entiende el endpoint de cambio.
     */
    accounts?: ILinkedAccount[]
}

export interface ILinkedAccount {
    id: string
    account: string
    country: string
    name: string
    plan: string | null
    active: boolean
    current: boolean
}