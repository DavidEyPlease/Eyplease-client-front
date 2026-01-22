import { useState } from "react"
import { Dialog, DialogContent } from "../ui/dialog"
import { Button } from "../ui/button"
import { ExternalLink, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react"
import { isImage } from "@/utils"
import { EypleaseFile } from "@/interfaces/files"
import useFiles from "@/hooks/useFiles"
import Spinner from "../common/Spinner"

interface AttachmentViewerProps {
    isOpen: boolean
    onClose: () => void
    attachment: EypleaseFile
}

export function AttachmentViewer({ isOpen, onClose, attachment }: AttachmentViewerProps) {
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)

    const { executing, downloadFile } = useFiles()

    const currentAttachment = attachment

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 0.25, 3))
    }

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 0.25, 0.25))
    }

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    const handleOpenInNewTab = () => {
        window.open(currentAttachment.url, "_blank")
    }

    if (!currentAttachment) return null

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-transparent shadow-none max-h-[95vh] w-full h-full p-0 border-none">
                <div className="relative w-full h-full flex flex-col">
                    {/* Zoom controls for images */}
                    {isImage(attachment.ext) && (
                        <div className="absolute top-4 left-4 z-10 flex gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomOut}
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                                disabled={zoom <= 0.25}
                            >
                                <ZoomOut className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleZoomIn}
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                                disabled={zoom >= 3}
                            >
                                <ZoomIn className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleRotate}
                                className="bg-black/50 hover:bg-black/70 text-white rounded-full"
                            >
                                <RotateCw className="w-4 h-4" />
                            </Button>
                            <div className="flex flex-wrap justify-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-white hover:text-primary"
                                    onClick={handleOpenInNewTab}
                                >
                                    <ExternalLink className="size-4" />
                                    Abrir en una pestaña nueva
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled={executing}
                                    className="text-white hover:text-primary"
                                    onClick={() => downloadFile(currentAttachment.uri)}
                                >
                                    {executing ? <Spinner /> : <Download className="size-4" />}
                                    Descargar
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Main content area */}
                    <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
                        {isImage(attachment.ext) ? (
                            <div className="relative max-w-full max-h-full">
                                <img
                                    src={currentAttachment.url}
                                    alt={currentAttachment.type}
                                    className="max-w-full max-h-full object-contain transition-transform duration-200"
                                    style={{
                                        transform: `scale(${zoom}) rotate(${rotation}deg)`,
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-white">
                                <div className="w-24 h-24 bg-gray-600 rounded-lg flex items-center justify-center mb-4">
                                    <span className="text-2xl font-bold uppercase">
                                        {currentAttachment.ext}
                                    </span>
                                </div>
                                <p className="text-lg mb-2">Vista previa no disponible</p>
                                <p className="text-sm text-gray-400">Haz clic en "Abrir en una pestaña nueva" para ver el archivo</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
