import { useState } from "react"
import { type UseFormRegister, type FieldErrors, type UseFormSetValue, type UseFormWatch } from "react-hook-form"
import { Hash, Lock, ShieldCheck, AlertTriangle, Info } from "lucide-react"

import StepShell from "../components/StepShell"
import WizardInput from "../components/WizardInput"
import ManualReportDialog from "../components/ManualReportDialog"
import type { ISignUp } from "../schema"

interface Props {
    register: UseFormRegister<ISignUp>
    errors: FieldErrors<ISignUp>
    watch: UseFormWatch<ISignUp>
    setValue: UseFormSetValue<ISignUp>
    /**
     * Modo "simple" para Consultoras: solo usuario MK, sin password,
     * sin opción manual.
     */
    simple?: boolean
}

const StepMKConnect = ({ register, errors, simple = false }: Props) => {
    const [openManual, setOpenManual] = useState(false)

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
                    <div className="flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <AlertTriangle className="size-[18px]" />
                        </span>
                        <div className="flex-1 text-left">
                            <p className="text-[14px] font-bold text-amber-900 dark:text-amber-200">
                                Pon tu usuario real
                            </p>
                            <p className="mt-0.5 text-[12.5px] leading-relaxed text-amber-800 dark:text-amber-200/80">
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
                        icon={<Hash />}
                        register={register("mkUserId")}
                        error={errors.mkUserId?.message}
                    />

                    {!simple && (
                        <div className="flex flex-col gap-2.5">
                            <WizardInput
                                type="password"
                                placeholder="Tu contraseña Mary Kay (Opcional)"
                                autoComplete="current-password"
                                icon={<Lock />}
                                register={register("mkPassword")}
                                error={errors.mkPassword?.message}
                            />
                            <div className="su-soft flex items-start gap-3 rounded-2xl p-3.5">
                                <span className="su-accent grid size-9 shrink-0 place-items-center rounded-xl bg-card shadow-sm">
                                    <Info className="size-[18px]" />
                                </span>
                                <div className="flex-1 text-left text-[12.5px] leading-relaxed text-muted-foreground">
                                    <p>
                                        <b className="text-foreground">La contraseña es opcional.</b>{' '}
                                        Si la ingresas, descargamos tus reportes <b className="text-foreground">automáticamente</b> cada mes.
                                        Si la dejas vacía, tendrás que <b className="text-foreground">subirlos manualmente</b>.
                                    </p>
                                    <p className="mt-1.5">
                                        Esta <b className="text-foreground">no es tu clave de Eyplease+</b>: es la que usas en marykayintouch.com.mx.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpenManual(true)}
                                className="su-accent self-center rounded-full px-3 py-1.5 text-[12.5px] font-bold underline-offset-4 hover:underline"
                            >
                                Cómo subir los reportes manualmente
                            </button>
                        </div>
                    )}

                    <div className="flex items-start gap-2 px-1">
                        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[#2CD4D9]" />
                        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
                            <b className="text-foreground">Tus datos se guardan cifrados.</b>{' '}
                            {simple
                                ? 'Solo se usan para enlazarte con tu unidad.'
                                : 'Solo se usan para leer los reportes de tu unidad y traer a tus consultoras de forma automática cada mes. Nadie las ve.'}
                        </p>
                    </div>
                </div>
            </StepShell>

            {!simple && (
                <ManualReportDialog
                    open={openManual}
                    onOpenChange={setOpenManual}
                />
            )}
        </>
    )
}

export default StepMKConnect
