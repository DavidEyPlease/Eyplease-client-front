import { useState } from "react"

import DynamicTabs from "@/components/generics/DynamicTabs"
import { PermissionKeys } from "@/interfaces/permissions"
import useAuthStore from "@/store/auth"
import ServiceRequests from "./ServiceRequests/main"
import Events from "./Events/main"
import PageHead from '@/layouts/TopShell/PageHead'

const CustomServicesPage = () => {
    const { permissions } = useAuthStore(state => state)
    // Las pestañas que trae su plan (el Ejecutivo tiene Eventos pero no Personalizados): abre en la primera que tenga.
    const tabs = [
        { value: PermissionKeys.SERVICES, label: "Personalizados" },
        { value: PermissionKeys.EVENTS, label: "Eventos" },
    ].filter(i => permissions.includes(i.value))
    const [picked, setPicked] = useState<PermissionKeys | null>(null)
    const tab = tabs.some(i => i.value === picked) ? picked : tabs[0]?.value

    return (
        <div className="space-y-4">
            <PageHead eyebrow="Contenido" title={<>Pedidos de <em>diseño</em> y eventos</>} sub="Lo que le encargas al equipo de Eyplease+ y cómo va cada entrega." />
            <DynamicTabs
                items={tabs}
                value={tab ?? ''}
                onValueChange={(value) => setPicked(value as PermissionKeys)}
            />

            {tab === PermissionKeys.SERVICES && (<ServiceRequests />)}
            {tab === PermissionKeys.EVENTS && (<Events />)}
        </div>
    )
}

export default CustomServicesPage