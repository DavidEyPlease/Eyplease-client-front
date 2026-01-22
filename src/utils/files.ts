import { FileTypes } from '@/interfaces/files'
import { uploadS3 } from '.'
import { getSignUploadUrl } from "./apiUtils"
import { StorageDisks } from '@/interfaces/common'
import { centerCrop, type Crop, makeAspectCrop } from 'react-image-crop'

export const uploadFile = async (params: { file: File, fileType: FileTypes, filename: string, disk?: StorageDisks }) => {
    const signUrl = await getSignUploadUrl({
        fileName: params.filename,
        fileType: params.fileType,
        disk: params.disk || 'private',
    })
    if (signUrl.url) {
        await uploadS3(params.file, signUrl.url)
        return signUrl.key
    } else {
        throw new Error('Error al obtener la url de subida')
    }
}

export const centerAspectCrop = (
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
) => {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 90,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    )
}

export const getCroppedImg = (
    image: HTMLImageElement,
    crop: Crop,
    mimeType: string
): Promise<Blob | null> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) return Promise.resolve(null)

    // Obtener las dimensiones reales de la imagen (no las del DOM)
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    // Convertir las coordenadas del crop a píxeles de la imagen real
    let cropX = crop.x
    let cropY = crop.y
    let cropWidth = crop.width
    let cropHeight = crop.height

    // Si el crop está en porcentaje, convertir a píxeles
    if (crop.unit === '%') {
        cropX = (crop.x / 100) * image.width
        cropY = (crop.y / 100) * image.height
        cropWidth = (crop.width / 100) * image.width
        cropHeight = (crop.height / 100) * image.height
    }

    // Aplicar la escala a las dimensiones reales de la imagen
    const pixelCropX = cropX * scaleX
    const pixelCropY = cropY * scaleY
    const pixelCropWidth = cropWidth * scaleX
    const pixelCropHeight = cropHeight * scaleY

    // Configurar el canvas con las dimensiones del crop
    canvas.width = pixelCropWidth
    canvas.height = pixelCropHeight

    // Dibujar la imagen recortada en el canvas
    ctx.drawImage(
        image,
        pixelCropX,
        pixelCropY,
        pixelCropWidth,
        pixelCropHeight,
        0,
        0,
        pixelCropWidth,
        pixelCropHeight
    )

    return new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve(blob)
        }, mimeType, 0.95)
    })
}