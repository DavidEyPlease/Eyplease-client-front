import { StorageDisks } from "@/interfaces/common"
import { FileTypes } from "@/interfaces/files"
import { downloadBlob } from "@/utils"
import { getFileByUri } from "@/utils/apiUtils"
import { uploadFile } from "@/utils/files"
import { useState } from "react"
import { toast } from "sonner"

interface OnUploadParams {
    file: File
    fileType: FileTypes
    filename?: string
    disk?: StorageDisks
    callback?: (fileKey: string) => Promise<void>
}

const useFiles = () => {
    const [executing, setExecuting] = useState(false)

    const onUploadFile = async (params: OnUploadParams, useFullUri = true) => {
        try {
            setExecuting(true)
            const filename = params.filename || params.file.name
            const fileKey = await uploadFile({
                file: params.file,
                filename,
                fileType: params.fileType,
                disk: params.disk || 'private',
            })
            if (fileKey) {
                await params.callback?.(useFullUri ? fileKey : filename)
            }
        } catch (error) {
            console.log(error)
            toast.error('Error al subir la portada de la plantilla')
        } finally {
            setExecuting(false)
        }
    }

    const downloadFile = async (uri: string) => {
        setExecuting(true)
        try {
            const blob = await getFileByUri(uri)
            downloadBlob(blob, uri.split('/').pop() || 'file')
        } catch (error) {
            console.log(error)
            toast.error('Error al descargar el archivo')
        } finally {
            setExecuting(false)
        }
    }

    return {
        executing,
        onUploadFile,
        downloadFile,
    }
}

export default useFiles