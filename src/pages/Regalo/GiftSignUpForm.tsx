import { useState } from 'react'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { GiftView } from '@/interfaces/invitations'

/** El aviso vive en la web pública (igual que en el registro). */
const PRIVACY_URL = `${import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'}/politicas-privacidad/`

export interface GiftSignUpData {
    email: string
    phone: string
    password: string
}

interface Props {
    signup: NonNullable<GiftView['signup']>
    withGift: boolean
    sending: boolean
    error: string | null
    onSubmit: (data: GiftSignUpData) => void
}

const Fijo = ({ label, value }: { label: string, value: string }) => (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/70 py-2.5 last:border-0">
        <span className="text-[12.5px] font-semibold text-muted-foreground">{label}</span>
        <span className="text-right text-[14px] font-bold">{value}</span>
    </div>
)

/**
 * El registro de un minuto: su nombre, su número de consultora y su Directora ya vienen de la invitación (no se
 * cambian: la liga es suya); ella sólo pone su correo, su WhatsApp y una contraseña.
 */
const GiftSignUpForm = ({ signup, withGift, sending, error, onSubmit }: Props) => {
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [verClave, setVerClave] = useState(false)
    const [acepta, setAcepta] = useState(false)
    const [tocado, setTocado] = useState(false)

    const fallas = {
        email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? 'Escribe tu correo (te sirve para recuperar tu contraseña).' : null,
        phone: phone.length !== 10 ? 'Tu WhatsApp, a 10 dígitos.' : null,
        password: password.length < 8 ? 'Al menos 8 letras o números.' : null,
        acepta: !acepta ? 'Acepta los términos para continuar.' : null,
    }
    const valido = !Object.values(fallas).some(Boolean)

    const enviar = (event: React.FormEvent) => {
        event.preventDefault()
        setTocado(true)
        if (!valido || sending) return
        onSubmit({ email: email.trim().toLowerCase(), phone, password })
    }
    const ver = (campo: keyof typeof fallas) => (tocado ? fallas[campo] : null)

    return (
        <form onSubmit={enviar} noValidate className="grid gap-4">
            <div className="rounded-2xl bg-muted/60 px-4 py-1">
                <Fijo label="Nombre" value={signup.name} />
                <Fijo label="Número de consultora" value={signup.username} />
                <Fijo label="Tu Directora" value={signup.director_name} />
            </div>

            <label className="grid gap-1.5">
                <span className="text-[13px] font-bold">Tu correo</span>
                <Input type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" aria-invalid={!!ver('email')} />
                {ver('email') && <span className="text-[12px] font-semibold text-destructive">{ver('email')}</span>}
            </label>

            <label className="grid gap-1.5">
                <span className="text-[13px] font-bold">Tu WhatsApp</span>
                <div className="flex items-stretch gap-2">
                    <span className="grid h-11 place-items-center rounded-brand border border-input bg-surface-soft px-3 text-sm font-bold text-muted-foreground dark:bg-input/30">+52</span>
                    <Input type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 dígitos" aria-invalid={!!ver('phone')} />
                </div>
                {ver('phone') && <span className="text-[12px] font-semibold text-destructive">{ver('phone')}</span>}
            </label>

            <label className="grid gap-1.5">
                <span className="text-[13px] font-bold">Crea una contraseña</span>
                <div className="relative">
                    <Input type={verClave ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8" aria-invalid={!!ver('password')} className="pr-12" />
                    <button type="button" onClick={() => setVerClave(v => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Ver contraseña'} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground">
                        {verClave ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                </div>
                {ver('password') && <span className="text-[12px] font-semibold text-destructive">{ver('password')}</span>}
                <span className="text-[12px] text-muted-foreground">Entras con tu número de consultora y esta contraseña.</span>
            </label>

            <div className="flex items-start gap-3">
                <Checkbox id="regalo-terminos" checked={acepta} onCheckedChange={value => setAcepta(value === true)} className="mt-0.5 size-5" aria-invalid={!!ver('acepta')} />
                <label htmlFor="regalo-terminos" className="cursor-pointer text-[13px] leading-relaxed text-muted-foreground">
                    Acepto los términos y condiciones y el{' '}
                    <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-[#6C47FF] underline underline-offset-2 dark:text-[#A894FF]">aviso de privacidad</a>.
                </label>
            </div>
            {ver('acepta') && <span className="-mt-2 text-[12px] font-semibold text-destructive">{ver('acepta')}</span>}

            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-sm font-semibold text-destructive">{error}</p>}

            <button type="submit" disabled={sending} className="inline-flex h-13 items-center justify-center gap-2 rounded-[16px] bg-primary-gradient px-5 text-[16px] font-extrabold text-white shadow-primary-glow disabled:opacity-70">
                {sending && <LoaderCircleIcon className="size-4 animate-spin" />}
                {withGift ? 'Activar y ver mi estrategia' : 'Crear mi cuenta'}
            </button>
        </form>
    )
}

export default GiftSignUpForm
