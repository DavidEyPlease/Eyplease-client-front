import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface Props {
    open: boolean
    onClose: () => void
    title: string
    description?: React.ReactNode
    /** Lo que va pegado abajo (el total y el botón): no se va con el desplazamiento */
    footer?: React.ReactNode
    children: React.ReactNode
    className?: string
}

/** La ventana de «Ya me compró», «Compartir» y «Agregar»: encabezado, cuerpo que se desplaza y pie fijo. */
const Panel = ({ open, onClose, title, description, footer, children, className }: Props) => (
    <Dialog open={open} onOpenChange={value => { if (!value) onClose() }}>
        <DialogContent onOpenAutoFocus={event => event.preventDefault()} className={cn('flex max-h-[min(860px,92vh)] flex-col gap-0 overflow-hidden rounded-[24px] p-0 sm:max-w-[560px]', className)}>
            <div className="px-6 pt-5 pb-3 pr-12">
                <DialogTitle className="text-[19px] font-extrabold tracking-tight">{title}</DialogTitle>
                {description && <DialogDescription className="mt-1 text-[13px] leading-snug">{description}</DialogDescription>}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">{children}</div>
            {footer && <div className="border-t border-border bg-background/95 px-6 pt-3 pb-4">{footer}</div>}
        </DialogContent>
    </Dialog>
)

export default Panel
