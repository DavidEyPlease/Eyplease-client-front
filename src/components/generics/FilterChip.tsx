import { cn } from '@/lib/utils'

interface Props {
	label: string
	icon?: React.ReactNode
	/** Icono al final del chip (p. ej. candado de sección bloqueada) */
	endIcon?: React.ReactNode
	/** Novedades sin ver en esta sección. Se omite en cero: un chip que siempre trae número deja de avisar. */
	badge?: number
	active?: boolean
	disabled?: boolean
	className?: string
	onClick?: () => void
}

/** Chip de filtro en píldora: icono + etiqueta, con estado activo del sistema de diseño. */
const FilterChip = ({ label, icon, endIcon, badge, active, disabled, className, onClick }: Props) => {
	return (
		<button
			type="button"
			disabled={disabled}
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[15px] [&_svg]:shrink-0',
				active
					? 'border-primary/30 bg-primary/[0.08] text-primary'
					: 'border-border bg-card text-muted-foreground hover:border-primary/25 hover:bg-surface-soft hover:text-foreground',
				className,
			)}
		>
			{icon}
			{label}
			{!!badge && (
				<span className="ml-0.5 inline-flex min-w-4.5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] leading-none font-bold text-white tabular-nums">
					{badge}
				</span>
			)}
			{endIcon}
		</button>
	)
}

export default FilterChip
