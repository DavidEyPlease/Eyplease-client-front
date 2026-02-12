import Avatar from "@/components/generics/Avatar"
import UserAvatarImg from '@/assets/images/user-avatar.avif'
import Button from "@/components/common/Button"
import CardBgImage from "@/components/generics/CardBgImage"
import TemplateExampleOne from "@/assets/images/template-example1.png"
import { IPost } from "@/interfaces/posts"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { formatDate } from "@/utils/dates"
import { formatToTitleCase } from "@/utils"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import IconDownload from "@/components/Svg/IconDownload"
import useCarousel from "@/hooks/useCarousel"
import useFiles from "@/hooks/useFiles"
import { CheckIcon } from "lucide-react"
import usePostActions from "../hooks/usePostActions"

interface Props {
    item: IPost
}

const PostItem = ({ item }: Props) => {
    const { requestState, markAsSent } = usePostActions()
    const { setApi, current: currentFile } = useCarousel()
    const { executing, downloadFile } = useFiles()

    const status = item.shared_at ? 'sent' : 'published'

    return (
        <Card className="py-4 gap-4">
            <CardHeader className="relative px-3">
                <div className="flex items-center justify-between">
                    {item.user &&
                        <div className="flex gap-1">
                            <Avatar src={UserAvatarImg} sizeClasses="w-10 h-10 rounded-full" alt="" />
                            <div className="flex flex-col">
                                <p className="text-sm font-bold">{formatToTitleCase(item.title ?? '')}</p>
                                <small className="text-sm">{formatDate(item.created_at)}</small>
                            </div>
                        </div>
                    }
                </div>
            </CardHeader>
            <CardContent className="relative px-0">
                <Carousel className="w-full" setApi={setApi}>
                    <CarouselContent>
                        {item.files.map(file => (
                            <CarouselItem key={file.id}>
                                {/* <p className="text-sm font-bold">{item.title}</p> */}
                                {file.ext === 'mp4' ? (
                                    <video src={file.url} className="w-full h-72" controls></video>
                                ) : (
                                    <CardBgImage
                                        srcImage={file.ext === 'png' ? file.url : TemplateExampleOne}
                                        classImageHeight="h-72"
                                        className="border-none"
                                        objectPosition="object-cover"
                                    />
                                )}
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-0 ml-2" />
                    <CarouselNext className="absolute right-0 mr-2" />
                </Carousel>
                <div className="flex flex-wrap justify-between px-4 pt-4">
                    <div className="flex items-center gap-2">
                        <button
                            disabled={status === "sent" || requestState.loading}
                            className={`relative w-5 h-5 rounded border-2 transition-all duration-300 ${status === "sent" ? "bg-green-500 border-green-500 scale-110" : "border-gray-300 hover:border-green-400"
                                }`}
                            onClick={() => markAsSent(item.id)}
                        >
                            {status === "sent" && (
                                <CheckIcon className="w-3 h-3 text-white absolute top-0.5 left-0.5 animate-in zoom-in duration-200" />
                            )}
                        </button>
                        <span
                            className={`text-sm transition-colors ${status === "sent" ? "text-green-600 font-medium" : "text-gray-600"}`}
                        >
                            {status === "sent" ? "Enviada" : "Marcar como enviada"}
                        </span>
                    </div>
                    <Button
                        text={
                            <div className="flex items-center gap-1">
                                <IconDownload />
                                <small>Descargar</small>
                            </div>
                        }
                        size="sm"
                        rounded
                        loading={executing}
                        onClick={() => downloadFile(item.files[currentFile - 1].uri)}
                    />
                </div>
            </CardContent>
        </Card>
    )
}

export default PostItem