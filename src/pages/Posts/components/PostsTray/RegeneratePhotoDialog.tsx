import { useState } from 'react'
import { ImagePlusIcon, UserRoundIcon } from 'lucide-react'

import Modal from '@/components/common/Modal'
import FileSelector from '@/components/generics/FileSelector'
import CropPhotoDialog from '@/components/generics/PersonPhoto/CropPhotoDialog'
import usePersonPhotoUpload from '@/components/generics/PersonPhoto/usePersonPhotoUpload'
import { IPostVendorable } from '@/interfaces/posts'

interface Props {
    open: boolean
    person: IPostVendorable
    /** Se llama tras guardar la foto: es cuando tiene sentido encolar el render. */
    onUploaded: () => void
    onOpenChange: (open: boolean) => void
}

/**
 * Puerta previa a volver a generar cuando la persona no tiene foto propia.
 *
 * Sin foto, el render usa el avatar por defecto: regenerar tal cual gastaría cómputo
 * para devolver la misma pieza. Aquí se sube la foto y solo entonces se encola.
 */
const RegeneratePhotoDialog = ({ open, person, onUploaded, onOpenChange }: Props) => {
    const [saving, setSaving] = useState(false)

    const photo = usePersonPhotoUpload({
        personType: person.type,
        personId: person.id,
    })

    const onConfirm = async () => {
        setSaving(true)
        const saved = await photo.onConfirmCrop()
        setSaving(false)

        if (!saved) return

        onOpenChange(false)
        onUploaded()
    }

    const onClose = (next: boolean) => {
        if (!next) photo.onReset()
        onOpenChange(next)
    }

    return (
        <>
            {/* Paso 1: explicar y elegir archivo. Se oculta mientras se recorta. */}
            <Modal open={open && !photo.imgSrc} title="Falta la foto" size="md" onOpenChange={onClose}>
                <div className="grid gap-4">
                    <div className="flex items-start gap-3 rounded-2xl border bg-surface-soft p-4">
                        <span className="grid size-10 shrink-0 place-content-center rounded-full bg-primary/[0.08] text-primary">
                            <UserRoundIcon className="size-5" />
                        </span>
                        <div className="min-w-0">
                            <p className="text-[13.5px] font-bold tracking-tight">{person.name}</p>
                            <p className="mt-0.5 text-[12.5px] text-muted-foreground">
                                Todavía no tiene foto, así que su diseño se generó con la imagen por defecto.
                                Súbela y volvemos a generarlo con su cara.
                            </p>
                        </div>
                    </div>

                    <FileSelector
                        onSelectedFile={photo.onSelectFile}
                        fileUploaderComponent={
                            <button
                                type="button"
                                className="flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-2xl border border-dashed border-primary-light bg-[#F7F5FF] px-4 py-7 text-muted-foreground transition-colors hover:bg-primary/5"
                            >
                                <ImagePlusIcon className="size-7 text-primary" />
                                <span className="text-[13px] font-semibold text-primary">Elegir foto</span>
                                <small className="text-[11.5px]">JPG o PNG</small>
                            </button>
                        }
                    />

                    <button
                        type="button"
                        onClick={() => onClose(false)}
                        className="mx-auto cursor-pointer text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Ahora no
                    </button>
                </div>
            </Modal>

            {/* Paso 2: recortar y subir. Al terminar se encola el render. */}
            <CropPhotoDialog
                imgSrc={photo.imgSrc}
                crop={photo.crop}
                imgRef={photo.imgRef}
                uploading={photo.uploading || saving}
                title="Recorta la foto"
                description={`Se guardará en el perfil de ${person.name} y se usará en todos sus diseños.`}
                confirmLabel="Subir y generar"
                setCrop={photo.setCrop}
                onImageLoad={photo.onImageLoad}
                onConfirm={onConfirm}
                onClose={photo.onReset}
            />
        </>
    )
}

export default RegeneratePhotoDialog
