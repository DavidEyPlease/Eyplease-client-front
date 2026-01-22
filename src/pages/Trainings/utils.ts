import { EypleaseFile, FileTypes } from "@/interfaces/files"

export const getTrainingFileByType = (files: EypleaseFile[], type: FileTypes) => {
    return files.find(file => file.type === type) || null
}

export const TRAINING_FILE_NAME = {
    [FileTypes.TRAINING_PPTX]: 'Presentación PowerPoint',
    [FileTypes.TRAINING_PPTX_TO_PDF]: 'PDF PowerPoint',
    [FileTypes.TRAINING_PDF_READING]: 'Guía',
    [FileTypes.TRAINING_PDF_PREVIEW]: 'Prevista PowerPoint en PDF',
}