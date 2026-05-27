import { useMemo, useState } from "react"
import { type Path } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import SignUpWizardLayout from "@/layouts/SignUpWizardLayout"
import useCustomForm from "@/hooks/useCustomForm"
import { APP_ROUTES } from "@/constants/app"
import { DEFAULT_COUNTRY_CODE } from "@/constants/countries"
import { type PlanId, recommendPlan } from "@/constants/plans"

import { type ISignUp, SignUpSchema } from "./schema"
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

type StepKey = 'name' | 'email' | 'phone' | 'userType' | 'unitDetails' | 'plan' | 'mk' | 'password' | 'otherContext'

const STEPS_DIRECTORA: StepKey[] = ['name', 'email', 'phone', 'userType', 'unitDetails', 'plan', 'mk', 'password']
const STEPS_CONSULTORA: StepKey[] = ['name', 'email', 'phone', 'userType', 'plan', 'mk']
const STEPS_OTRO: StepKey[] = ['name', 'email', 'phone', 'userType', 'otherContext']

const STEP_FIELDS: Record<StepKey, Path<ISignUp>[]> = {
    name: ['fullName'],
    email: ['email'],
    phone: ['countryCode', 'phoneNumber'],
    userType: ['userType'],
    unitDetails: ['unitSize', 'directorYears'],
    plan: [],
    mk: [],
    password: ['password', 'acceptTerms'],
    otherContext: [],
}

const SignUpPage = () => {
    const navigate = useNavigate()
    const [step, setStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const form = useCustomForm<ISignUp>(SignUpSchema, {
        fullName: '',
        email: '',
        countryCode: DEFAULT_COUNTRY_CODE,
        phoneNumber: '',
        password: '',
        userType: 'directora',
        unitSize: undefined,
        directorYears: undefined,
        recommendedPlan: undefined,
        mkConnectMode: 'auto',
        mkUserId: '',
        mkPassword: '',
        otherContext: '',
        acceptTerms: false as unknown as true,
    })

    const {
        register,
        control,
        watch,
        setValue,
        trigger,
        getValues,
        formState: { errors },
    } = form

    const userType = watch('userType')
    const fullName = watch('fullName')
    const unitSize = watch('unitSize')
    const directorYears = watch('directorYears')
    const recommendedPlan = watch('recommendedPlan')

    const orderedSteps = useMemo<StepKey[]>(
        () => {
            if (userType === 'consultora') return STEPS_CONSULTORA
            if (userType === 'otro') return STEPS_OTRO
            return STEPS_DIRECTORA
        },
        [userType]
    )
    const totalSteps = orderedSteps.length
    const currentKey = orderedSteps[step]

    const firstName = (fullName || '').split(' ')[0] || ''

    const validateMKStep = (): boolean => {
        const userId = (getValues('mkUserId') ?? '').trim()
        if (userType === 'consultora') {
            if (!userId) {
                toast.error('Ingresa tu usuario Mary Kay para enlazarte con tu Directora')
                return false
            }
            return true
        }
        const mode = getValues('mkConnectMode') ?? 'auto'
        if (mode === 'manual') return true
        const password = (getValues('mkPassword') ?? '').trim()
        if (!userId || !password) {
            toast.error('Ingresa tu usuario y contraseña Mary Kay, o elige "Prefiero hacerlo manual"')
            return false
        }
        return true
    }

    const goNext = async () => {
        const fields = STEP_FIELDS[currentKey]
        if (fields.length > 0) {
            const isValid = await trigger(fields)
            if (!isValid) return
        }
        if (currentKey === 'unitDetails') {
            if (!unitSize || !directorYears) {
                toast.error('Cuéntame el tamaño de tu unidad y tu tiempo como Directora')
                return
            }
            const calc = recommendPlan(userType, unitSize, directorYears)
            setValue('recommendedPlan', calc)
        }
        if (currentKey === 'userType' && !getValues('recommendedPlan')) {
            const calc = recommendPlan(userType, unitSize, directorYears)
            setValue('recommendedPlan', calc)
        }
        if (currentKey === 'mk') {
            if (!validateMKStep()) return
        }
        if (currentKey === 'otherContext') {
            const text = (getValues('otherContext') ?? '').trim()
            if (text.length < 10) {
                toast.error('Cuéntanos un poco más para que podamos ayudarte (mínimo 10 caracteres)')
                return
            }
        }
        if (step < totalSteps - 1) {
            setStep(s => s + 1)
        } else {
            await handleFinalSubmit()
        }
    }

    const goBack = () => {
        if (step > 0) setStep(s => s - 1)
    }

    const handleFinalSubmit = async () => {
        if (userType === 'otro') {
            setSubmitting(true)
            const data = getValues()
            await new Promise(r => setTimeout(r, 700))
            const params = new URLSearchParams({
                email: data.email,
                phone: `${data.countryCode}:${data.phoneNumber}`,
            })
            navigate(`${APP_ROUTES.AUTH.PENDING_REVIEW}?${params.toString()}`)
            return
        }
        if (userType === 'consultora') {
            setSubmitting(true)
            const data = getValues()
            await new Promise(r => setTimeout(r, 700))
            const params = new URLSearchParams({
                email: data.email,
                plan: data.recommendedPlan || '',
            })
            navigate(`${APP_ROUTES.AUTH.SUCCESS_REGISTER}?${params.toString()}`)
            return
        }
        const isValid = await trigger(['password', 'acceptTerms'])
        if (!isValid) return
        setSubmitting(true)
        const data = getValues()
        await new Promise(r => setTimeout(r, 700))
        const params = new URLSearchParams({
            email: data.email,
            phone: `${data.countryCode}:${data.phoneNumber}`,
            plan: data.recommendedPlan || '',
        })
        navigate(`${APP_ROUTES.AUTH.SIGN_UP_VERIFICATION_CODE}?${params.toString()}`)
    }

    const planToShow: PlanId = recommendedPlan
        ?? recommendPlan(userType, unitSize, directorYears)

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
                    <StepPlanRecommendation planId={planToShow} firstName={firstName} />
                )}
                {currentKey === 'mk' && (
                    <StepMKConnect
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        simple={userType === 'consultora'}
                        onManualConfirm={async () => {
                            if (step < totalSteps - 1) {
                                setStep(s => s + 1)
                            } else {
                                await handleFinalSubmit()
                            }
                        }}
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
                loading={submitting}
                isFinal={step === totalSteps - 1}
                nextLabel={
                    currentKey === 'plan'
                        ? 'Activar 14 días gratis'
                        : (userType === 'consultora' && currentKey === 'mk'
                            ? 'Crear cuenta y descargar app'
                            : (currentKey === 'otherContext'
                                ? 'Enviar solicitud'
                                : undefined))
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
