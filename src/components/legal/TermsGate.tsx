import { useState } from 'react'
import { ExternalLinkIcon, FileTextIcon, LogOutIcon } from 'lucide-react'
import { toast } from 'sonner'

import Button from '@/components/common/Button'
import { API_ROUTES } from '@/constants/api'
import useAuth from '@/hooks/useAuth'
import { IAuthUserTerms } from '@/interfaces/auth'
import HttpService from '@/services/http'
import useAuthStore from '@/store/auth'

/**
 * Términos y condiciones al entrar (David, 19-nov-2026: «tenemos que poner en la app para que acepten y que también sea
 * parte de lo que sale a inicio de una cuenta nueva»). Si /me dice que no ha aceptado la versión vigente (`terms`), tapa
 * la app hasta que los acepta: así los ven las clientas de hoy y toda cuenta nueva que no los aceptó al registrarse (las
 * que da de alta el equipo y las de la app de las tiendas). Quien los aceptó con la casilla del registro no lo ve.
 * Sin `terms` (una API anterior) no sale nada.
 */
const TermsGate = () => {
    const user = useAuthStore(state => state.user)
    const setUser = useAuthStore(state => state.setUser)
    const { handleLogout } = useAuth()
    const [saving, setSaving] = useState(false)

    const terms = user?.terms
    if (!user || !terms || terms.accepted) return null

    const accept = async () => {
        setSaving(true)
        try {
            const response = await HttpService.post<{ success: boolean, data: IAuthUserTerms, message?: string }>(API_ROUTES.TERMS_ACCEPT, { channel: 'web' })
            if (response?.success && response.data) {
                setUser({ ...user, terms: response.data })
                toast.success('¡Gracias! Quedaron aceptados.')
            } else {
                toast.error(response?.message || 'No pudimos guardarlo. Inténtalo de nuevo.')
            }
        } catch {
            toast.error('No pudimos guardarlo. Inténtalo de nuevo.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-background/95 p-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="terms-gate-title">
            <div className="w-full max-w-md rounded-3xl border bg-card p-8 text-center shadow-card">
                <span className="mx-auto grid size-14 place-content-center rounded-2xl bg-[#6C47FF]/10 text-[#5B47E0] dark:bg-white/10 dark:text-[#A894FF] [&>svg]:size-7">
                    <FileTextIcon aria-hidden />
                </span>

                <h2 id="terms-gate-title" className="mt-4 text-xl font-extrabold tracking-tight">Nuestros términos y condiciones</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
                    Para seguir usando Eyplease+, lee y acepta nuestros términos. Ahí te explicamos, en palabras simples, cómo
                    funcionan tu plan, tus pagos y tus datos.
                </p>

                <div className="mt-5 flex flex-col gap-2 text-left">
                    <a
                        href={terms.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-[13.5px] font-bold transition-colors hover:bg-muted"
                    >
                        Leer los términos y condiciones
                        <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </a>
                    {terms.privacy_url && (
                        <a
                            href={terms.privacy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-3 rounded-2xl border border-border px-4 py-3 text-[13.5px] font-bold transition-colors hover:bg-muted"
                        >
                            Leer el aviso de privacidad
                            <ExternalLinkIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                        </a>
                    )}
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    <Button
                        block
                        loading={saving}
                        text="Acepto los términos y condiciones"
                        className="justify-center py-3 text-sm"
                        onClick={accept}
                    />
                    <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                        Al tocar «Acepto» quedan aceptados el día de hoy, junto con el aviso de privacidad.
                    </p>
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex cursor-pointer items-center justify-center gap-1.5 text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground [&>svg]:size-4"
                    >
                        <LogOutIcon aria-hidden />
                        Salir
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TermsGate
