import { useEffect, useMemo, useState } from "react"
import { type Path } from "react-hook-form"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import useAuth from "@/hooks/useAuth"
import useCustomForm from "@/hooks/useCustomForm"
import usePhoneValidation from "@/hooks/usePhoneValidation"
import useRequestQuery from "@/hooks/useRequestQuery"
import { API_ROUTES } from "@/constants/api"
import { APP_ROUTES, SESSION_KEY } from "@/constants/app"
import { DEFAULT_COUNTRY_CODE } from "@/constants/countries"
import { recommendPlan } from "@/constants/plans"
import { AuthResponse } from "@/interfaces/common"
import { PlanKeys } from "@/interfaces/plans"

import { type ISignUp, SignUpSchema } from "../schema"

export type StepKey =
    | 'name'
    | 'email'
    | 'phone'
    | 'userType'
    | 'unitDetails'
    | 'plan'
    | 'mk'
    | 'password'
    | 'otherContext'

const STEPS_DIRECTOR: StepKey[] = ['name', 'email', 'phone', 'userType', 'unitDetails', 'plan', 'mk', 'password']
const STEPS_CONSULTANT: StepKey[] = ['name', 'email', 'phone', 'userType', 'plan', 'mk', 'password']
const STEPS_OTHER: StepKey[] = ['name', 'email', 'phone', 'userType', 'otherContext']

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

const useSignUpWizard = () => {
    const navigate = useNavigate()
    const { getMe } = useAuth()
    const [step, setStep] = useState(0)
    const [submitting, setSubmitting] = useState(false)

    const form = useCustomForm<ISignUp>(SignUpSchema, {
        fullName: '',
        email: '',
        countryCode: DEFAULT_COUNTRY_CODE,
        phoneNumber: '',
        password: '',
        userType: 'director',
        unitSize: undefined,
        directorYears: undefined,
        recommendedPlan: undefined,
        mkConnectMode: 'auto',
        mkUserId: '',
        mkPassword: '',
        otherContext: '',
        acceptTerms: false as unknown as true,
    })

    const { watch, setValue, trigger, getValues, setError, clearErrors } = form
    const { validate: validatePhone } = usePhoneValidation()

    const userType = watch('userType')
    const fullName = watch('fullName')
    const unitSize = watch('unitSize')
    const directorYears = watch('directorYears')
    const recommendedPlan = watch('recommendedPlan')

    const { request, requestState } = useRequestQuery({ onError: () => { } })

    const getErrorMessage = (error: unknown, fallback: string) =>
        (error as { message?: string; error?: string })?.message
        ?? (error as { error?: string })?.error
        ?? fallback

    const orderedSteps = useMemo<StepKey[]>(
        () => {
            if (userType === 'consultant') return STEPS_CONSULTANT
            if (userType === 'other') return STEPS_OTHER
            return STEPS_DIRECTOR
        },
        [userType]
    )
    const totalSteps = orderedSteps.length
    const currentKey = orderedSteps[step]

    useEffect(() => {
        if (currentKey !== 'userType') return
        setValue('unitSize', undefined)
        setValue('directorYears', undefined)
        setValue('recommendedPlan', undefined)
        clearErrors(['unitSize', 'directorYears'])
    }, [currentKey, setValue, clearErrors])

    const firstName = (fullName || '').split(' ')[0] || ''

    const validateMKStep = (): boolean => {
        const userId = (getValues('mkUserId') ?? '').trim()
        if (userType === 'consultant') {
            if (!userId) {
                toast.error('Ingresa tu usuario Mary Kay para enlazarte con tu Directora')
                return false
            }
            return true
        }
        if (!userId) {
            toast.error('Ingresa tu usuario Mary Kay')
            return false
        }
        const password = (getValues('mkPassword') ?? '').trim()
        setValue('mkConnectMode', password ? 'auto' : 'manual')
        return true
    }

    const validateEmail = async (): Promise<boolean> => {
        const email = (getValues('email') ?? '').trim()
        clearErrors('email')
        try {
            const response = await request('POST', API_ROUTES.SIGN_UP.VALIDATE_EMAIL, { email })
            if (response.success) return true
            setError('email', {
                type: 'server',
                message: response.error ?? response.message ?? 'No pudimos validar tu correo',
            })
            return false
        } catch (error) {
            setError('email', {
                type: 'server',
                message: getErrorMessage(error, 'No pudimos validar tu correo, intenta nuevamente'),
            })
            return false
        }
    }

    const validateUsername = async (): Promise<boolean> => {
        const username = (getValues('mkUserId') ?? '').trim()
        clearErrors('mkUserId')
        try {
            const response = await request('POST', API_ROUTES.SIGN_UP.VALIDATE_USERNAME, { username })
            if (response.success) return true
            setError('mkUserId', {
                type: 'server',
                message: response.error ?? response.message ?? 'No pudimos validar tu usuario',
            })
            return false
        } catch (error) {
            setError('mkUserId', {
                type: 'server',
                message: getErrorMessage(error, 'No pudimos validar tu usuario, intenta nuevamente'),
            })
            return false
        }
    }

    const registerUser = async (): Promise<boolean> => {
        const data = getValues()
        const payload = {
            email: data.email,
            password: data.password,
            name: data.fullName,
            username: data.mkUserId,
            platformPassword: data.mkPassword || null,
            country: data.countryCode,
            planKey: data.recommendedPlan,
        }
        try {
            const response = await request<typeof payload, AuthResponse>('POST', API_ROUTES.SIGN_UP.REGISTER, payload)
            if (response.success && response.data?.token) {
                localStorage.setItem(SESSION_KEY, response.data.token)
                await getMe()
                return true
            }
            toast.error(response.error ?? response.message ?? 'No pudimos crear tu cuenta')
            return false
        } catch (error) {
            toast.error(getErrorMessage(error, 'No pudimos crear tu cuenta, intenta nuevamente'))
            return false
        }
    }

    const requestAccess = async (): Promise<boolean> => {
        const data = getValues()
        const payload = {
            name: data.fullName,
            email: data.email,
            phone: data.phoneNumber,
            country: data.countryCode,
            context: data.otherContext,
        }
        try {
            const response = await request('POST', API_ROUTES.SIGN_UP.REQUEST_ACCESS, payload)
            if (response.success) return true
            toast.error(response.error ?? response.message ?? 'No pudimos registrar tu solicitud')
            return false
        } catch (error) {
            toast.error(getErrorMessage(error, 'No pudimos registrar tu solicitud, intenta nuevamente'))
            return false
        }
    }

    const advanceStep = async () => {
        if (step < totalSteps - 1) {
            setStep(s => s + 1)
            return
        }
        await handleFinalSubmit()
    }

    const goNext = async () => {
        const fields = STEP_FIELDS[currentKey]
        if (fields.length > 0) {
            const isValid = await trigger(fields)
            if (!isValid) return
        }
        if (currentKey === 'email') {
            const ok = await validateEmail()
            if (!ok) return
        }
        if (currentKey === 'phone') {
            const result = validatePhone(getValues('phoneNumber'), getValues('countryCode'))
            if (!result.valid) {
                setError('phoneNumber', { type: 'validate', message: result.message })
                return
            }
            clearErrors('phoneNumber')
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
            const mode = getValues('mkConnectMode') ?? 'auto'
            if (userType === 'consultant' || mode !== 'manual') {
                const ok = await validateUsername()
                if (!ok) return
            }
        }
        if (currentKey === 'otherContext') {
            const text = (getValues('otherContext') ?? '').trim()
            if (text.length < 10) {
                toast.error('Cuéntanos un poco más para que podamos ayudarte (mínimo 10 caracteres)')
                return
            }
        }
        await advanceStep()
    }

    const goBack = () => {
        if (step > 0) setStep(s => s - 1)
    }

    const handleFinalSubmit = async () => {
        if (userType === 'other') {
            setSubmitting(true)
            const ok = await requestAccess()
            if (!ok) {
                setSubmitting(false)
                return
            }
            const data = getValues()
            const params = new URLSearchParams({
                email: data.email,
                phone: `${data.countryCode}:${data.phoneNumber}`,
            })
            navigate(`${APP_ROUTES.AUTH.PENDING_REVIEW}?${params.toString()}`)
            return
        }
        const isValid = await trigger(['password', 'acceptTerms'])
        if (!isValid) return
        setSubmitting(true)
        const ok = await registerUser()
        if (!ok) {
            setSubmitting(false)
            return
        }
        const params = new URLSearchParams({ email: getValues('email') })
        navigate(`${APP_ROUTES.AUTH.SUCCESS_REGISTER}?${params.toString()}`)
    }

    const planToShow: PlanKeys = recommendedPlan
        ?? recommendPlan(userType, unitSize, directorYears)

    return {
        form,
        step,
        totalSteps,
        currentKey,
        userType,
        fullName,
        firstName,
        planToShow,
        loading: submitting || requestState.loading,
        goNext,
        goBack,
        advanceStep,
    }
}

export default useSignUpWizard
