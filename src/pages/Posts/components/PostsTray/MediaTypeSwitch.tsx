import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { ImageIcon, VideoIcon } from 'lucide-react'
import { POST_MEDIA_TYPES, PostMediaType } from '../../lib'

const OPTIONS = [
	{ value: POST_MEDIA_TYPES.IMAGE, label: 'Imagen', Icon: ImageIcon },
	{ value: POST_MEDIA_TYPES.VIDEO, label: 'Video', Icon: VideoIcon },
]

interface Props {
	value: PostMediaType
	onChange: (value: PostMediaType) => void
}

/** Conmutador imagen/video de la previsualización. */
const MediaTypeSwitch = ({ value, onChange }: Props) => {
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={next => next && onChange(next as PostMediaType)}
			className="gap-1 rounded-full bg-muted p-1"
		>
			{OPTIONS.map(({ value: option, label, Icon }) => (
				<ToggleGroupItem
					key={option}
					value={option}
					className="h-auto flex-none gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-bold text-muted-foreground first:rounded-full last:rounded-full hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-sm"
				>
					<Icon className="size-3.5" />
					{label}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	)
}

export default MediaTypeSwitch
