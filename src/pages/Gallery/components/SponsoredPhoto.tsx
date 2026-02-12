import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import AvatarUploadPhoto from "@/components/generics/AvatarUploadPhoto"
import useCropImage from "@/hooks/useCropImage"
import useFiles from "@/hooks/useFiles"
import { FileTypes } from "@/interfaces/files"
import { SponsoredService } from "@/services/sponsored.service"
import { getCroppedImg } from "@/utils/files"
import useSponsoredActions from '../hooks/useSponsoredActions'

interface Props {
    itemId: string
    itemAccount: string
    src: string
    uri: string | null
    alt: string
    sizeClasses?: string
}

const SponsoredPhoto = ({ itemId, src, uri, alt, sizeClasses }: Props) => {
    const { updateCachedVendor } = useSponsoredActions()
    const { executing, onUploadFile } = useFiles()
    const {
        imgSrc,
        selectedFile,
        crop,
        imgRef,
        setSelectedFile,
        setImgSrc,
        onImageLoad,
        setCrop,
        onResetCrop
    } = useCropImage()

    const onUpdatePhoto = async (fileUri: string) => {
        try {
            const itemUpdated = await SponsoredService.update(itemId, { photo: fileUri })
            updateCachedVendor(itemId, itemUpdated)
        } catch (error) {
            console.error("Error updating photo:", error)
        }
    }

    const onSelectedFile = (file: File) => {
        if (file) {
            setCrop(undefined)
            setSelectedFile(file)
            const reader = new FileReader()
            reader.addEventListener('load', () =>
                setImgSrc(reader.result?.toString() || ''),
            )
            reader.readAsDataURL(file)
        }
    }

    const handleCropComplete = async () => {
        if (!crop || !imgRef.current || !selectedFile) return

        try {
            const croppedBlob = await getCroppedImg(imgRef.current, crop, selectedFile?.type)
            if (!croppedBlob) return

            // Convertir blob a File
            const croppedFile = new File([croppedBlob], selectedFile.name, {
                type: selectedFile.type
            })

            // const filename = `picture-${itemAccount}.${getFileType(selectedFile.type)}`
            await onUploadFile({
                file: croppedFile,
                fileType: FileTypes.SPONSORED_PHOTO,
                callback: onUpdatePhoto
            })

            onResetCrop()
        } catch (error) {
            console.error("Error processing cropped image:", error)
        }
    }

    return (
        <>
            <AvatarUploadPhoto
                src={src}
                uri={uri}
                alt={alt}
                loading={executing}
                sizeClasses={sizeClasses || "size-20"}
                onUpload={onSelectedFile}
            />
            <Modal
                open={!!imgSrc}
                title="Subir foto"
                size="lg"
                onOpenChange={onResetCrop}
            >
                {!!imgSrc &&
                    <div className="grid gap-4">
                        <div className="relative mx-auto">
                            <ReactCrop
                                crop={crop}
                                onChange={(crop) => setCrop(crop)}
                                minHeight={100}
                                maxHeight={500}
                                className="h-full"
                            >
                                <img
                                    ref={imgRef}
                                    src={imgSrc}
                                    alt="Selected"
                                    className="w-full h-full object-contain"
                                    onLoad={onImageLoad}
                                />
                            </ReactCrop>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                text={executing ? 'Subiendo...' : 'Subir Foto'}
                                className="mx-auto"
                                rounded
                                disabled={!crop || executing}
                                loading={executing}
                                onClick={handleCropComplete}
                            />
                        </div>
                    </div>
                }
            </Modal>
        </>
    )
}

export default SponsoredPhoto