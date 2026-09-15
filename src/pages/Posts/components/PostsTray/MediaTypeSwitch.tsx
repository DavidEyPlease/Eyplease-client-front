import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MEDIA_TYPE_ICONS, MEDIA_TYPE_LABELS, PostMediaType } from '../../lib'

interface Props {
	value: PostMediaType
	/** Formatos que la publicación tiene; se ofrecen sólo esos. */
	types: PostMediaType[]
	onChange: (value: PostMediaType) => void
}

/** Conmutador vertical/cuadrada/video de la previsualización. */
const MediaTypeSwitch = ({ value, types, onChange }: Props) => {
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={next => next && onChange(next as PostMediaType)}
			className="gap-1 rounded-full bg-muted p-1"
		>
			{types.map(type => {
				const Icon = MEDIA_TYPE_ICONS[type]
				return (
					<ToggleGroupItem
						key={type}
						value={type}
						className="h-auto flex-none gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-muted-foreground first:rounded-full last:rounded-full hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-sm"
					>
						<Icon className="size-3.5" />
						{MEDIA_TYPE_LABELS[type]}
					</ToggleGroupItem>
				)
			})}
		</ToggleGroup>
	)
}

export default MediaTypeSwitch
