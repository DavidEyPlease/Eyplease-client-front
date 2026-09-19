import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router'

import GlobalPaymentBanner from '@/components/billing/enforcement/GlobalPaymentBanner'
import AssistantDock from './AssistantDock'
import TopBar from './TopBar'
import './shell.css'

const DOCK_KEY = 'eyplease:assistant-dock'

const readDock = () => {
    try {
        return localStorage.getItem(DOCK_KEY) !== 'closed'
    } catch {
        return true
    }
}

/**
 * Marco nuevo del área autenticada: barra de vidrio con desplegables arriba, la página en el
 * centro y el Asistente acoplado a la derecha.
 *
 * Sustituye SÓLO al marco (`AppSidebar` + `MainContainer`). Las páginas no se enteran: siguen
 * entrando por el mismo `<Outlet />`, así que todo lo que hoy funciona sigue funcionando
 * dentro de la piel nueva, y el aviso global de cobranza conserva su sitio sobre el contenido.
 */
const TopShell = () => {
    const location = useLocation()
    const [dockOpen, setDockOpen] = useState(readDock)

    useEffect(() => {
        try {
            localStorage.setItem(DOCK_KEY, dockOpen ? 'open' : 'closed')
        } catch {
            /* Sin almacenamiento el panel no recuerda su estado; nada más */
        }
    }, [dockOpen])

    return (
        <div className="relative min-h-screen w-full bg-[#F3F2FA] dark:bg-[#0B0A1A]">
            <div className="shell-backdrop"><i className="shell-blob a" /><i className="shell-blob b" /><i className="shell-blob c" /></div>

            <div className="relative z-[1]">
                <TopBar assistantOpen={dockOpen} onToggleAssistant={() => setDockOpen(open => !open)} />

                <div className="mx-auto mt-[18px] mb-16 flex w-[min(1500px,calc(100%-28px))] items-start gap-[18px]">
                    <main className="min-w-0 flex-1">
                        <GlobalPaymentBanner />
                        <div key={location.pathname} className="shell-page flex flex-col gap-4">
                            <Outlet />
                        </div>
                    </main>

                    <AssistantDock open={dockOpen} onOpenChange={setDockOpen} />
                </div>
            </div>
        </div>
    )
}

export default TopShell
