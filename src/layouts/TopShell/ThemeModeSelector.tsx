import { MoonIcon, SunIcon, SunMoonIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTheme } from '@/providers/theme-provider'

const MODES = [
    { value: 'light', label: 'Día', hint: 'Siempre claro', Icon: SunIcon },
    { value: 'system', label: 'Automático', hint: 'Sigue a tu equipo: claro de día, oscuro de noche', Icon: SunMoonIcon },
    { value: 'dark', label: 'Noche', hint: 'Siempre oscuro', Icon: MoonIcon },
] as const

interface Props {
    /** En la barra van sólo los iconos; en Preferencias, con su nombre */
    labels?: boolean
    className?: string
}

/**
 * Día · Automático · Noche. El interruptor de antes sólo tenía dos posiciones, así que quien
 * elegía una ya no podía volver a «que siga a mi equipo», que es con lo que arranca la web.
 */
const ThemeModeSelector = ({ labels = false, className }: Props) => {
    const { theme, setTheme } = useTheme()

    return (
        <div role="radiogroup" aria-label="Apariencia" className={cn('inline-flex rounded-xl bg-foreground/5 p-[3px]', className)}>
            {MODES.map(({ value, label, hint, Icon }) => (
                <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={theme === value}
                    title={labels ? hint : `${label} · ${hint}`}
                    onClick={() => setTheme(value)}
                    className={cn(
                        'flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-[9px] text-[12px] font-bold transition-colors',
                        labels ? 'px-3' : 'w-8',
                        theme === value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    <Icon className={cn('size-[15px]', theme === value && value === 'dark' && 'text-yellow-400', theme === value && value === 'light' && 'text-amber-500')} />
                    {labels && label}
                </button>
            ))}
        </div>
    )
}

export default ThemeModeSelector
