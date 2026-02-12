import { CalendarIcon, CheckIcon, ChevronDownIcon, FileTextIcon } from 'lucide-react'

import { ITraining } from "@/interfaces/trainings"
import { Card, CardContent } from "@/components/ui/card"
// import { IconStar } from "@/components/Svg/IconStar"
import { formatDate } from "@/utils/dates"
import CardBgImage from '@/components/generics/CardBgImage'
import IconDownload from '@/components/Svg/IconDownload'
import Button from '@/components/common/Button'
import { getTrainingFileByType, TRAINING_FILE_NAME } from '../utils'
import { FileTypes } from '@/interfaces/files'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import useFiles from '@/hooks/useFiles'
import { useState } from 'react'
import { toast } from 'sonner'
import Spinner from '@/components/common/Spinner'
import Ribbon from '@/components/generics/Ribbon'

interface Props {
    training: ITraining
    showRibbon?: boolean
}

const TrainingItem = ({ training, showRibbon }: Props) => {
    const { downloadFile } = useFiles()
    const [fileIdDownloading, setFileIdDownloading] = useState('')

    const onDownloadClick = async (fileId: string, fileUri: string) => {
        try {
            setFileIdDownloading(fileId)
            await downloadFile(fileUri)
        } catch (error) {
            console.error(error)
            toast.error('Error al descargar el archivo. Intenta nuevamente.')
        } finally {
            setFileIdDownloading('')
        }
    }

    const files = training.files.filter(i => i.type !== FileTypes.TRAINING_COVER)

    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <Card className="w-full p-0 transition-all gap-0 duration-300 hover:shadow-xl hover:shadow-primary/10">
                <CardContent className="p-0 relative overflow-hidden flex flex-col justify-between">
                    {showRibbon && (
                        <Ribbon text="Nueva" />
                    )}
                    <CardBgImage
                        srcImage={getTrainingFileByType(training.files, FileTypes.TRAINING_COVER)?.url || ''}
                        classImageHeight="h-64 w-full"
                        className="border-none"
                        objectPosition="object-cover"
                    />

                    <div className="flex flex-col px-4 pb-4 space-y-3 my-3">
                        <p className='text-sm'>{training.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4" aria-hidden />
                            <span>Publicada: {formatDate(training.created_at)}</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    disabled={files.length === 0}
                                    text={
                                        <div className="flex items-center gap-2">
                                            <IconDownload className="size-5 group-hover:animate-bounce" />
                                            Descargar ({files.length})
                                            <ChevronDownIcon className="size-5" />
                                        </div>
                                    }
                                    rounded
                                    block
                                // loading={executing}
                                // onClick={() => downloadFile(item.files[currentFile - 1].uri)}
                                />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent side='top' className="w-80 bg-popover/95 backdrop-blur-md border-border animate-slide-down">
                                <DropdownMenuLabel className="text-foreground font-semibold">
                                    Archivos disponibles ({training.files.length})
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-border" />

                                {files.map((file) => {
                                    const isDownloading = fileIdDownloading === file.id // Replace with actual downloading state
                                    const isDownloaded = false // Replace with actual downloaded state
                                    return (
                                        <DropdownMenuItem
                                            key={file.id}
                                            disabled={isDownloading}
                                            onClick={(e) => {
                                                e.preventDefault()
                                                onDownloadClick(file.id, file.uri)
                                            }}
                                            className="cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div className="flex items-center flex-1 min-w-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center mr-3 transition-all duration-300",
                                                        isDownloaded ? "bg-accent/20" : "bg-primary/10",
                                                        isDownloading && "animate-pulse"
                                                    )}>
                                                        {isDownloaded ? (
                                                            <CheckIcon className="w-5 h-5 text-accent animate-fade-in" />
                                                        ) : (
                                                            <FileTextIcon className="w-5 h-5 text-primary" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium text-foreground truncate">
                                                            {TRAINING_FILE_NAME[file.type as keyof typeof TRAINING_FILE_NAME]}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isDownloading && (
                                                    <div className="ml-2">
                                                        <Spinner />
                                                    </div>
                                                )}
                                            </div>
                                        </DropdownMenuItem>
                                    )
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default TrainingItem