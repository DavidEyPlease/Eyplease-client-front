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

/**
 * Recorte cuadrado de la foto antes de subirla. Compartido por todos los flujos de foto (Galería, Mi unidad, rehacer una
 * pieza con otra foto).
 *
 * La foto se ve COMPLETA y el botón siempre queda a la vista (David, 5-nov-2026: «necesita más espacio para que el
 * usuario pueda acomodar y subir sin problema»). Antes la ventana era angosta y la foto iba a su tamaño: una foto vertical
 * del teléfono se salía por abajo, el cuerpo de la ventana la cortaba sin barra visible y el botón quedaba escondido.
 * Ahora la ventana es más ancha, la foto cabe en el alto de la pantalla y el botón va en el pie, fuera de lo que se
 * desplaza. El recorte se queda cuadrado (es como sale en las piezas) y se guarda en porcentaje, así sobrevive a que la
 * ventana cambie de tamaño mientras se acomoda.
 */
const CropPhotoDialog = ({
    imgSrc, crop, imgRef, uploading, title = 'Subir foto', description, confirmLabel = 'Subir foto',
    setCrop, onImageLoad, onConfirm, onClose,
}: Props) => {
    return (
        <Modal
            open={!!imgSrc}
            title={title}
            size="xxl"
            onOpenChange={onClose}
            footer={!!imgSrc && (
                <div className="flex w-full flex-col-reverse items-center gap-3 sm:flex-row sm:justify-end sm:gap-5">
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={onClose}
                        className="cursor-pointer text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <Button
                        rounded
                        text={uploading ? 'Subiendo…' : confirmLabel}
                        disabled={!crop || uploading}
                        loading={uploading}
                        onClick={onConfirm}
                    />
                </div>
            )}
        >
            {!!imgSrc && (
                <div className="grid gap-3">
                    {description && <p className="text-[13px] text-muted-foreground">{description}</p>}
                    <p className="text-[13px] text-muted-foreground">
                        Mueva el cuadro sobre la cara y estire sus esquinas para acomodarla. Lo que quede dentro del cuadro
                        es lo que sale en las piezas.
                    </p>

                    <div className="flex justify-center rounded-xl bg-muted/40 p-2">
                        {/* El alto va en ReactCrop: su CSS le pone a la imagen `max-height: inherit`. */}
                        <ReactCrop
                            className="max-h-[min(60vh,640px)]"
                            crop={crop}
                            aspect={1}
                            minWidth={60}
                            minHeight={60}
                            keepSelection
                            ruleOfThirds
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                        >
                            <img
                                ref={imgRef}
                                src={imgSrc}
                                alt="Foto seleccionada"
                                className="block w-auto max-w-full object-contain"
                                onLoad={onImageLoad}
                            />
                        </ReactCrop>
                    </div>
                </div>
            )}
        </Modal>
    )
}

export default CropPhotoDialog
