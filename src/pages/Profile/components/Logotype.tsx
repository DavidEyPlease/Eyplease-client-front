import { useState } from "react"
import { ImageIcon, PencilIcon } from "lucide-react"

import Spinner from "@/components/common/Spinner"
import FileSelector from "@/components/generics/FileSelector"
import { BROWSER_EVENTS } from "@/constants/app"
import useAuth from "@/hooks/useAuth"
import { IAuthUser } from "@/interfaces/auth"
import { FileTypes } from "@/interfaces/files"
import { getFileType } from "@/utils"
import { publishEvent } from "@/utils/events"

interface Props {
    user: IAuthUser
}

/** Chip del logotipo del cliente: se estampa en sus diseños, todo el chip cambia el archivo. */
const Logotype = ({ user }: Props) => {
    const { uploadUserPhoto } = useAuth()
    const [loading, setLoading] = useState(false)

    const onSubmitPhoto = async (file: File) => {
        try {
            setLoading(true)
            const filename = `${FileTypes.USER_LOGOTYPE}-${user?.account}.${getFileType(file.type)}`
            await uploadUserPhoto(
                file,
                FileTypes.USER_LOGOTYPE,
                filename,
                'logotype'
            )
            publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <FileSelector
            fileUploaderComponent={
                <button
                    type="button"
                    disabled={loading}
                    className="flex cursor-pointer items-center gap-2.5 rounded-2xl border bg-surface-soft p-1.5 pr-3 text-left transition-colors hover:border-primary/25 hover:bg-card disabled:pointer-events-none"
                >
                    <span className="grid size-14 shrink-0 place-content-center overflow-hidden rounded-xl border bg-card text-muted-foreground/50">
                        {loading
                            ? <Spinner size="xs" color="primary" className="w-auto" />
                            : user.logotype?.url
                                ? <img src={user.logotype.url} alt="Logotipo" className="size-full object-contain" />
                                : <ImageIcon className="size-5" aria-hidden />}
                    </span>
                    <span className="min-w-0">
                        <span className="block text-[12.5px] leading-tight font-extrabold tracking-tight">Tu logotipo</span>
                        <span className="block text-[10.5px] font-semibold text-muted-foreground">
                            {user.logotype?.url ? 'Cambiar' : 'Súbelo para tus diseños'}
                        </span>
                    </span>
                    <PencilIcon className="size-3 shrink-0 text-primary" aria-hidden />
                </button>
            }
            onSelectedFile={onSubmitPhoto}
        />
    )
}

export default Logotype
