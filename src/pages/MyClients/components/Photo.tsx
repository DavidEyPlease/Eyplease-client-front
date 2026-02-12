import ReactCrop from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import AvatarUploadPhoto from "@/components/generics/AvatarUploadPhoto"

import { BROWSER_EVENTS } from "@/constants/app"
import useFiles from "@/hooks/useFiles"
import { FileTypes } from "@/interfaces/files"
import { CustomerByClientService } from "@/services/customersByClient.service"
import { publishEvent } from "@/utils/events"
import { getCroppedImg } from "@/utils/files"
import useCropImage from "@/hooks/useCropImage"
import useCustomerActions from '../hooks/useCustomerActions'

interface Props {
    itemId: string
    src: string
    uri: string | null
    alt: string
    sizeClasses?: string
}

const Photo = ({ itemId, src, uri, alt, sizeClasses }: Props) => {
    const { updateCachedCustomer } = useCustomerActions()
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
        onImageLoad
    } = useCropImage()

    const onUpdatePhoto = async (fileUri: string) => {
        try {
            const itemUpdated = await CustomerByClientService.update(itemId, { photo: fileUri })
            updateCachedCustomer(itemId, itemUpdated)
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

            await onUploadFile({
                file: croppedFile,
                fileType: FileTypes.CUSTOMER_CLIENT,
                callback: onUpdatePhoto
            })

            onResetCrop()

            publishEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, true)
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

export default Photo