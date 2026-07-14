import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import Button from '@/components/common/Button'
import { Template } from '@/interfaces/common'

interface Props {
    template?: Template
    open: boolean
    onOpenChange: (open: boolean) => void
    onUse: () => void
}

/** Vista previa ampliada de la portada de una plantilla, con opción de usarla. */
const TemplatePreviewDialog = ({ template, open, onOpenChange, onUse }: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="overflow-hidden rounded-[22px] p-0 sm:max-w-[420px]">
            {template && (
                <>
                    <DialogTitle className="sr-only">{template.name}</DialogTitle>
                    <DialogDescription className="sr-only">Vista previa de la portada de tu boletín</DialogDescription>

                    <img src={template.picture.url} alt={template.name} className="h-[300px] w-full object-cover" />

                    <div className="flex items-center gap-3 p-5">
                        <div className="min-w-0">
                            <p className="truncate text-base font-bold">{template.name}</p>
                            <p className="text-[12.5px] text-muted-foreground">Así se verá la portada de tu boletín</p>
                        </div>
                        <Button text="Usar esta plantilla" className="ml-auto shrink-0 px-[18px] py-[11px] text-sm" onClick={onUse} />
                    </div>
                </>
            )}
        </DialogContent>
    </Dialog>
)

export default TemplatePreviewDialog
