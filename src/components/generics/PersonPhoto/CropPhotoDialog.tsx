import ReactCrop, { Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

import Button from '@/components/common/Button'
import Modal from '@/components/common/Modal'

interface Props {
    imgSrc: string
    crop?: Crop
    imgRef: React.RefObject<HTMLImageElement | null>
    uploading: boolean
    title?: string
    description?: React.ReactNode
    confirmLabel?: string
    setCrop: (crop: Crop) => void
    onImageLoad: (event: React.SyntheticEvent<HTMLImageElement>) => void
    onConfirm: () => void
    onClose: () => void
}

/** Recorte cuadrado de la foto antes de subirla. Compartido por todos los flujos de foto. */
const CropPhotoDialog = ({
    imgSrc, crop, imgRef, uploading, title = 'Subir foto', description, confirmLabel = 'Subir foto',
    setCrop, onImageLoad, onConfirm, onClose,
}: Props) => {
    return (
        <Modal open={!!imgSrc} title={title} size="lg" onOpenChange={onClose}>
            {!!imgSrc && (
                <div className="grid gap-4">
                    {description && <p className="text-[13px] text-muted-foreground">{description}</p>}

                    <div className="relative mx-auto">
                        <ReactCrop
                            crop={crop}
                            minHeight={100}
                            maxHeight={500}
                            className="h-full"
                            onChange={setCrop}
                        >
                            <img
                                ref={imgRef}
                                src={imgSrc}
                                alt="Foto seleccionada"
                                className="h-full w-full object-contain"
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            rounded
                            className="mx-auto"
                            text={uploading ? 'Subiendo…' : confirmLabel}
                            disabled={!crop || uploading}
                            loading={uploading}
                            onClick={onConfirm}
                        />
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default CropPhotoDialog
