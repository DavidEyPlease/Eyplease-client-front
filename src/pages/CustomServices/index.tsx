import { useState } from "react"

import DynamicTabs from "@/components/generics/DynamicTabs"
import { PermissionKeys } from "@/interfaces/permissions"
import useAuthStore from "@/store/auth"
import ServiceRequests from "./ServiceRequests/main"
import Events from "./Events/main"
import PageHead from '@/layouts/TopShell/PageHead'

const CustomServicesPage = () => {
    const [tab, setTab] = useState<PermissionKeys>(PermissionKeys.SERVICES)
    const { permissions } = useAuthStore(state => state)

    return (
        <div className="space-y-4">
            <PageHead eyebrow="Contenido" title={<>Pedidos de <em>diseño</em> y eventos</>} sub="Lo que le encargas al equipo de Eyplease+ y cómo va cada entrega." />
            <DynamicTabs
                items={[
                    { value: PermissionKeys.SERVICES, label: "Personalizados" },
                    { value: PermissionKeys.EVENTS, label: "Eventos" },
                ].filter(i => permissions.includes(i.value))}
                value={tab}
                onValueChange={(value) => setTab(value as PermissionKeys)}
            />

            {tab === PermissionKeys.SERVICES && (<ServiceRequests />)}
            {tab === PermissionKeys.EVENTS && (<Events />)}
        </div>
    )
}

export default CustomServicesPage