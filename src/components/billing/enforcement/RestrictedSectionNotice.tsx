import { LockIcon } from 'lucide-react'

import Button from '@/components/common/Button'
import { EmptySection } from '@/components/generics/EmptySection'
import { BillingRestrictedFeature } from '@/interfaces/billing'
import { useBillingEnforcement } from './context'
import { RESTRICTED_FEATURE_LABELS } from './utils'

interface Props {
    feature: BillingRestrictedFeature
}

/**
 * Lo que ocupa el sitio de una sección cerrada cuando se llega a ella sin pasar
 * por una puerta (era la sección por defecto, o venía de un enlace). Explica y
 * ofrece el aviso; no lo abre solo, que aterrizar no es pedir.
 */
const RestrictedSectionNotice = ({ feature }: Props) => {
    const { openPaymentDialog } = useBillingEnforcement()

    return (
        <EmptySection
            media={<LockIcon aria-hidden />}
            title="Sección bloqueada por falta de pago"
            description={`Ponte al día con tu pago para volver a ver ${RESTRICTED_FEATURE_LABELS[feature]}.`}
        >
            <Button text="Ver pago pendiente" className="py-2.5 text-sm" onClick={() => openPaymentDialog(feature)} />
        </EmptySection>
    )
}

export default RestrictedSectionNotice
