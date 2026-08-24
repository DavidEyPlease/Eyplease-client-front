import useCropImage from '@/hooks/useCropImage'
import useFiles from '@/hooks/useFiles'
import { FileTypes } from '@/interfaces/files'
import { CustomerByClientService } from '@/services/customersByClient.service'
import { SponsoredService } from '@/services/sponsored.service'
import { getCroppedImg } from '@/utils/files'

/** De quién es la foto: una consultora de la red o un cliente propio del usuario. */
export type PersonType = 'sponsored' | 'customer'

interface Options {
    personType: PersonType
    personId: string
    /** Se ejecuta con la persona ya actualizada en la API. */
    onUploaded?: (updated: unknown) => void | Promise<void>
}

/** Cada tipo de persona tiene su endpoint y su carpeta de archivos. */
const UPLOAD_CONFIG: Record<PersonType, { fileType: FileTypes, update: (id: string, photo: string) => Promise<unknown> }> = {
    sponsored: {
        fileType: FileTypes.SPONSORED_PHOTO,
        update: (id, photo) => SponsoredService.update(id, { photo }),
    },
    customer: {
        fileType: FileTypes.CUSTOMER_CLIENT,
        update: (id, photo) => CustomerByClientService.update(id, { photo }),
    },
}

/**
 * Seleccionar → recortar → subir → guardar la foto de una persona.
 *
 * Vive aquí porque el flujo es idéntico en Galería, Mis clientes y el reintento de
 * una publicación; lo único que cambia entre ellos es a qué endpoint se guarda y qué
 * hacer después, que entran por parámetro.
 */
const usePersonPhotoUpload = ({ personType, personId, onUploaded }: Options) => {
    const { executing, onUploadFile } = useFiles()
    const {
        imgSrc,
        selectedFile,
        crop,
        imgRef,
        setSelectedFile,
        setImgSrc,
        setCrop,
        onResetCrop,
        onImageLoad,
    } = useCropImage()

    const config = UPLOAD_CONFIG[personType]

    const onSelectFile = (file: File) => {
        if (!file) return

        setCrop(undefined)
        setSelectedFile(file)

        const reader = new FileReader()
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
        reader.readAsDataURL(file)
    }

    /** @returns true si la foto quedó guardada */
    const onConfirmCrop = async (): Promise<boolean> => {
        if (!crop || !imgRef.current || !selectedFile) return false

        let saved = false

        try {
            const croppedBlob = await getCroppedImg(imgRef.current, crop, selectedFile.type)
            if (!croppedBlob) return false

            const croppedFile = new File([croppedBlob], selectedFile.name, { type: selectedFile.type })

            await onUploadFile({
                file: croppedFile,
                fileType: config.fileType,
                callback: async (fileUri: string) => {
                    const updated = await config.update(personId, fileUri)
                    saved = true
                    await onUploaded?.(updated)
                },
            }, false)

            onResetCrop()
        } catch (error) {
            console.error('Error procesando la foto recortada:', error)
        }

        return saved
    }

    return {
        imgSrc,
        crop,
        imgRef,
        uploading: executing,
        setCrop,
        onImageLoad,
        onSelectFile,
        onConfirmCrop,
        onReset: onResetCrop,
    }
}

export default usePersonPhotoUpload
