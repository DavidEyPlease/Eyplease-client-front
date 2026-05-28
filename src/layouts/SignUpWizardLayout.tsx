import { X } from "lucide-react"
import { useNavigate } from "react-router"

import EYPLEASE_LOGO from "@/assets/icons/icon.png"
import LANDING_BG from "@/assets/images/landing-bg.jpg"

interface Props {
    children: React.ReactNode
    showClose?: boolean
}

const SignUpWizardLayout = ({ children, showClose = true }: Props) => {
    const navigate = useNavigate()

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
                <div className="relative overflow-hidden bg-white shadow-2xl rounded-3xl ring-1 ring-eyp-violet/10">
                    {showClose && (
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            aria-label="Cerrar"
                            className="absolute z-10 flex items-center justify-center transition-colors rounded-full top-4 right-4 w-9 h-9 text-eyp-gray-text hover:bg-eyp-gray-warm hover:text-eyp-ink"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div className="px-6 py-8 sm:px-10">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUpWizardLayout
