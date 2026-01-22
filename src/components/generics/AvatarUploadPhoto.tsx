import { cn } from "@/lib/utils"
import Button from "../common/Button"
import { IconEdit } from "../Svg/IconEdit"
import IconUploadPhoto from "../Svg/IconUploadPhoto"
import Avatar from "./Avatar"
import FileSelector from "./FileSelector"
import Spinner from "../common/Spinner"

interface Props {
    uri: string | null;
    src: string;
    alt?: string;
    sizeClasses?: string;
    loading?: boolean;
    onUpload: (file: File) => void;
}

const AvatarUploadPhoto = ({ uri, src, alt, loading, sizeClasses = 'size-32', onUpload }: Props) => {
    return (
        <div className="relative w-max">
            {loading &&
                <div className="absolute z-10 grid w-full h-full bg-black/60 rounded-full place-items-center">
                    <Spinner />
                </div>
            }
            <FileSelector
                fileUploaderComponent={
                    uri ? (
                        <div className='relative'>
                            {src &&
                                <Avatar
                                    src={src}
                                    alt={alt || 'Avatar'}
                                    sizeClasses={cn("rounded-full", sizeClasses)}
                                    className='rounded-full'
                                />
                            }
                            <Button
                                color="primary"
                                className="absolute top-0 -right-3 rounded-full"
                                text={<IconEdit />}
                                disabled={loading}
                                rounded
                                size="sm"
                                type="button"
                            />
                        </div>
                    ) : (
                        <button type="button" className={cn("flex cursor-pointer flex-col items-center gap-1 justify-center border border-dashed rounded-full text-muted-foreground bg-[#F7F5FF] border-primary-light", sizeClasses)}>
                            <IconUploadPhoto className="size-8" />
                            <small>Cargar foto</small>
                        </button>
                    )
                }
                onSelectedFile={onUpload}
            />
        </div>
    )
}

export default AvatarUploadPhoto