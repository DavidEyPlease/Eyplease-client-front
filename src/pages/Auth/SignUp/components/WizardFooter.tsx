import { ArrowLeft, ArrowRight } from "lucide-react"

import Button from "@/components/common/Button"
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
    const label = nextLabel ?? (isFinal ? "Crear cuenta" : "Siguiente")
    return (
        <div className="mt-8 flex items-center gap-3">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    disabled={loading}
                    className="-ml-2 inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm font-bold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                    <ArrowLeft className="size-4" />
                    {backLabel}
                </button>
            )}

            {/* El mismo botón que «Entrar»; en el celular ocupa lo que queda de la fila */}
            <Button
                type="button"
                onClick={onNext}
                disabled={nextDisabled}
                loading={loading}
                rounded
                size="lg"
                className={cn("ml-auto h-12 justify-center", onBack ? "flex-1 sm:flex-none" : "w-full sm:w-auto")}
                text={<>{label}{!loading && <ArrowRight className="size-4" />}</>}
            />
        </div>
    )
}

export default WizardFooter
