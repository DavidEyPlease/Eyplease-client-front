import Button from "@/components/common/Button"
import FileSelector from "@/components/generics/FileSelector"
import LoggedUserAvatar from "@/components/generics/LoggedUserAvatar"
import { IconEdit } from "@/components/Svg/IconEdit"
import { BROWSER_EVENTS } from "@/constants/app"
import useAuth from "@/hooks/useAuth"
import { IAuthUser } from "@/interfaces/auth"
import { FileTypes } from "@/interfaces/files"
import { getFileType } from "@/utils"
import { publishEvent } from "@/utils/events"
import { useState } from "react"

interface Props {
    authUser: IAuthUser
}

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
            {authUser &&
                <>
                    <LoggedUserAvatar
                        user={authUser}
                        sizeClasses="w-40 h-40"
                        className="mt-[-35px] border-4 border-white"
                        loading={loading}
                    />
                    <FileSelector
                        fileUploaderComponent={
                            <Button
                                color="primary"
                                className="absolute top-[-50px] right-[-15px]"
                                text={<IconEdit />}
                                rounded
                                size="icon"
                            />
                        }
                        onSelectedFile={onSubmitPhoto}
                    />
                </>
            }
        </div>
    )
}

export default ProfilePhoto