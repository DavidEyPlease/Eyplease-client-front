import type { ReactNode } from 'react'

import LOGO_CLARO from '@/assets/images/eyplease-logo-color.png'
import LOGO_OSCURO from '@/assets/images/eyplease-logo-fondo-oscuro.png'

interface Props {
    /** Con aviso (sin plan, sin datos, error) se dice eso con sus botones; sin aviso, el avance de la carga. */
    aviso?: string | null
    acciones?: ReactNode
    avance: number
    paso: string
    sello: string
}

/** La espera de los boletines interactivos: el logo, el avance en grande y qué se está haciendo; o un aviso. */
const PantallaDeCarga = ({ aviso, acciones, avance, paso, sello }: Props) => (
    <div className="fixed inset-0 z-10 grid place-content-center bg-background px-6" role="status">
        <div className="flex w-[min(360px,86vw)] flex-col items-center gap-5 text-center">
            <img src={LOGO_CLARO} alt="Eyplease+" className="w-24 animate-[eypflota_2.4s_ease-in-out_infinite_alternate] drop-shadow-[0_14px_18px_rgba(78,49,192,.28)] dark:hidden" />
            <img src={LOGO_OSCURO} alt="Eyplease+" className="hidden w-24 animate-[eypflota_2.4s_ease-in-out_infinite_alternate] drop-shadow-[0_14px_18px_rgba(44,212,217,.25)] dark:block" />
            {aviso ? (
                <>
                    <p className="text-base font-semibold">{aviso}</p>
                    <div className="flex flex-wrap justify-center gap-2">{acciones}</div>
                </>
            ) : (
                <>
                    <div className="bg-[linear-gradient(90deg,#4E31C0,#6C47FF,#2CD4D9)] bg-clip-text text-[64px] leading-none font-extrabold tracking-tight tabular-nums text-transparent">
                        {Math.round(avance)}<span className="text-3xl">%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-primary/10">
                        <div className="h-full rounded-full bg-[linear-gradient(90deg,#4E31C0,#6C47FF,#2CD4D9)] transition-[width] duration-300" style={{ width: `${avance}%` }} />
                    </div>
                    <p className="text-sm font-semibold text-muted-foreground">{paso}</p>
                    <p className="text-[10.5px] font-bold tracking-[.2em] text-muted-foreground/60 uppercase">{sello}</p>
                </>
            )}
        </div>
    </div>
)

export default PantallaDeCarga
