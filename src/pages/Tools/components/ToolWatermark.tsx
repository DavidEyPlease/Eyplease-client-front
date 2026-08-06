import WATERMARK from '@/assets/images/watermark.png'
import { TRANSPARENT_SHIELD } from '@/constants/app'

/**
 * Protección para contenido fuera del plan (la misma que tenía la vista anterior):
 * marca de agua visible sobre la pieza + escudo transparente que bloquea guardarla.
 */
const ToolWatermark = () => {
    return (
        <>
            <div className="pointer-events-none absolute inset-0 z-20 flex items-end justify-center">
                <img src={WATERMARK} alt="" aria-hidden className="size-full object-contain" />
            </div>
            <img
                src={TRANSPARENT_SHIELD}
                alt=""
                aria-hidden
                draggable={false}
                className="absolute inset-0 z-30 size-full object-cover opacity-0"
            />
        </>
    )
}

export default ToolWatermark
