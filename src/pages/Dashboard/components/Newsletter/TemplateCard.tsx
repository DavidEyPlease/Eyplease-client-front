import { Check, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Template } from '@/interfaces/common'

interface Props {
    template: Template
    selected: boolean
    onSelect: () => void
    onPreview: () => void
    onHoverChange?: (hovering: boolean) => void
}

/**
 * Tarjeta de plantilla del asistente: portada real, badge de selección, botón de
 * vista previa al pasar el cursor y pie con el estado. Réplica del `.tpl` del rediseño.
 */
const TemplateCard = ({ template, selected, onSelect, onPreview, onHoverChange }: Props) => (
    <div
        onClick={onSelect}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        className={cn(
            'group relative cursor-pointer overflow-hidden rounded-[18px] border-[1.5px] bg-card transition-all duration-200',
            selected
                ? 'border-primary shadow-[0_0_0_3px_rgba(78,49,192,0.14),0_10px_30px_-12px_rgba(41,27,105,0.22)]'
                : 'border-[#e2e0ee] hover:-translate-y-0.75 hover:border-[#d7d3ec] hover:shadow-[0_24px_60px_-18px_rgba(41,27,105,0.35)]'
        )}
    >
        <img src={template.picture.url} alt={template.name} className="h-36 w-full object-cover" />

        <span
            className={cn(
                'absolute left-2.5 top-2.5 grid size-6 place-content-center rounded-full bg-primary text-white shadow-[0_2px_8px_rgba(78,49,192,0.5)] transition-all duration-200',
                selected ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
            )}
        >
            <Check className="size-3.5" strokeWidth={3} />
        </span>

        <button
            type="button"
            onClick={e => {
                e.stopPropagation()
                onPreview()
            }}
            className="absolute right-2.5 top-2.5 inline-flex -translate-y-1 items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow-sm backdrop-blur transition-all duration-200 hover:text-primary group-hover:translate-y-0 group-hover:opacity-100"
        >
            <Eye className="size-4" />
            Vista previa
        </button>

        <div className="flex items-center justify-between px-3.5 py-2.5">
            <span className="text-[13.5px] font-semibold">{template.name}</span>
            <span className={cn('inline-flex items-center gap-1.5 text-xs font-semibold', selected ? 'text-primary' : 'text-muted-foreground')}>
                {selected && <Check className="size-3.5" strokeWidth={3} />}
                {selected ? 'Seleccionada' : 'Seleccionar'}
            </span>
        </div>
    </div>
)

export default TemplateCard
