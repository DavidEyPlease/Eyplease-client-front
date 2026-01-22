import { useState } from "react"
import { Trash2Icon } from "lucide-react"

import useServiceFiles from "../../hooks/useServiceFiles"

import { Card } from "@/components/ui/card"
import FileSelector from "@/components/generics/FileSelector"
import { IconPlus } from "@/components/Svg/IconPlus"
import CardBgImage from "@/components/generics/CardBgImage"
import Spinner from "@/components/common/Spinner"
import Button from "@/components/common/Button"

const DEFAULT_IMAGES = Array.from({ length: 6 }, () => ({ src: '' }))

const SetServiceImages = () => {
    const [loadingIdx, setLoadingIdx] = useState<number | null>(null)
    const [images, setImages] = useState<Array<{ id?: string, src: string }>>(DEFAULT_IMAGES)

    const { onUploadFiles, setOpenAction } = useServiceFiles()

    const onSelectImage = async (file: File, index: number) => {
        try {
            setLoadingIdx(index)
            const url = URL.createObjectURL(file)

            const newImages = [...images]
            newImages[index] = { src: url }
            setImages(newImages)

            await onUploadFiles([file])
        } catch (error) {
            console.log(error)
            onRemoveImage(index)
        } finally {
            setLoadingIdx(null)
        }
    }

    const onRemoveImage = (index: number) => {
        const newImages = [...images]
        newImages[index] = { src: '' }
        setImages(newImages)
    }

    return (
        <>
            <div className="grid md:grid-cols-6 gap-4">
                {images.map((image, index) => {
                    return (
                        <FileSelector
                            key={index}
                            fileUploaderComponent={
                                <Card className="h-32 relative py-0 flex items-center justify-center">
                                    {image.src ? (
                                        <CardBgImage className="h-32 border-none w-full" srcImage={image.src} objectPosition="object-cover" classImageHeight="h-32 rounded-xl w-full">
                                            <div className="absolute grid w-6 h-6 bg-white rounded-full text-slate-900 top-3 right-3 place-content-center">
                                                <Trash2Icon className="size-3" />
                                            </div>
                                        </CardBgImage>
                                    ) : (
                                        <button className="cursor-pointer w-max">
                                            <IconPlus />
                                        </button>
                                    )}
                                    {loadingIdx === index && (
                                        <div className="absolute inset-0 bg-white/70 rounded-xl grid place-content-center">
                                            <Spinner />
                                        </div>
                                    )}
                                </Card>
                            }
                            disabled={loadingIdx === index}
                            onSelectedFile={f => onSelectImage(f, index)}
                        />
                    )
                })}
            </div>
            <Button
                text='Continuar'
                type="submit"
                color="primary"
                className="mx-auto"
                rounded
                disabled={loadingIdx !== null}
                onClick={() => setOpenAction('none')}
            />
        </>
    )
}

export default SetServiceImages