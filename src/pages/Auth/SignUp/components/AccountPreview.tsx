import { Check, ShieldCheck, User } from "lucide-react"

import { COUNTRIES } from "@/constants/countries"
import { DIRECTOR_YEARS_OPTIONS, TRIAL_DAYS, UNIT_SIZE_OPTIONS } from "@/constants/plans"
import { PlanKeys } from "@/interfaces/plans"
import { cn } from "@/lib/utils"
import type { StepKey } from "../hooks/useSignUpWizard"
import type { ISignUp } from "../schema"

const PLAN_NAMES: Record<PlanKeys, string> = {
    [PlanKeys.FREE]: 'Gratis',
    [PlanKeys.STANDARD]: 'Standard',
    [PlanKeys.BASIC]: 'Básico',
    [PlanKeys.EXECUTIVE]: 'Ejecutivo',
    [PlanKeys.ELITE]: 'Elite',
    [PlanKeys.NATIONAL]: 'Nacional',
}

const PROFILES: Record<ISignUp['userType'], string> = {
    director: 'Directora',
    consultant: 'Consultora',
    other: 'Otra red o industria',
}

interface Props {
    values: Partial<ISignUp>
    /** Los pasos de su camino, en orden, y en cuál va */
    steps: StepKey[]
    current: number
    planKey: PlanKeys
}

const initials = (name: string) =>
    name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('')

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max).trimEnd()}…` : text)

/**
 * «Tu cuenta» (columna de marca del registro): la cuenta se va armando mientras contesta.
 * Sólo pinta lo que ella misma escribe en ESTE equipo; la contraseña sale en puntos y la de
 * Mary Kay nunca aparece.
 */
const AccountPreview = ({ values, steps, current, planKey }: Props) => {
    const reached = (key: StepKey) => {
        const i = steps.indexOf(key)
        return i !== -1 && i <= current
    }

    const valueOf = (key: StepKey): { label: string, value: string, placeholder: string } => {
        switch (key) {
            case 'phone': {
                const dial = COUNTRIES.find(c => c.code === values.countryCode)?.dial ?? ''
                return { label: 'WhatsApp', value: values.phoneNumber ? `${dial} ${values.phoneNumber}` : '', placeholder: 'Para tu código y soporte' }
            }
            case 'userType':
                return { label: 'Perfil', value: reached('userType') && values.userType ? PROFILES[values.userType] : '', placeholder: '¿Directora o Consultora?' }
            case 'unitDetails': {
                const size = UNIT_SIZE_OPTIONS.find(o => o.value === values.unitSize)?.label
                const years = DIRECTOR_YEARS_OPTIONS.find(o => o.value === values.directorYears)?.label.toLowerCase()
                return { label: 'Tu unidad', value: [size, years].filter(Boolean).join(' · '), placeholder: 'Tamaño y experiencia' }
            }
            case 'plan':
                return { label: 'Plan', value: reached('plan') ? `${PLAN_NAMES[planKey]} · ${TRIAL_DAYS} días gratis` : '', placeholder: 'Te recomendamos uno' }
            case 'mk':
                return { label: 'Mary Kay', value: values.mkUserId?.trim() ? `Usuario ${values.mkUserId.trim()}` : '', placeholder: 'Conexión con tu unidad' }
            case 'password':
                return { label: 'Contraseña', value: values.password ? '•'.repeat(Math.min(values.password.length, 10)) : '', placeholder: 'Sólo tú la conoces' }
            case 'otherContext':
                return { label: 'Tu caso', value: values.otherContext?.trim() ? clip(values.otherContext.trim(), 30) : '', placeholder: 'De dónde vienes' }
            default:
                return { label: '', value: '', placeholder: '' }
        }
    }

    const rows = steps
        .map((key, i) => ({ key, i }))
        .filter(({ key }) => key !== 'name' && key !== 'email')

    const name = values.fullName?.trim() ?? ''
    const email = values.email?.trim() ?? ''

    return (
        <div className="auth-rise mt-10 w-full max-w-[430px]" style={{ '--i': 3 } as React.CSSProperties}>
            <div className="auth-glass rounded-[24px] p-5">
                <p className="text-[11px] font-bold tracking-[.14em] text-white/60 uppercase">Tu cuenta en Eyplease+</p>

                <div className="mt-3.5 flex items-center gap-3.5">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white/20 text-[16px] font-extrabold text-white ring-2 ring-white/30">
                        {initials(name) || <User className="size-5 text-white/80" />}
                    </span>
                    <div className="min-w-0 flex-1">
                        <b className={cn("block truncate text-[17px] font-extrabold tracking-tight", name ? "text-white" : "text-white/45")}>
                            {name || 'Tu nombre'}
                        </b>
                        <small className={cn("block truncate text-[12.5px] font-medium", email ? "text-white/75" : "text-white/35")}>
                            {email || 'tu@correo.com'}
                        </small>
                    </div>
                </div>

                <ul className="mt-4 grid gap-1 border-t border-white/15 pt-3">
                    {rows.map(({ key, i }) => {
                        const state = i < current ? 'done' : i === current ? 'live' : 'todo'
                        const { label, value, placeholder } = valueOf(key)
                        return (
                            <li
                                key={key}
                                className={cn("flex items-center gap-3 rounded-2xl px-2.5 py-2 transition-colors duration-300", state === 'live' && "bg-white/10")}
                            >
                                <span
                                    className={cn(
                                        "grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300",
                                        state === 'done' && "bg-white text-[#4E31C0]",
                                        state === 'live' && "su-live bg-white/90",
                                        state === 'todo' && "border-2 border-white/25"
                                    )}
                                >
                                    {state === 'done' && <Check className="size-3.5" strokeWidth={3.5} />}
                                    {state === 'live' && <i className="block size-2 rounded-full bg-[#4E31C0]" />}
                                </span>
                                <span className="w-[88px] shrink-0 text-[12.5px] font-semibold text-white/60">{label}</span>
                                <span className={cn("min-w-0 flex-1 truncate text-right text-[13.5px]", value ? "font-bold text-white" : "font-medium text-white/35")}>
                                    {value ? <span key="valor" className="su-val">{value}</span> : placeholder}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            </div>

            <p className="mt-4 flex items-center gap-2 text-[12.5px] font-medium text-white/65">
                <ShieldCheck className="size-4 shrink-0 text-[#9DF3F5]" />
                {values.userType === 'other'
                    ? 'Revisamos tu caso y te escribimos por WhatsApp.'
                    : `${TRIAL_DAYS} días gratis · Sin cobro automático · Cancela cuando quieras`}
            </p>
        </div>
    )
}

export default AccountPreview
