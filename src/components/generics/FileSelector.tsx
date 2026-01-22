import { BROWSER_EVENTS } from "@/constants/app"
import { BrowserEvent, subscribeEvent, unsubscribeEvent } from "@/utils/events"
import { useEffect, useRef } from "react"

interface Props {
    disabled?: boolean
    fileAccepts?: string
    fileUploaderComponent: React.ReactNode
    onSelectedFile: (file: File) => void;
}

const FileSelector = ({ fileUploaderComponent, disabled, onSelectedFile, fileAccepts = "image/*" }: Props) => {
    const inputFileRef = useRef<HTMLInputElement>(null)

    const onChangeInputFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            onSelectedFile(file)
        }
    }

    useEffect(() => {
        const handleEvent = (event: BrowserEvent<boolean>) => {
            if (event.detail && inputFileRef.current) {
                inputFileRef.current.value = ''
            }
        }

        subscribeEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, handleEvent as EventListener)

        return () => {
            unsubscribeEvent(BROWSER_EVENTS.CLEAR_FILE_UPLOADER, handleEvent as EventListener)
        }
    }, [])

    return (
        <>
            <div onClick={() => inputFileRef.current?.click()}>
                {fileUploaderComponent}
            </div>
            <input
                type="file"
                disabled={disabled}
                accept={fileAccepts}
                className="hidden"
                ref={inputFileRef}
                onChange={onChangeInputFile}
            />
        </>
    )
}

export default FileSelector