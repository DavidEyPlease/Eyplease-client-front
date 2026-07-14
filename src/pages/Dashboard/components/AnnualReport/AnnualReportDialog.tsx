import { useEffect, useState, type ReactNode } from 'react'
import Confetti from 'react-confetti'
import { Trophy, Crown, Star, Sparkles, Award } from 'lucide-react'
import Modal from '@/components/common/Modal'
import AnnualReportGenerator from './AnnualReportGenerator'

interface Props {
    open: boolean
    onClose: () => void
}

const CONFETTI_COLORS = ['#f43f5e', '#ec4899', '#fbbf24', '#f59e0b', '#fda4af', '#ffffff']

const HIGHLIGHTS: { icon: ReactNode; label: string }[] = [
    { icon: <Crown className="h-5 w-5 text-rose-500" />, label: 'Reina de ventas' },
    { icon: <Award className="h-5 w-5 text-pink-500" />, label: 'Reina de inicios' },
    { icon: <Trophy className="h-5 w-5 text-amber-500" />, label: 'Cuadro de honor' },
    { icon: <Star className="h-5 w-5 text-amber-400" />, label: 'Estrellas' },
]

/**
 * Popup de bienvenida del reporte anual: confetti (una ráfaga), iconos de las secciones y el
 * selector de generación. El confetti se renderiza FUERA del Modal (Radix usa transform, que
 * confinaría un `fixed` dentro del diálogo) para cubrir toda la ventana.
 */
const AnnualReportDialog = ({ open, onClose }: Props) => {
    const [size, setSize] = useState({ w: 0, h: 0 })

    useEffect(() => {
        const update = () => setSize({ w: window.innerWidth, h: window.innerHeight })
        update()
        window.addEventListener('resize', update)
        return () => window.removeEventListener('resize', update)
    }, [])

    return (
        <>
            {open && size.w > 0 && (
                <Confetti
                    width={size.w}
                    height={size.h}
                    recycle={false}
                    numberOfPieces={280}
                    gravity={0.12}
                    colors={CONFETTI_COLORS}
                    // react-confetti fija su canvas con inline style (position:absolute; z-index:2),
                    // que gana sobre className. Se sobreescribe por style para cubrir la ventana
                    // por ENCIMA del modal (Radix va en z-50).
                    style={{ position: 'fixed', zIndex: 100 }}
                />
            )}

            <Modal
                open={open}
                onOpenChange={next => { if (!next) onClose() }}
                size="md"
                title="🎉 ¡Es hora del Reporte Anual!"
                description="Cerramos el año. Genera el reconocimiento anual de tu unidad en PDF o PowerPoint."
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-linear-to-br from-rose-500 to-amber-400 shadow-lg">
                        <Trophy className="h-11 w-11 text-white drop-shadow" />
                        <Crown className="absolute -top-1.5 -right-1.5 h-7 w-7 text-amber-300 animate-bounce" />
                        <Sparkles className="absolute -bottom-1 -left-1.5 h-5 w-5 text-rose-300 animate-pulse" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 py-1">
                        {HIGHLIGHTS.map(item => (
                            <div key={item.label} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                {item.icon}
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <div className="w-full rounded-xl bg-linear-to-br from-rose-500 via-pink-500 to-amber-400 p-4 shadow-inner">
                        <AnnualReportGenerator onGenerated={onClose} />
                    </div>
                </div>
            </Modal>
        </>
    )
}

export default AnnualReportDialog
