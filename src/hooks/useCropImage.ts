import { centerAspectCrop } from "@/utils/files"
import { useRef, useState } from "react"
import { Crop } from "react-image-crop"

const aspect = 1

const useCropImage = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [imgSrc, setImgSrc] = useState<string>('')
    const [crop, setCrop] = useState<Crop>()
    const imgRef = useRef<HTMLImageElement>(null)

    const onResetCrop = () => {
        setImgSrc('')
        setCrop(undefined)
    }

    const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        if (aspect) {
            const { width, height } = e.currentTarget
            setCrop(centerAspectCrop(width, height, aspect))
        }
    }

    return {
        selectedFile,
        imgSrc,
        crop,
        imgRef,
        setSelectedFile,
        setImgSrc,
        setCrop,
        onResetCrop,
        onImageLoad
    }
}

export default useCropImage