import { useState } from "react"

import PageTitle from "@/components/generics/PageTitle"
import DynamicTabs from "@/components/generics/DynamicTabs"
import { PermissionKeys } from "@/interfaces/permissions"
import useAuthStore from "@/store/auth"
import ServiceRequests from "./ServiceRequests/main"
import Events from "./Events/main"

const CustomServicesPage = () => {
    const [tab, setTab] = useState<PermissionKeys>(PermissionKeys.SERVICES)
    const { permissions } = useAuthStore(state => state)

    return (
        <div className="pt-2 space-y-4">
            <PageTitle>
                <h1 className="text-xl md:text-3xl font-semibold">
                    Servicios personalizados
                </h1>
                <p>Revisa el estado de tus solicitudes, pide correcciones o marca como finalizado.</p>
            </PageTitle>

            <DynamicTabs
                items={[
                    { value: PermissionKeys.SERVICES, label: "Personalizados" },
                    { value: PermissionKeys.EVENTS, label: "Eventos" },
                ].filter(i => permissions.includes(i.value))}
                value={PermissionKeys.SERVICES}
                onValueChange={(value) => setTab(value as PermissionKeys)}
            />

            {tab === PermissionKeys.SERVICES && (<ServiceRequests />)}
            {tab === PermissionKeys.EVENTS && (<Events />)}
        </div>
    )
}

export default CustomServicesPage