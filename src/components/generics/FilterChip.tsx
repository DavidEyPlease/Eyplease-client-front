import { cn } from '@/lib/utils'

interface Props {
	label: string
	icon?: React.ReactNode
	/** Icono al final del chip (p. ej. candado de sección bloqueada) */
	endIcon?: React.ReactNode
	active?: boolean
	disabled?: boolean
	className?: string
	onClick?: () => void
}

/** Chip de filtro en píldora: icono + etiqueta, con estado activo del sistema de diseño. */
const FilterChip = ({ label, icon, endIcon, active, disabled, className, onClick }: Props) => {
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
			{endIcon}
		</button>
	)
}

export default FilterChip
