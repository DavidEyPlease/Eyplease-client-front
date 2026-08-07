import { IUserRequestServiceFile, UserRequestService, UserRequestStatusTypes } from '@/interfaces/requestService'
import { isImage } from '@/utils'

/** Fases del proceso de un servicio (el stepper del workspace). */
export const SERVICE_STEPS = ['Solicitud', 'En diseño', 'Revisión', 'Entrega']

/** Paso (1-4) al que se proyecta cada estado. */
export const STATUS_STEP: Record<UserRequestStatusTypes, number> = {
    [UserRequestStatusTypes.UNASSIGNED]: 1,
    [UserRequestStatusTypes.IN_PROGRESS]: 2,
    [UserRequestStatusTypes.PENDING_CORRECTION]: 2,
    [UserRequestStatusTypes.READY_FOR_REVIEW]: 3,
    [UserRequestStatusTypes.COMPLETED]: 4,
    [UserRequestStatusTypes.READY_FOR_PUBLISH]: 4,
}

/** Orden de los chips de filtro por estado. */
export const STATUS_FILTER_ORDER: UserRequestStatusTypes[] = [
    UserRequestStatusTypes.UNASSIGNED,
    UserRequestStatusTypes.IN_PROGRESS,
    UserRequestStatusTypes.READY_FOR_REVIEW,
    UserRequestStatusTypes.PENDING_CORRECTION,
    UserRequestStatusTypes.COMPLETED,
    UserRequestStatusTypes.READY_FOR_PUBLISH,
]

export const isCorrectionStatus = (status: UserRequestStatusTypes) =>
    status === UserRequestStatusTypes.PENDING_CORRECTION

/* Mismas reglas que tenía la vista anterior */
export const canEditService = (status: UserRequestStatusTypes) =>
    status !== UserRequestStatusTypes.COMPLETED

export const canDeleteService = (status: UserRequestStatusTypes) =>
    status === UserRequestStatusTypes.UNASSIGNED

export const isOwnFile = (file: IUserRequestServiceFile, userId?: string) =>
    file.uploaded_by?.id === userId

/** Último diseño (imagen del equipo) para usar como miniatura de la solicitud. */
export const getServiceCover = (item: UserRequestService, userId?: string) => {
    const designs = (item.files ?? [])
        .filter(file => !isOwnFile(file, userId) && isImage(file.file?.ext ?? ''))
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return designs[0]?.file.url ?? null
}
