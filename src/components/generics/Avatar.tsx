import clsx from "clsx"

import {
    Avatar as UIAvatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import Spinner from "../common/Spinner"

interface Props {
    src: string
    alt: string
    sizeClasses?: string
    className?: string
    loading?: boolean
}

/** «de», «del», «la»… no cuentan para las iniciales */
const PARTICULAS = new Set(['de', 'del', 'la', 'las', 'los', 'y'])

/**
 * Quien no tiene foto ve sus INICIALES, no su nombre completo.
 * Antes el respaldo pintaba el nombre entero dentro de un círculo de 32 px y se salía encimado;
 * se nota en cuanto una clienta no ha subido foto, que son la mayoría.
 */
const iniciales = (nombre: string) => (nombre ?? '')
    .toLocaleLowerCase('es-MX')
    .split(/\s+/)
    .filter(palabra => palabra && !PARTICULAS.has(palabra))
    .slice(0, 2)
    .map(palabra => palabra.charAt(0).toLocaleUpperCase('es-MX'))
    .join('') || '·'

const Avatar = ({ src, alt, sizeClasses, className, loading = false }: Props) => {
    return (
        <UIAvatar className={clsx(sizeClasses, className, "rounded-lg", 'relative')}>
            <AvatarImage
                src={src}
                alt={alt}
                className={clsx(sizeClasses, "object-cover")}
            />
            {loading &&
                <div className="absolute grid w-full h-full bg-black bg-opacity-50 rounded-lg place-items-center">
                    <Spinner />
                </div>
            }
            <AvatarFallback className="grid place-items-center rounded-full text-[11px] font-bold leading-none">{iniciales(alt)}</AvatarFallback>
        </UIAvatar>
    )
}

export default Avatar