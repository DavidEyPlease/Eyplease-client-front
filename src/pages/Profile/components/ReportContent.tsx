import { FileTextIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import ContentPreferencesPanel from '@/components/reportPreferences/ContentPreferencesPanel'
import { useReportPreferences } from '@/components/reportPreferences/useReportPreferences'
import SectionCard from './SectionCard'

/** Mismo panel que el asistente del boletín, aquí como ficha del perfil. */
const ReportContent = () => {
    const preferences = useReportPreferences()
    const { isDirty, saving, save, reset } = preferences

    return (
        <SectionCard
            icon={<FileTextIcon aria-hidden />}
            title="Contenido de mis boletines"
            description="Elige qué secciones y bloques quieres ver"
        >
            <div className="overflow-hidden rounded-2xl border">
                <ContentPreferencesPanel preferences={preferences} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                    text={saving ? 'Guardando…' : 'Guardar cambios'}
                    className="py-2.5 text-sm"
                    disabled={!isDirty || saving}
                    onClick={save}
                />
                <button
                    type="button"
                    onClick={reset}
                    className="cursor-pointer text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                    Mostrar todo
                </button>
            </div>
        </SectionCard>
    )
}

export default ReportContent
