import { useState } from "react"
import { PencilIcon } from "lucide-react"

import FileSelector from "@/components/generics/FileSelector"
import LoggedUserAvatar from "@/components/generics/LoggedUserAvatar"
import { BROWSER_EVENTS } from "@/constants/app"
import useAuth from "@/hooks/useAuth"
import { IAuthUser } from "@/interfaces/auth"
import { FileTypes } from "@/interfaces/files"
import { getFileType } from "@/utils"
import { publishEvent } from "@/utils/events"

interface Props {
    authUser: IAuthUser
}

/** Foto de perfil con su mini-FAB para cambiarla. */
const ProfilePhoto = ({ authUser }: Props) => {
    const { uploadUserPhoto } = useAuth()
    const [loading, setLoading] = useState(false)

    const onSubmitPhoto = async (file: File) => {
        try {
            setLoading(true)
            const filename = `${authUser.account}_${new Date().getTime()}.${getFileType(file.type)}`
            await uploadUserPhoto(
                file,
                FileTypes.SPONSOR_PHOTO,
                filename,
                'profilePicture'
            )
            publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative">
            {/* Anillo y recorte circular en el envoltorio: el genérico Avatar trae rounded-lg fijo */}
            <div className="overflow-hidden rounded-full border-4 border-card bg-card shadow-card">
                <LoggedUserAvatar user={authUser} sizeClasses="size-20" loading={loading} />
            </div>
            <FileSelector
                fileUploaderComponent={
                    <button
                        type="button"
                        title="Cambiar foto"
                        disabled={loading}
                        className="absolute right-0 bottom-0.5 grid size-7.5 cursor-pointer place-content-center rounded-full border-2 border-card bg-primary-gradient text-white shadow-primary-glow transition-transform hover:scale-108 disabled:pointer-events-none"
                    >
                        <PencilIcon className="size-3.5" aria-hidden />
                    </button>
                }
                onSelectedFile={onSubmitPhoto}
            />
        </div>
    )
}

export default ProfilePhoto
