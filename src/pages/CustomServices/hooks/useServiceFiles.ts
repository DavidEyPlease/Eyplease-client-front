import { useState } from "react"
import { toast } from "sonner"

import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { IUserRequestServiceFile } from "@/interfaces/requestService"
import { useRequestServicesStore } from "@/store/request-services"
import useUploadStore from "@/store/uploadStore"
import { downloadBlob } from "@/utils"
import HttpService from '@/services/http'

const useServiceFiles = () => {
    const { selectedItem, setSelectedItem, setOpenAction } = useRequestServicesStore(state => state)
    const [fileLoadingAction, setFileLoadingAction] = useState('')

    const startUpload = useUploadStore(state => state.startUpload)
    const { request } = useRequestQuery({
        onError: (e) => {
            console.log(e)
        }
    })

    const onUploadFiles = (files: File[], callback?: (newFiles: IUserRequestServiceFile[]) => void) => {
        if (!files || files.length === 0 || !selectedItem) return

        return new Promise<void>((resolve, reject) => {
            return startUpload(
                files,
                {
                    uploadUri: `private/tasks/${selectedItem.id}/attachments`,
                    onAllSuccess: async (uploadedResults) => {
                        try {
                            const newFiles = await request<unknown, IUserRequestServiceFile[]>('POST', API_ROUTES.CUSTOM_SERVICES.UPLOAD_FILES.replace('{id}', selectedItem.id), {
                                file_uris: uploadedResults
                            })
                            setSelectedItem({
                                ...selectedItem!,
                                files: [
                                    ...newFiles.data,
                                    ...selectedItem!.files,
                                ]
                            })
                            callback?.(newFiles.data)
                            // publishEvent('tasks-updated', { id: taskId, files: [...newTask.data, ...attachments], eventType: 'update' });
                            // publishEvent('tasks-updated', { id: taskId, files: [...newTask.data, ...attachments], eventType: 'updateDetail' });
                            // clean input file
                            const inputFile = document.getElementById(`attachment-${selectedItem.id}`) as HTMLInputElement
                            if (inputFile) {
                                inputFile.value = ''
                            }
                            resolve()
                        } catch (error) {
                            reject(error)
                            toast.error('Error al asociar los archivos a la tarea')
                        }
                    }
                }
            )
        })
    }

    const onDownloadFile = async (attachment: IUserRequestServiceFile) => {
        if (!selectedItem) return
        try {
            setFileLoadingAction(attachment.id)
            const blob = await HttpService.get<Blob>(
                API_ROUTES.CUSTOM_SERVICES.DOWNLOAD_FILE.replace('{itemId}', selectedItem.id).replace('{fileId}', attachment.id),
                { responseType: 'blob' }
            )
            downloadBlob(blob, attachment.file.uri || 'file')
        } catch (error) {
            console.log(error)
            toast.error('Error al descargar el archivo')
        } finally {
            setFileLoadingAction('')
        }
    }

    const onDeleteFile = async (attachment: IUserRequestServiceFile, callback?: () => void) => {
        if (!selectedItem) return
        try {
            setFileLoadingAction(attachment.id)
            await request(
                'DELETE',
                API_ROUTES.CUSTOM_SERVICES.DELETE_ATTACHMENT.replace('{id}', selectedItem.id).replace('{attachmentId}', attachment.id)
            )
            callback?.()
        } catch (error) {
            console.log(error)
            toast.error('Error al eliminar el archivo')
        } finally {
            setFileLoadingAction('')
        }
    }

    return {
        onDeleteFile,
        onUploadFiles,
        onDownloadFile,
        setOpenAction,
        fileLoadingAction,
    }
}

export default useServiceFiles