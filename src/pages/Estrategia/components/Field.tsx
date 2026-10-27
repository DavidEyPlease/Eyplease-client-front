import { cn } from '@/lib/utils'

interface Props {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    inputMode?: 'text' | 'numeric' | 'decimal'
    prefix?: string
    autoFocus?: boolean
    className?: string
}

/** Campo con su etiqueta arriba, como los del registro de la piel nueva. */
const Field = ({ label, value, onChange, placeholder, inputMode = 'text', prefix, autoFocus, className }: Props) => (
    <label className={cn('block rounded-[14px] border-[1.5px] border-border bg-card px-3 py-2 transition-shadow focus-within:border-[#6C47FF] focus-within:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]', className)}>
        <small className="block text-[10.5px] font-bold tracking-wider text-muted-foreground uppercase">{label}</small>
        <span className="flex items-center gap-1">
            {prefix && <span className="text-sm font-bold">{prefix}</span>}
            <input
                value={value}
                onChange={event => onChange(event.target.value)}
                inputMode={inputMode}
                placeholder={placeholder}
                autoFocus={autoFocus}
                autoComplete="off"
                className="min-h-[22px] w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-sm font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground/60"
            />
        </span>
    </label>
)

export default Field
