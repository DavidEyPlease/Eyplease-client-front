import { ImageIcon, PaperclipIcon, TrashIcon } from "lucide-react"
import { useEffect, useState } from "react"

import { InputFile } from "@/components/common/Inputs/InputFile"
import { AttachmentViewer } from "@/components/generics/AttachmentViewer"
import DownloadButton from "@/components/generics/DownloadButton"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { Card, CardContent } from "@/components/ui/card"
import useAuth from "@/hooks/useAuth"
import { EypleaseFile } from "@/interfaces/files"
import { IUserRequestServiceFile } from "@/interfaces/requestService"
import { cn } from "@/lib/utils"
import { isImage } from "@/utils"
import { formatDate } from "@/utils/dates"
import useServiceFiles from "../../../hooks/useServiceFiles"
import useFetchQuery from "@/hooks/useFetchQuery"
import { API_ROUTES } from "@/constants/api"
import { queryKeys } from "@/utils/cache"
import Spinner from "@/components/common/Spinner"
import { Button } from "@/components/ui/button"

interface Props {
    itemId: string
}

type FilesTab = 'own' | 'design'

const CustomServiceFiles = ({ itemId }: Props) => {
    const { user } = useAuth()
    const [currentAttachments, setCurrentAttachments] = useState<IUserRequestServiceFile[]>([])
    const [selectedFile, setSelectedFile] = useState<EypleaseFile | null>(null)
    const [activeTab, setActiveTab] = useState<FilesTab>('design')

    const { response: serviceFiles, loading, setData: setFiles } = useFetchQuery<IUserRequestServiceFile[]>(
        API_ROUTES.CUSTOM_SERVICES.GET_FILES.replace('{id}', itemId),
        {
            customQueryKey: queryKeys.list(`user-request-service-files-${itemId}`),
            enabled: !!itemId
        }
    )

    const { fileLoadingAction, onDeleteFile, onUploadFiles, onDownloadFile } = useServiceFiles()

    const filterFiles = () => {
        setCurrentAttachments((serviceFiles?.data || []).filter(att => activeTab === 'own' ? att.uploaded_by.id === user?.user_id : att.uploaded_by.id !== user?.user_id))
    }

    useEffect(() => {
        filterFiles()
    }, [serviceFiles?.data, activeTab])

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <DynamicTabs
                    items={[
                        { value: 'design', label: "Mis Diseños", icon: <ImageIcon className="size-4" /> },
                        { value: 'own', label: "Mis Archivos Adjuntos", icon: <PaperclipIcon className="size-4" /> },
                    ]}
                    value={activeTab}
                    onValueChange={value => setActiveTab(value as FilesTab)}
                />
                <div>
                    <InputFile
                        label="Añadir"
                        id={`attachment-${itemId}`}
                        multiple
                        onChange={e => {
                            onUploadFiles(
                                e.target.files ? Array.from(e.target.files) : [],
                                (newFiles) => {
                                    setFiles([
                                        ...serviceFiles?.data || [],
                                        ...newFiles
                                    ])
                                }
                            )
                        }}
                    />
                </div>
            </div>

            {loading && (<Spinner />)}

            <div className="grid md:grid-cols-3 gap-2">
                {currentAttachments.map(attachment => {
                    const isFileImage = isImage(attachment.file.ext)
                    return (
                        <Card key={attachment.id} className="hover:bg-accent p-3 relative">
                            <CardContent className="space-y-3 p-0">
                                <div className="flex items-center gap-4">
                                    <div
                                        className={cn(
                                            "size-20 shadow-md flex items-center justify-center rounded cursor-pointer ",
                                            {
                                                'border-2 border-dashed border-primary/30': !isFileImage,
                                            }
                                        )}
                                        onClick={() => setSelectedFile(attachment.file)}
                                    >
                                        {isFileImage ? (
                                            <img src={attachment.file.url} className="rounded object-cover max-w-full h-full" alt="" />
                                        ) : (
                                            <div className="text-xs font-medium uppercase">
                                                {attachment.file.ext}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        {/* <p className="font-medium text-sm">{attachment.file.name}</p> */}
                                        <p className="text-xs text-muted-foreground">Añadido por: {attachment.uploaded_by?.name} el {formatDate(attachment.created_at)}</p>
                                    </div>
                                </div>

                                {attachment.uploaded_by?.id !== user?.user_id && (
                                    <DownloadButton
                                        uri={attachment.file.url}
                                        customLoading={fileLoadingAction === attachment.id}
                                        onCustomDownload={() => onDownloadFile(attachment)}
                                    />
                                )}
                                {attachment.uploaded_by?.id === user?.user_id && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-400 rounded-lg absolute top-1 right-1"
                                        disabled={fileLoadingAction === attachment.id}
                                        onClick={() => {
                                            onDeleteFile(attachment, () => {
                                                setFiles(currentAttachments.filter(f => f.id !== attachment.id))
                                            })
                                        }}
                                    >
                                        <TrashIcon />
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {selectedFile && (
                <AttachmentViewer
                    isOpen={!!selectedFile}
                    onClose={() => setSelectedFile(null)}
                    attachment={selectedFile}
                />
            )}
        </div>
    )
}

export default CustomServiceFiles