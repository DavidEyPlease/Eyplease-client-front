import { cn } from '@/lib/utils'

const TONE_CLASSES = {
	primary: 'text-primary',
	cyan: 'text-cyan-700',
	success: 'text-green-600',
	danger: 'text-red-600',
} as const

interface Props {
	label: string
	value: React.ReactNode
	hint?: string
	icon?: React.ReactNode
	tone?: keyof typeof TONE_CLASSES
}

/** Métrica compacta: etiqueta en versalitas, cifra destacada y pie aclaratorio. */
const StatTile = ({ label, value, hint, icon, tone = 'primary' }: Props) => {
	const toneClass = TONE_CLASSES[tone]

	return (
		<div className="min-w-33 rounded-2xl border bg-card px-3.5 py-2.5">
			<p className={cn('flex items-center gap-1.5 text-[11.5px] font-bold uppercase tracking-wide [&_svg]:size-[15px]', toneClass)}>
				{icon}
				{label}
			</p>
			<p className={cn('mt-1.5 text-[23px] font-extrabold leading-none tracking-tight', toneClass)}>{value}</p>
			{hint && <p className="mt-0.5 text-[11px] font-semibold text-muted-foreground">{hint}</p>}
		</div>
	)
}

export default StatTile
