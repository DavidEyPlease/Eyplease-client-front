import { useState } from 'react'
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

/** El aviso vive en la web pública (igual que en el registro). */
const PRIVACY_URL = `${import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'}/politicas-privacidad/`
const TERMS_URL = `${import.meta.env.VITE_WEB_URL || 'https://eyplease.com.mx'}/terminos/`

export interface UnidadSignUpData {
    name: string
    username: string
    email: string
    phone: string
    password: string
}

interface Props {
    numero: string
    directora: string
    sending: boolean
    error: string | null
    onSubmit: (data: UnidadSignUpData) => void
}

/**
 * El registro de un minuto desde la liga de su Directora: nombre, número de consultora (si lo dio al abrir la
 * presentación, ya viene puesto), correo, WhatsApp y contraseña. La cuenta queda ligada a la Unidad de esa Directora.
 */
const UnidadSignUpForm = ({ numero, directora, sending, error, onSubmit }: Props) => {
    const [name, setName] = useState('')
    const [username, setUsername] = useState(numero)
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [verClave, setVerClave] = useState(false)
    const [acepta, setAcepta] = useState(false)
    const [tocado, setTocado] = useState(false)

    const fallas = {
        name: name.trim().length < 3 ? 'Escribe tu nombre.' : null,
        username: !/^[A-Za-z0-9]{3,20}$/.test(username.trim()) ? 'Tu número de consultora de Mary Kay.' : null,
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
        onSubmit({ name: name.trim(), username: username.trim().toUpperCase(), email: email.trim().toLowerCase(), phone, password })
    }
    const ver = (campo: keyof typeof fallas) => (tocado ? fallas[campo] : null)
    const Campo = ({ campo, label, children }: { campo: keyof typeof fallas, label: string, children: React.ReactNode }) => (
        <label className="grid gap-1.5">
            <span className="text-[13px] font-bold">{label}</span>
            {children}
            {ver(campo) && <span className="text-[12px] font-semibold text-destructive">{ver(campo)}</span>}
        </label>
    )

    return (
        <form onSubmit={enviar} noValidate className="grid gap-4">
            <div className="flex items-baseline justify-between gap-3 rounded-2xl bg-muted/60 px-4 py-2.5">
                <span className="text-[12.5px] font-semibold text-muted-foreground">Tu Directora</span>
                <span className="text-right text-[14px] font-bold">{directora}</span>
            </div>

            {Campo({ campo: 'name', label: 'Tu nombre', children: <Input autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre y apellido" aria-invalid={!!ver('name')} /> })}
            {Campo({ campo: 'username', label: 'Tu número de consultora', children: <Input autoComplete="username" value={username} onChange={e => setUsername(e.target.value.slice(0, 20))} placeholder="Ej. 186234" aria-invalid={!!ver('username')} /> })}
            {Campo({ campo: 'email', label: 'Tu correo', children: <Input type="email" inputMode="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" aria-invalid={!!ver('email')} /> })}
            {Campo({ campo: 'phone', label: 'Tu WhatsApp', children: (
                <div className="flex items-stretch gap-2">
                    <span className="grid h-11 place-items-center rounded-brand border border-input bg-surface-soft px-3 text-sm font-bold text-muted-foreground dark:bg-input/30">+52</span>
                    <Input type="tel" inputMode="numeric" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10 dígitos" aria-invalid={!!ver('phone')} />
                </div>
            ) })}
            {Campo({ campo: 'password', label: 'Crea una contraseña', children: (
                <div className="relative">
                    <Input type={verClave ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 8" aria-invalid={!!ver('password')} className="pr-12" />
                    <button type="button" onClick={() => setVerClave(v => !v)} aria-label={verClave ? 'Ocultar contraseña' : 'Ver contraseña'} className="absolute inset-y-0 right-0 grid w-11 place-items-center text-muted-foreground hover:text-foreground">
                        {verClave ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                    </button>
                </div>
            ) })}

            <div className="flex items-start gap-3">
                <Checkbox id="unidad-terminos" checked={acepta} onCheckedChange={value => setAcepta(value === true)} className="mt-0.5 size-5" aria-invalid={!!ver('acepta')} />
                <label htmlFor="unidad-terminos" className="cursor-pointer text-[13px] leading-relaxed text-muted-foreground">
                    Acepto los{' '}
                    <a href={TERMS_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-[#6C47FF] underline underline-offset-2 dark:text-[#A894FF]">términos y condiciones</a>
                    {' '}y el{' '}
                    <a href={PRIVACY_URL} target="_blank" rel="noopener noreferrer" className="font-bold text-[#6C47FF] underline underline-offset-2 dark:text-[#A894FF]">aviso de privacidad</a>.
                </label>
            </div>
            {ver('acepta') && <span className="-mt-2 text-[12px] font-semibold text-destructive">{ver('acepta')}</span>}

            {error && <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-sm font-semibold text-destructive">{error}</p>}

            <button type="submit" disabled={sending} className="inline-flex h-13 items-center justify-center gap-2 rounded-[16px] bg-primary-gradient px-5 text-[16px] font-extrabold text-white shadow-primary-glow disabled:opacity-70">
                {sending && <LoaderCircleIcon className="size-4 animate-spin" />}
                Crear mi cuenta
            </button>
        </form>
    )
}

export default UnidadSignUpForm
