import { cn } from '@/lib/utils'

interface Props {
	icon?: React.ReactNode
	children: React.ReactNode
	className?: string
}

/** Píldora de metadato: icono pequeño + texto corto (categoría, fecha, contadores…). */
const MetaPill = ({ icon, children, className }: Props) => {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-1.5 rounded-full border bg-surface-soft px-2.5 py-1 text-[11px] font-bold whitespace-nowrap text-muted-foreground [&_svg]:size-3 [&_svg]:shrink-0',
				className,
			)}
		>
			{icon}
			{children}
		</span>
	)
}

export default MetaPill
