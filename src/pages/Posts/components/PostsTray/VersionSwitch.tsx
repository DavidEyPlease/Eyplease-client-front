import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { IPost } from '@/interfaces/posts'

interface Props {
	value: string
	/** Las versiones de esa noticia, en orden. */
	versions: IPost[]
	onChange: (postId: string) => void
}

/**
 * Conmutador entre las versiones de una misma pieza.
 *
 * Existe porque Círculo Rosa genera dos diseños por consultora —con y sin el
 * producto— y ningún reporte de Mary Kay dice cuál aplica: la decisión es de la
 * Directora, así que la pieza tiene que enseñarle las dos y dejarla elegir.
 *
 * La etiqueta viene de la subsección y no se arma aquí: lo que distingue a A de
 * B cambia según el escalón (en Target es el producto de bienvenida, en el resto
 * el del mes), así que el texto tiene que poder decirse uno por uno.
 */
const VersionSwitch = ({ value, versions, onChange }: Props) => {
	return (
		<ToggleGroup
			type="single"
			value={value}
			onValueChange={next => next && onChange(next)}
			className="min-w-0 gap-1 rounded-full bg-muted p-1"
		>
			{versions.map(version => (
				<ToggleGroupItem
					key={version.id}
					value={version.id}
					title={version.version_label ?? undefined}
					className="h-auto min-w-0 flex-none rounded-full px-3 py-1.5 text-[12px] font-bold text-muted-foreground first:rounded-full last:rounded-full hover:text-foreground data-[state=on]:bg-card data-[state=on]:text-primary data-[state=on]:shadow-sm"
				>
					<span className="truncate">{version.version_label ?? version.version_key?.toUpperCase()}</span>
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	)
}

export default VersionSwitch
