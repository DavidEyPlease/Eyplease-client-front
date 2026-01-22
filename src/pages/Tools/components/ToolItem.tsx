import { CalendarIcon } from "lucide-react"

import Button from "@/components/common/Button"
import CardBgImage from "@/components/generics/CardBgImage"
import IconDownload from "@/components/Svg/IconDownload"
import { Badge } from "@/components/ui/badge"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ITool } from "@/interfaces/tools"
import { formatDate } from "@/utils/dates"
import useFiles from "@/hooks/useFiles"
import useCarousel from "@/hooks/useCarousel"
import { MAP_TOOLS_SECTIONS } from "@/constants/app"
import Ribbon from "@/components/generics/Ribbon"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
    item: ITool
}

const today = new Date()

export const ToolItem = ({ item }: Props) => {
    const { setApi, current: currentFile } = useCarousel()
    const { executing, downloadFile } = useFiles()

    const createdAt = new Date(item.created_at)

    const isToday =
        createdAt.getDate() === today.getDate() &&
        createdAt.getMonth() === today.getMonth() &&
        createdAt.getFullYear() === today.getFullYear()

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Card className="w-full p-0 transition-all gap-0 duration-300 hover:shadow-xl hover:shadow-primary/10">
                <CardContent className="p-0 relative overflow-hidden flex flex-col justify-between">
                    {isToday && <Ribbon text="Nueva" />}

                    <Carousel className="w-full" setApi={setApi}>
                        <CarouselContent>
                            {item.files.map((file) => (
                                <CarouselItem key={file.id} className="relative">
                                    <CardBgImage
                                        srcImage={file.url}
                                        classImageHeight="h-80 w-full"
                                        className="border-none"
                                        objectPosition="object-contain"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="absolute left-0 ml-2" />
                        <CarouselNext className="absolute right-0 mr-2" />
                    </Carousel>
                    <div className="flex flex-col px-4 pb-4 space-y-3 my-3">
                        <h1>{item.title}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" aria-hidden />
                            <span>F. Publicación: {formatDate(item.created_at)}</span>
                        </div>
                        <Badge variant='outline' className="rounded-full">{MAP_TOOLS_SECTIONS[item.section]}</Badge>

                        <Button
                            text={
                                <div className="flex items-center gap-1">
                                    <IconDownload />
                                    Descargar
                                </div>
                            }
                            variant="outline"
                            rounded
                            loading={executing}
                            onClick={() => downloadFile(item.files[currentFile - 1].uri)}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default ToolItem