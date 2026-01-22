import useFiles from "@/hooks/useFiles"
import Button from "../common/Button"
import IconDownload from "../Svg/IconDownload"

interface DownloadButtonProps {
    uri: string
    customLoading?: boolean
    onCustomDownload?: () => void
}

const DownloadButton = ({ uri, customLoading, onCustomDownload }: DownloadButtonProps) => {
    const { executing, downloadFile } = useFiles()

    return (
        <Button
            text={
                <div className="flex items-center gap-1">
                    <IconDownload />
                    <small>Descargar</small>
                </div>
            }
            size="sm"
            rounded
            loading={executing || customLoading}
            block
            onClick={() => onCustomDownload ? onCustomDownload() : downloadFile(uri)}
        />
    )
}

export default DownloadButton