import { IAuthUser } from "@/interfaces/auth"
import Logotype from "./Logotype"
import ProfilePhoto from "./ProfilePhoto"

interface Props {
    user: IAuthUser
}

/** Tarjeta de identidad: portada de marca, foto, nombre, cuenta y logotipo. */
const IdentityCard = ({ user }: Props) => {
    return (
        <div className="overflow-hidden rounded-3xl border bg-card shadow-card">
            <div className="h-20 bg-auth-panel" />
            <div className="-mt-10 flex flex-col items-center gap-2.5 px-4 pb-5 text-center">
                <ProfilePhoto authUser={user} />
                <div>
                    <h2 className="text-[17px] leading-snug font-extrabold tracking-tight">{user.name}</h2>
                    <p className="text-xs font-semibold text-muted-foreground">{user.account}</p>
                </div>
                <Logotype user={user} />
            </div>
        </div>
    )
}

export default IdentityCard
