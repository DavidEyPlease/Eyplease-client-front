import { PaperclipIcon, XIcon } from 'lucide-react'

import { InputFile } from '@/components/common/Inputs/InputFile'
import Spinner from '@/components/common/Spinner'
import { IUserRequestServiceFile } from '@/interfaces/requestService'
import { isImage } from '@/utils'
import { formatDate } from '@/utils/dates'

interface Props {
    itemId: string
    files: IUserRequestServiceFile[]
    loading: boolean
    deletingFileId: string
    onUpload: (files: File[]) => void
    onPreview: (file: IUserRequestServiceFile) => void
    onDelete: (file: IUserRequestServiceFile) => void
}

/** Archivos de referencia subidos por el cliente: chips con vista previa, borrado y añadir más. */
const ReferencesSection = ({ itemId, files, loading, deletingFileId, onUpload, onPreview, onDelete }: Props) => {
    return (
        <section>
            <header className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">
                <PaperclipIcon className="size-3.5 shrink-0" aria-hidden />
                Tus referencias
                <span className="rounded-full bg-primary/[0.08] px-2 py-px text-[10.5px] font-bold tracking-normal text-primary normal-case">
                    {files.length}
                </span>
            </header>

            {loading ? (
                <Spinner />
            ) : (
                <div className="flex flex-wrap items-center gap-2">
                    {files.map(attachment => {
                        const isDeleting = deletingFileId === attachment.id

                        return (
                            <div key={attachment.id} className="flex items-center gap-2 rounded-xl border bg-surface-soft py-1.5 pr-1.5 pl-1.5">
                                <button
                                    type="button"
                                    onClick={() => onPreview(attachment)}
                                    className="grid size-9 shrink-0 cursor-zoom-in place-content-center overflow-hidden rounded-lg border bg-card"
                                >
                                    {isImage(attachment.file.ext) ? (
                                        <img src={attachment.file.url} alt="" loading="lazy" className="size-full object-cover" />
                                    ) : (
                                        <span className="text-[8.5px] font-extrabold text-muted-foreground uppercase">{attachment.file.ext}</span>
                                    )}
                                </button>
                                <span className="text-[10.5px] leading-tight font-semibold text-muted-foreground">
                                    {formatDate(attachment.created_at, { formatter: { date: 'medium' } })}
                                </span>
                                <button
                                    type="button"
                                    aria-label="Eliminar referencia"
                                    disabled={isDeleting}
                                    onClick={() => onDelete(attachment)}
                                    className="grid size-6 cursor-pointer place-content-center rounded-full text-muted-foreground/60 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:pointer-events-none"
                                >
                                    {isDeleting ? <Spinner size="xs" color="primary" className="w-auto" /> : <XIcon className="size-3" />}
                                </button>
                            </div>
                        )
                    })}

                    <InputFile
                        id={`attachment-${itemId}`}
                        label="Añadir archivos"
                        multiple
                        onChange={event => onUpload(event.target.files ? Array.from(event.target.files) : [])}
                    />
                </div>
            )}
        </section>
    )
}

export default ReferencesSection
