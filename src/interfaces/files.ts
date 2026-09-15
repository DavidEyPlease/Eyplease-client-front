export enum FileTypes {
    EVENT = 'event',
    USER_REQUESTED_SERVICE = 'user_requested_service',
    TRAINING_COVER = 'training_cover',
    TRAINING_PPTX = 'training_pptx',
    TRAINING_PDF_READING = 'training_pdf_reading',
    TRAINING_PPTX_TO_PDF = 'training_pptx_to_pdf',
    TRAINING_PDF_PREVIEW = 'training_pdf_preview',
    USER_PROFILE_PHOTO = 'user_profile_photo',
    USER_LOGOTYPE = 'user_logotype',
    CUSTOMER_CLIENT = 'customer_client',
    SPONSORED_PHOTO = 'sponsored_photo',
    SPONSOR_PHOTO = 'sponsor_photo',
    PAYMENT_RECEIPT = 'payment_receipt',
}

/**
 * Artefacto del que proviene el archivo de una publicación. Hasta septiembre de 2026 sólo
 * había dos y bastaba la extensión; con la imagen cuadrada dejó de bastar, porque comparte
 * extensión con la vertical. La API lo manda en `template_asset_type`.
 */
export const ARTIFACT_TYPES = {
    IMAGE: 'image',
    IMAGE_SQUARE: 'image_square',
    VIDEO: 'video',
} as const

export type ArtifactType = typeof ARTIFACT_TYPES[keyof typeof ARTIFACT_TYPES]

export interface EypleaseFile {
    id: string
    url: string
    type: FileTypes
    ext: string
    uri: string
    /** Puede venir vacío en publicaciones anteriores al cambio: se cae a la extensión. */
    template_asset_type?: ArtifactType | null
}

/** El artefacto del archivo, con respaldo por extensión para lo publicado antes. */
export const artifactOf = (file: EypleaseFile): ArtifactType =>
    file.template_asset_type ?? (file.ext === 'mp4' ? ARTIFACT_TYPES.VIDEO : ARTIFACT_TYPES.IMAGE)