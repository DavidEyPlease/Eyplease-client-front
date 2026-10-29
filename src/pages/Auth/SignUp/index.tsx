import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { Gift } from "lucide-react"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"
import { API_ROUTES } from "@/constants/api"
import { APP_ROUTES } from "@/constants/app"
import { PlanKeys } from "@/interfaces/plans"
import HttpService from "@/services/http"

import AccountPreview from "./components/AccountPreview"
import WizardProgress from "./components/WizardProgress"
import WizardFooter from "./components/WizardFooter"
import StepName from "./steps/StepName"
import StepEmail from "./steps/StepEmail"
import StepPhone from "./steps/StepPhone"
import StepUserType from "./steps/StepUserType"
import StepUnitDetails from "./steps/StepUnitDetails"
import StepPlanRecommendation from "./steps/StepPlanRecommendation"
import StepMKConnect from "./steps/StepMKConnect"
import StepPassword from "./steps/StepPassword"
import StepOtherContext from "./steps/StepOtherContext"
import useSignUpWizard from "./hooks/useSignUpWizard"


/** Quién invita con ese código (pública): su nombre de pila y cómo se le dice. Null mientras carga o si no se encuentra. */
const useInviter = (code: string | null) => {
    const [inviter, setInviter] = useState<{ first_name: string, title: string } | null>(null)

    useEffect(() => {
        if (!code) return
        HttpService.get<{ data: { first_name: string, title: string } }>(API_ROUTES.AREA.INVITER.replace('{code}', code), { auth: false, responseType: 'json' })
            .then(response => setInviter(response?.data ?? null))
            .catch(() => setInviter(null))
    }, [code])

    return inviter
}

const SignUpPage = () => {
    const navigate = useNavigate()
    const {
        form,
        invite,
        step,
        steps,
        totalSteps,
        currentKey,
        userType,
        fullName,
        firstName,
        planToShow,
        deal,
        loading,
        goNext,
        goBack,
    } = useSignUpWizard()

    const {
        register,
        control,
        watch,
        setValue,
        formState: { errors },
    } = form

    // Lo que va escribiendo, para «Tu cuenta» de la columna de marca
    const values = watch()

    // Llegó por una liga de invitación de la app (la misma que muestra la franja de eyplease.com.mx)
    // Las ligas de recomendación de una Directora son «D» + 6; las de consultora invitando a su Directora, 8 letras
    const fromDirector = /^d[a-z0-9]{6}$/i.test(invite.inviteCode ?? '')
    const inviter = useInviter(fromDirector ? invite.inviteCode : null)
    // La invitación de «Mis Directoras» dice quién la invita y el regalo (su primer mes del Ejecutivo)
    const gift = invite.plan === PlanKeys.EXECUTIVE ? ' · tu primer mes del Plan Ejecutivo es de regalo' : ''
    const inviteLabel = invite.inviteCode
        ? (fromDirector
            ? (inviter ? `Te invita ${inviter.first_name}, tu ${inviter.title}${gift}` : `Te recomendó una Directora que ya usa Eyplease+${gift}`)
            : 'Te invitó una consultora de tu unidad')
        : (invite.unitAccount ? 'Te invitó tu Directora' : null)

    return (
        <SignUpWizardLayout
            title={<>Tu cuenta, <span className="bg-gradient-to-r from-white to-[#9DF3F5] bg-clip-text text-transparent">en unos minutos.</span></>}
            lead="Unas preguntas rápidas y tu cuenta queda lista para empezar."
            aside={<AccountPreview values={values} steps={steps} current={step} planKey={planToShow} />}
        >
            {inviteLabel && (
                <p className="su-soft mx-auto mb-5 flex w-fit items-center gap-2 rounded-full px-3.5 py-1.5 text-[12.5px] font-bold">
                    <Gift className="su-accent size-4" />
                    {inviteLabel}
                </p>
            )}

            <WizardProgress current={step} total={totalSteps} />

            <div key={step} className="su-step mt-7">
                {currentKey === 'name' && (
                    <StepName register={register} errors={errors} onEnter={goNext} />
                )}
                {currentKey === 'email' && (
                    <StepEmail
                        register={register}
                        errors={errors}
                        name={fullName}
                        onEnter={goNext}
                        hint={invite.inviteCode && !fromDirector ? 'Usa el correo al que te llegó la invitación: así tu consultora recibe sus 3 meses de regalo.' : undefined}
                    />
                )}
                {currentKey === 'phone' && (
                    <StepPhone control={control} errors={errors} />
                )}
                {currentKey === 'userType' && (
                    <StepUserType control={control} errors={errors} />
                )}
                {currentKey === 'unitDetails' && (
                    <StepUnitDetails control={control} errors={errors} />
                )}
                {currentKey === 'plan' && (
                    <StepPlanRecommendation planKey={planToShow} firstName={firstName} />
                )}
                {currentKey === 'mk' && (
                    <StepMKConnect
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        simple={userType === 'consultant'}
                    />
                )}
                {currentKey === 'password' && (
                    <StepPassword
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        onEnter={goNext}
                    />
                )}
                {currentKey === 'otherContext' && (
                    <StepOtherContext register={register} errors={errors} watch={watch} />
                )}
            </div>

            <WizardFooter
                onBack={step > 0 ? goBack : undefined}
                onNext={goNext}
                loading={loading}
                isFinal={step === totalSteps - 1}
                nextLabel={
                    currentKey === 'plan'
                        ? deal.cta
                        : currentKey === 'otherContext'
                            ? 'Enviar solicitud'
                            // Con la oferta de entrada, al crear la cuenta sigue contratar el plan: que no la sorprenda
                            : step === totalSteps - 1 && deal.kind === 'offer'
                                ? 'Crear cuenta y contratar'
                                : undefined
                }
            />

            <p className="mt-6 text-center text-[13px] font-medium text-muted-foreground">
                ¿Ya tienes cuenta?{' '}
                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.AUTH.SIGN_IN)}
                    className="su-accent font-bold underline-offset-2 hover:underline"
                >
                    Inicia sesión
                </button>
            </p>
        </SignUpWizardLayout>
    )
}

export default SignUpPage
