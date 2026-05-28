import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Props {
    onBack?: () => void
    onNext: () => void
    backLabel?: string
    nextLabel?: string
    nextDisabled?: boolean
    loading?: boolean
    isFinal?: boolean
}

const WizardFooter = ({
    onBack,
    onNext,
    backLabel = "Atrás",
    nextLabel,
    nextDisabled,
    loading,
    isFinal,
}: Props) => {
    const finalLabel = isFinal ? "Crear cuenta" : "Siguiente"
    return (
        <div className="flex items-center justify-between gap-3 mt-8">
            {onBack ? (
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-eyp-gray-text hover:text-eyp-ink transition-colors disabled:opacity-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {backLabel}
                </button>
            ) : (
                <span />
            )}

            <button
                type="button"
                onClick={onNext}
                disabled={nextDisabled || loading}
                className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white rounded-full shadow-lg shadow-eyp-violet/30 transition-all duration-200",
                    "bg-eyp-gradient hover:shadow-xl hover:shadow-eyp-violet/40 hover:-translate-y-0.5",
                    "disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                )}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {nextLabel ?? finalLabel}
                {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
        </div>
    )
}

export default WizardFooter
