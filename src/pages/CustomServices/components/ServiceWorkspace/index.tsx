import { useMemo, useState } from 'react'
import { PencilIcon, TrashIcon } from 'lucide-react'

import Spinner from '@/components/common/Spinner'
import AlertConfirm from '@/components/generics/AlertConfirm'
import { AttachmentViewer } from '@/components/generics/AttachmentViewer'
import { Button } from '@/components/ui/button'
import { API_ROUTES } from '@/constants/api'
import useAuth from '@/hooks/useAuth'
import useFetchQuery from '@/hooks/useFetchQuery'
import useRequestQuery from '@/hooks/useRequestQuery'
import { EypleaseFile } from '@/interfaces/files'
import { IUserRequestServiceFile, UserRequestService } from '@/interfaces/requestService'
import { queryKeys } from '@/utils/cache'
import useServiceFiles from '../../hooks/useServiceFiles'
import { canDeleteService, canEditService, isOwnFile } from '../../utils'
import ServiceMeta from '../ServiceMeta'
import ServiceStatusBadge from '../../ServiceRequests/components/StatusBadge'
import CorrectionComposer from './CorrectionComposer'
import DesignsSection from './DesignsSection'
import HistorySection from './HistorySection'
import ReferencesSection from './ReferencesSection'
import ServiceStepper from './ServiceStepper'

interface Props {
    item: UserRequestService
    /** Oculta título y acciones del servicio (p. ej. dentro del drawer de un evento) */
    showHeader?: boolean
    /** Permite sacar el redactor de corrección del flujo (p. ej. fijado al pie del drawer) */
    showComposer?: boolean
    onEdit?: () => void
    onDeleted?: () => void
}

/** Expediente del servicio: progreso, diseños, referencias, historial y corrección en un solo lugar. */
const ServiceWorkspace = ({ item, showHeader = true, showComposer = true, onEdit, onDeleted }: Props) => {
    const { user } = useAuth()
    const [previewFile, setPreviewFile] = useState<EypleaseFile | null>(null)

    const { response: serviceFiles, loading: loadingFiles, setData: setFiles } = useFetchQuery<IUserRequestServiceFile[]>(
        API_ROUTES.CUSTOM_SERVICES.GET_FILES.replace('{id}', item.id),
        {
            customQueryKey: queryKeys.list(`user-request-service-files-${item.id}`),
            enabled: !!item.id,
        }
    )

    const { fileLoadingAction, onDeleteFile, onUploadFiles, onDownloadFile } = useServiceFiles()

    const { request: deleteRequest, requestState: deleteState } = useRequestQuery({
        invalidateQueries: [queryKeys.list('services')],
    })

    const files = useMemo(() => serviceFiles?.data ?? [], [serviceFiles?.data])
    const designFiles = useMemo(() => files.filter(file => !isOwnFile(file, user?.user_id)), [files, user?.user_id])
    const referenceFiles = useMemo(() => files.filter(file => isOwnFile(file, user?.user_id)), [files, user?.user_id])

    const onUpload = (newFiles: File[]) => {
        onUploadFiles(newFiles, uploaded => setFiles([...files, ...uploaded]))
    }

    const onDeleteReference = (attachment: IUserRequestServiceFile) => {
        onDeleteFile(attachment, () => setFiles(files.filter(file => file.id !== attachment.id)))
    }

    const onDeleteService = async () => {
        try {
            await deleteRequest('DELETE', API_ROUTES.CUSTOM_SERVICES.DELETE.replace('{id}', item.id))
            onDeleted?.()
        } catch (error) {
            console.error('Error deleting service:', error)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            {showHeader && (
                <div className="flex items-start gap-2">
                    <h2 className="min-w-0 flex-1 text-[17px] leading-snug font-extrabold tracking-tight">{item.title}</h2>
                    <ServiceStatusBadge status={item.status} />
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Editar servicio"
                        disabled={!canEditService(item.status)}
                        className="cursor-pointer text-muted-foreground hover:text-primary"
                        onClick={onEdit}
                    >
                        <PencilIcon />
                    </Button>
                    {canDeleteService(item.status) && (
                        <AlertConfirm
                            trigger={
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    title="Eliminar servicio"
                                    disabled={deleteState.loading}
                                    className="cursor-pointer text-muted-foreground hover:text-rose-600"
                                >
                                    {deleteState.loading ? <Spinner size="xs" color="primary" className="w-auto" /> : <TrashIcon />}
                                </Button>
                            }
                            description="El servicio personalizado será eliminado permanentemente. Esta acción no se puede deshacer."
                            loading={deleteState.loading}
                            onConfirm={onDeleteService}
                        />
                    )}
                </div>
            )}

            <ServiceMeta item={item} />

            <ServiceStepper status={item.status} />

            <DesignsSection
                files={designFiles}
                loading={loadingFiles}
                downloadingFileId={fileLoadingAction}
                onPreview={attachment => setPreviewFile(attachment.file)}
                onDownload={onDownloadFile}
            />

            <ReferencesSection
                itemId={item.id}
                files={referenceFiles}
                loading={loadingFiles}
                deletingFileId={fileLoadingAction}
                onUpload={onUpload}
                onPreview={attachment => setPreviewFile(attachment.file)}
                onDelete={onDeleteReference}
            />

            <HistorySection itemId={item.id} />

            {showComposer && <CorrectionComposer itemId={item.id} />}

            {previewFile && (
                <AttachmentViewer
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    attachment={previewFile}
                />
            )}
        </div>
    )
}

export default ServiceWorkspace
