import Modal from "@/components/common/Modal"
import { CONFLICT_CODES, ConflictHeadingsError, ConflictUsersError } from "../lib"
import Spinner from "@/components/common/Spinner"
import { FileWarningIcon } from "lucide-react"

interface Props {
    open: boolean
    loading: boolean
    uploadError: ConflictUsersError | ConflictHeadingsError | null
    onClose: () => void
}

const FeedbackUploadReport = ({ open, loading, uploadError, onClose }: Props) => {
    const { error_code } = uploadError?.errors || {}
    const conflictUsersError = error_code === CONFLICT_CODES.CROSS_USER_VALIDATION_ERROR ? (uploadError as ConflictUsersError).errors.conflict_users : []
    // const headingsErrors = error_code === CONFLICT_CODES.INVALID_REPORT_HEADINGS ? (uploadError as ConflictHeadingsError).errors : null
    console.log('conflictUsersError', conflictUsersError)
    return (
        <Modal
            title="Subida de reporte"
            open={open}
            size="lg"
            onOpenChange={onClose}
        >
            {loading && (
                <>
                    <Spinner size="lg" />
                    <p className="text-muted-foreground mt-2">
                        Cargando reporte... Este proceso puede tardar unos segundos, no salgas de esta ventana.
                    </p>
                </>
            )}
            {uploadError && (
                <div className="flex justify-center items-center flex-col gap-y-5 text-center">
                    <FileWarningIcon className="text-warning size-20" />
                    <p className="text-muted-foreground">
                        {error_code === CONFLICT_CODES.CROSS_USER_VALIDATION_ERROR && (
                            'El archivo que intentas subir contiene usuarios que no pertenecen a tu cartera. Por favor, revisa el archivo e intenta nuevamente. Usuarios en conflicto: ' + conflictUsersError.map(i => `${i.consultant_code} - ${i.name}`).join(', ')
                        )}
                        {error_code === CONFLICT_CODES.INVALID_REPORT_HEADINGS && (
                            'El archivo que intentas subir no cumple con el formato requerido para este reporte'
                        )}
                    </p>
                </div>
            )}
        </Modal>
    )
}

export default FeedbackUploadReport