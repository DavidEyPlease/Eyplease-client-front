import { useState } from "react"

import Button from "@/components/common/Button"
import Avatar from "@/components/generics/Avatar"
import FileSelector from "@/components/generics/FileSelector"
import { IconEdit } from "@/components/Svg/IconEdit"
import useAuth from "@/hooks/useAuth"
import { IAuthUser } from "@/interfaces/auth"
import { FileTypes } from "@/interfaces/files"
import { getFileType } from "@/utils"
import { BROWSER_EVENTS } from "@/constants/app"
import { publishEvent } from "@/utils/events"

interface Props {
    user: IAuthUser
}

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
                `public/network-people/${user?.id}/logotypes`,
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
        <div className="relative">
            <Avatar
                src={user?.logotype?.url || ''}
                alt="Logo"
                sizeClasses="w-16 h-16"
                className="border border-primary"
                loading={loading}
            />
            <FileSelector
                fileUploaderComponent={
                    <Button
                        color="primary"
                        className="absolute bottom-[-15px] left-10"
                        text={<IconEdit />}
                        rounded
                        size="icon"
                        disabled={loading}
                    />
                }
                onSelectedFile={onSubmitPhoto}
            />

        </div>
    )
}

export default Logotype