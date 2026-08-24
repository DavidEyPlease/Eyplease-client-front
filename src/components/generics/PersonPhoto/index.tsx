import AvatarUploadPhoto from '@/components/generics/AvatarUploadPhoto'
import CropPhotoDialog from './CropPhotoDialog'
import usePersonPhotoUpload, { PersonType } from './usePersonPhotoUpload'

interface Props {
    personType: PersonType
    personId: string
    src: string
    uri: string | null
    alt: string
    sizeClasses?: string
    onUploaded?: (updated: unknown) => void | Promise<void>
}

/**
 * Avatar con edición de foto: el patrón de Galería y Mis clientes. El flujo completo
 * (elegir, recortar, subir, guardar) vive en usePersonPhotoUpload.
 */
const PersonPhotoUploader = ({ personType, personId, src, uri, alt, sizeClasses = 'size-20', onUploaded }: Props) => {
    const photo = usePersonPhotoUpload({ personType, personId, onUploaded })

    return (
        <>
            <AvatarUploadPhoto
                src={src}
                uri={uri}
                alt={alt}
                loading={photo.uploading}
                sizeClasses={sizeClasses}
                onUpload={photo.onSelectFile}
            />
            <CropPhotoDialog
                imgSrc={photo.imgSrc}
                crop={photo.crop}
                imgRef={photo.imgRef}
                uploading={photo.uploading}
                setCrop={photo.setCrop}
                onImageLoad={photo.onImageLoad}
                onConfirm={photo.onConfirmCrop}
                onClose={photo.onReset}
            />
        </>
    )
}

export default PersonPhotoUploader
