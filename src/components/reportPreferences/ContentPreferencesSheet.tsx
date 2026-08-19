import { SlidersHorizontalIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import ContentPreferencesPanel from './ContentPreferencesPanel'
import { useReportPreferences } from './useReportPreferences'

interface Props {
    open: boolean
    preferences: ReturnType<typeof useReportPreferences>
    /** Boletín que se está generando: el sheet solo muestra su contenido. */
    newsletterCode?: string | null
    onOpenChange: (open: boolean) => void
}

/**
 * Configuración permanente del contenido del boletín, en un panel lateral.
 * Se abre desde el paso de secciones del asistente; el guardado es explícito para
 * que quede claro que esto no afecta solo al boletín que se está generando.
 */
const ContentPreferencesSheet = ({ open, preferences, newsletterCode, onOpenChange }: Props) => {
    const { catalog, isDirty, saving, save, reset, discard } = preferences

    const newsletterName = catalog?.newsletters.find(item => item.code === newsletterCode)?.name

    /* Cerrar sin guardar descarta el borrador: lo que vale es lo persistido */
    const onChange = (next: boolean) => {
        if (!next) discard()
        onOpenChange(next)
    }

    const onSave = async () => {
        await save()
        onOpenChange(false)
    }

    return (
        <Sheet open={open} onOpenChange={onChange}>
            <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg">
                <SheetHeader className="flex-row items-center gap-3 border-b py-3.5 pl-5 pr-12">
                    <span className="grid size-9 shrink-0 place-content-center rounded-xl bg-primary/[0.08] text-primary">
                        <SlidersHorizontalIcon className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                        <SheetTitle className="text-[14.5px]">Personalizar contenido</SheetTitle>
                        <p className="text-[11.5px] font-medium text-muted-foreground">
                            {newsletterName
                                ? `Se guarda para tu ${newsletterName.toLowerCase()}, en PDF y en PowerPoint.`
                                : 'Se aplica a todos tus boletines, en PDF y en PowerPoint.'}
                        </p>
                    </div>
                </SheetHeader>

                <div className="min-h-0 flex-1 overflow-y-auto">
                    <ContentPreferencesPanel preferences={preferences} newsletterCode={newsletterCode} />
                </div>

                {/* Footer fijo: el primario ocupa el espacio libre y el secundario no se
                    encoge, para que ninguno de los dos parta el texto ni se desborde. */}
                <footer className="flex items-center gap-2.5 border-t p-4">
                    <button
                        type="button"
                        onClick={reset}
                        className="shrink-0 cursor-pointer whitespace-nowrap rounded-brand border px-4 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Mostrar todo
                    </button>
                    <Button
                        text={saving ? 'Guardando…' : 'Guardar'}
                        className="min-w-0 flex-1 justify-center py-2.5 text-sm"
                        disabled={!isDirty || saving}
                        onClick={onSave}
                    />
                </footer>
            </SheetContent>
        </Sheet>
    )
}

export default ContentPreferencesSheet
