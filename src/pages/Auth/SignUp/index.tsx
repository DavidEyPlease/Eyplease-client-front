import { useNavigate } from "react-router"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"
import { APP_ROUTES } from "@/constants/app"

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

const SignUpPage = () => {
    const navigate = useNavigate()
    const {
        form,
        step,
        totalSteps,
        currentKey,
        userType,
        fullName,
        firstName,
        planToShow,
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

    return (
        <SignUpWizardLayout>
            <WizardProgress current={step} total={totalSteps} />

            <div key={step} className="mt-8 animate-step-in">
                {currentKey === 'name' && (
                    <StepName register={register} errors={errors} onEnter={goNext} />
                )}
                {currentKey === 'email' && (
                    <StepEmail register={register} errors={errors} name={fullName} onEnter={goNext} />
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
                        ? 'Activar 14 días gratis'
                        : (currentKey === 'otherContext'
                            ? 'Enviar solicitud'
                            : undefined)
                }
            />

            <p className="mt-6 text-xs text-center text-eyp-gray-text">
                ¿Ya tienes cuenta?{' '}
                <button
                    type="button"
                    onClick={() => navigate(APP_ROUTES.AUTH.SIGN_IN)}
                    className="font-semibold underline text-eyp-violet hover:text-eyp-violet-deep"
                >
                    Inicia sesión
                </button>
            </p>
        </SignUpWizardLayout>
    )
}

export default SignUpPage
