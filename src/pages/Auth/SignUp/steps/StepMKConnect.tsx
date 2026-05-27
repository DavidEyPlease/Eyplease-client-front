import { useState } from "react"
import { type UseFormRegister, type FieldErrors, type UseFormSetValue, type UseFormWatch } from "react-hook-form"
import { Hash, Lock, ShieldCheck, AlertTriangle } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import ManualReportDialog from "../components/ManualReportDialog"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    watch: UseFormWatch<ISignUp>
    setValue: UseFormSetValue<ISignUp>
    onManualConfirm: () => void
    /**
     * Modo "simple" para Consultoras: solo usuario MK, sin password,
     * sin opción manual.
     */
    simple?: boolean
}

const StepMKConnect = ({ register, errors, setValue, onManualConfirm, simple = false }: Props) => {
    const [openManual, setOpenManual] = useState(false)

    const handleManualConfirm = () => {
        setValue('mkConnectMode', 'manual')
        setValue('mkUserId', undefined)
        setValue('mkPassword', undefined)
        setOpenManual(false)
        onManualConfirm()
    }

    return (
        <>
            <StepShell
                eyebrow="Conexión con tu unidad"
                title={simple ? 'Conecta tu cuenta Mary Kay' : 'Conectemos tu cuenta Mary Kay'}
                description={
                    simple
                        ? 'Con tu usuario te enlazamos con tu Directora para que recibas las publicaciones, materiales y reconocimientos de tu unidad.'
                        : 'Para que Eyplease+ trabaje con tu unidad real, ingresa tus datos de marykayintouch.com.mx.'
                }
            >
                <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-3 p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/60">
                        <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 shrink-0">
                            <AlertTriangle className="w-4 h-4" />
                        </span>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-bold text-amber-900">
                                Pon tu usuario real
                            </p>
                            <p className="mt-0.5 text-xs leading-relaxed text-amber-800">
                                {simple
                                    ? 'Si pones un número falso, no podrás recibir las publicaciones y materiales de tu Directora.'
                                    : 'Si pones un número falso, no podremos conectar con tu unidad y tus consultoras no aparecerán en tu cuenta.'}
                            </p>
                        </div>
                    </div>

                    <WizardInput
                        type="text"
                        placeholder="Tu número de usuario Mary Kay"
                        autoComplete="username"
                        icon={<Hash className="w-5 h-5" />}
                        register={register("mkUserId")}
                        error={errors.mkUserId?.message}
                    />

                    {!simple && (
                        <WizardInput
                            type="password"
                            placeholder="Tu contraseña Mary Kay"
                            autoComplete="current-password"
                            icon={<Lock className="w-5 h-5" />}
                            register={register("mkPassword")}
                            error={errors.mkPassword?.message}
                        />
                    )}

                    <div className="flex items-start gap-2 px-1">
                        <ShieldCheck className="w-4 h-4 mt-0.5 text-eyp-cyan shrink-0" />
                        <p className="text-xs leading-relaxed text-eyp-gray-text">
                            <b className="text-eyp-ink">Tus datos se guardan cifrados.</b>{' '}
                            {simple
                                ? 'Solo se usan para enlazarte con tu unidad.'
                                : 'Solo se usan para leer los reportes de tu unidad y traer a tus consultoras de forma automática cada mes. Nadie las ve.'}
                        </p>
                    </div>

                    {!simple && (
                        <button
                            type="button"
                            onClick={() => setOpenManual(true)}
                            className="self-center mt-1 text-sm font-medium underline text-eyp-gray-text hover:text-eyp-violet"
                        >
                            Prefiero hacer la conexión manual
                        </button>
                    )}
                </div>
            </StepShell>

            {!simple && (
                <ManualReportDialog
                    open={openManual}
                    onOpenChange={setOpenManual}
                    onConfirm={handleManualConfirm}
                />
            )}
        </>
    )
}

export default StepMKConnect
