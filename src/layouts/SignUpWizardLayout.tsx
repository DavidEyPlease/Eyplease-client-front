import { X } from "lucide-react"

import EYPLEASE_LOGO from "@/assets/icons/icon.png"
import LANDING_BG from "@/assets/images/landing-bg.jpg"
import SignUpStage from "./TopShell/SignUpStage"
import { isNewShell } from "./TopShell/useNewShell"

const WEB_URL = import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'

interface Props {
    children: React.ReactNode
    showClose?: boolean
    /** Sólo con el diseño nuevo: titular, bajada y contenido de la columna de marca */
    title?: React.ReactNode
    lead?: React.ReactNode
    aside?: React.ReactNode
}

const SignUpWizardLayout = ({ children, showClose = true, title, lead, aside }: Props) => {
    // El mismo interruptor que el acceso y el área autenticada (`?nuevo=0` enseña el anterior sólo en esa pestaña, para revisar fallos)
    if (isNewShell()) {
        return <SignUpStage showClose={showClose} title={title} lead={lead} aside={aside}>{children}</SignUpStage>
    }

    return (
        <div className="relative flex items-center justify-center min-h-screen px-4 py-8 overflow-hidden font-display">
            <div
                className="absolute inset-0 bg-no-repeat bg-cover bg-center"
                style={{ backgroundImage: `url(${LANDING_BG})` }}
                aria-hidden="true"
            />
            <div
                className="absolute inset-0 bg-white/55 backdrop-blur-md"
                aria-hidden="true"
            />

            <div className="absolute flex top-5 left-5 flex-col items-center">
                <img src={EYPLEASE_LOGO} alt="Eyplease+" className="size-14 rounded-xl" />
            </div>

            <div className="relative w-full max-w-lg">
                {/* bg-card: los pasos ya siguen el tema (claro/oscuro) y aquí deben poder leerse */}
                <div className="relative overflow-hidden bg-card text-card-foreground shadow-2xl rounded-3xl ring-1 ring-eyp-violet/10">
                    {showClose && (
                        <a
                            href={WEB_URL}
                            aria-label="Cerrar"
                            className="absolute z-10 flex items-center justify-center transition-colors rounded-full top-4 right-4 w-9 h-9 text-eyp-gray-text hover:bg-eyp-gray-warm hover:text-eyp-ink"
                        >
                            <X className="w-5 h-5" />
                        </a>
                    )}

                    {/* Con el botón de cerrar, el contenido baja para que la barra de pasos no quede debajo de él */}
                    <div className={showClose ? "px-6 pt-14 pb-8 sm:px-10" : "px-6 py-8 sm:px-10"}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUpWizardLayout
