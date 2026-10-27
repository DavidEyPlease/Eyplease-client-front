import { cn } from '@/lib/utils'

const BASE = 'inline-flex h-[22px] items-center rounded-full px-2.5 text-[10.5px] font-bold tracking-wide whitespace-nowrap'

/** Las etiquetas de la estrategia: «Muévelo primero», «Ordena Ya», «ganas $279 c/u», el momento del mes… */
export const Chip = ({ tone, children, className }: { tone: 'magenta' | 'violet' | 'green' | 'amber', children: React.ReactNode, className?: string }) => (
    <span className={cn(BASE, {
        magenta: 'bg-[#E5077D]/10 text-[#C0066A] dark:text-[#FF7AC0]',
        violet: 'bg-[#6C47FF]/10 text-[#4E31C0] dark:text-[#BBAAFF]',
        green: 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-300',
        amber: 'bg-amber-400/15 text-amber-700 dark:text-amber-300',
    }[tone], className)}>{children}</span>
)

/** La tarjeta de las páginas de la estrategia: la misma de Mis clientas (borde, fondo y sombra de la piel nueva). */
export const Card = ({ title, aside, children, className }: { title?: string, aside?: React.ReactNode, children: React.ReactNode, className?: string }) => (
    <section className={cn('rounded-3xl border bg-card px-5 py-4 shadow-card', className)}>
        {(title || aside) && (
            <div className="flex items-baseline justify-between gap-2">
                {title && <h2 className="text-[11px] font-extrabold tracking-[.14em] text-[#6C47FF] uppercase dark:text-[#A894FF]">{title}</h2>}
                {aside}
            </div>
        )}
        {children}
    </section>
)
