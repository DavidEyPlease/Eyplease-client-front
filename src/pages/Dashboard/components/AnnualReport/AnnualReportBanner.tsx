import { Trophy, Crown, Star, Sparkles } from 'lucide-react'
import AnnualReportGenerator from './AnnualReportGenerator'

/**
 * CTA siempre visible del reporte anual (fuera del popup). Tarjeta con gradiente + iconos y el
 * selector de generación embebido.
 */
const AnnualReportBanner = () => (
    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-rose-500 via-pink-500 to-amber-400 p-5 shadow-xl">
        <div className="pointer-events-none absolute -top-6 -right-6 h-24 w-24 rounded-full bg-amber-200/30 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />

        <div className="relative z-10 flex flex-col items-center gap-6 text-center md:flex-row md:gap-8 md:text-left">
            <div className="relative flex size-20 shrink-0 items-center justify-center rounded-full bg-white/15 shadow-inner backdrop-blur-sm">
                <Trophy className="size-8 text-white drop-shadow" />
                <Crown className="absolute -top-1 -right-1 h-6 w-6 text-amber-200 animate-bounce" />
                <Sparkles className="absolute -bottom-1 -left-1 h-5 w-5 text-white/90 animate-pulse" />
            </div>

            <div className="flex flex-1 flex-col gap-3">
                <div className="flex items-center justify-center gap-2 md:justify-start">
                    <Star className="h-5 w-5 text-amber-200" />
                    <h2 className="text-lg font-extrabold tracking-tight text-white drop-shadow md:text-2xl">
                        Reporte Anual
                    </h2>
                </div>
                <p className="mx-auto max-w-xl text-sm text-white/85 md:mx-0 md:text-base">
                    Celebra los logros del año: reina de ventas, reina de inicios, cuadro de honor y estrellas.
                    Descárgalo en PDF o PowerPoint.
                </p>
                <AnnualReportGenerator className="mt-1 w-full max-w-md md:self-start" />
            </div>
        </div>
    </div>
)

export default AnnualReportBanner
