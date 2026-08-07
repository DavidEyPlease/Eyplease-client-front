import { ClockIcon, DownloadIcon, ImageIcon } from 'lucide-react'

import Spinner from '@/components/common/Spinner'
import { IUserRequestServiceFile } from '@/interfaces/requestService'
import { isImage } from '@/utils'
import { formatDate } from '@/utils/dates'
import WorkspaceSection from './WorkspaceSection'

interface Props {
    files: IUserRequestServiceFile[]
    loading: boolean
    downloadingFileId: string
    onPreview: (file: IUserRequestServiceFile) => void
    onDownload: (file: IUserRequestServiceFile) => void
}

/** Archivos subidos por el equipo de diseño: rejilla de versiones con vista previa y descarga. */
const DesignsSection = ({ files, loading, downloadingFileId, onPreview, onDownload }: Props) => {
    return (
        <WorkspaceSection icon={<ImageIcon aria-hidden />} title="Diseños del equipo" count={files.length}>
            {loading && <Spinner />}

            {!loading && files.length === 0 && (
                <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <ClockIcon className="size-4 shrink-0" aria-hidden />
                    Tu equipo de diseño aún no ha subido archivos. Te avisaremos aquí.
                </p>
            )}

            {!loading && files.length > 0 && (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2.5">
                    {files.map((attachment, index) => {
                        const isDownloading = downloadingFileId === attachment.id

                        return (
                            <li key={attachment.id} className="group relative overflow-hidden rounded-xl border transition-all hover:-translate-y-0.5 hover:shadow-card">
                                <button
                                    type="button"
                                    onClick={() => onPreview(attachment)}
                                    title={`Subido por ${attachment.uploaded_by?.name} el ${formatDate(attachment.created_at)}`}
                                    className="block aspect-4/5 w-full cursor-zoom-in bg-surface-soft"
                                >
                                    {isImage(attachment.file.ext) ? (
                                        <img src={attachment.file.url} alt="" loading="lazy" className="size-full object-cover" />
                                    ) : (
                                        <span className="grid size-full place-content-center text-[11px] font-extrabold text-muted-foreground uppercase">
                                            {attachment.file.ext}
                                        </span>
                                    )}
                                </button>

                                <span className="pointer-events-none absolute top-1.5 left-1.5 rounded-full bg-black/50 px-2 py-px text-[9px] font-extrabold text-white backdrop-blur-sm">
                                    v{index + 1}
                                </span>

                                <button
                                    type="button"
                                    aria-label="Descargar diseño"
                                    disabled={isDownloading}
                                    onClick={() => onDownload(attachment)}
                                    className="absolute right-1.5 bottom-1.5 grid size-7 cursor-pointer place-content-center rounded-full bg-card/95 text-primary opacity-0 shadow-md transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100 pointer-coarse:opacity-100"
                                >
                                    {isDownloading ? <Spinner size="xs" color="primary" className="w-auto" /> : <DownloadIcon className="size-3.5" />}
                                </button>
                            </li>
                        )
                    })}
                </ul>
            )}
        </WorkspaceSection>
    )
}

export default DesignsSection
