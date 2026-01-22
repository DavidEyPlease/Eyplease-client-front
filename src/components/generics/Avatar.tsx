import clsx from "clsx"

import {
    Avatar as UIAvatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import Spinner from "../common/Spinner"

interface Props {
    src: string
    alt: string
    sizeClasses?: string
    className?: string
    loading?: boolean
}

const Avatar = ({ src, alt, sizeClasses, className, loading = false }: Props) => {
    return (
        <UIAvatar className={clsx(sizeClasses, className, "rounded-lg", 'relative')}>
            <AvatarImage
                src={src}
                alt={alt}
                className={clsx(sizeClasses, "object-cover")}
            />
            {loading &&
                <div className="absolute grid w-full h-full bg-black bg-opacity-50 rounded-lg place-items-center">
                    <Spinner />
                </div>
            }
            <AvatarFallback className="grid text-sm text-center rounded-full">{alt}</AvatarFallback>
        </UIAvatar>
    )
}

export default Avatar