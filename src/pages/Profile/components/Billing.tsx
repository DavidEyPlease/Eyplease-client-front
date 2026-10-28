import { CreditCardIcon, ReceiptIcon } from 'lucide-react'

import AutomateCardOffer from '@/components/billing/AutomateCardOffer'
import BillingHistory from '@/components/billing/BillingHistory'
import PaymentMethodPanel from '@/components/billing/PaymentMethodPanel'
import SubscriptionCard from '@/components/billing/SubscriptionCard'
import StandardPlanCard from '@/components/billing/StandardPlanCard'
import useBilling from '@/components/billing/useBilling'
import ReferralCard from '@/components/referrals/ReferralCard'
import { useCardAutomationReturn } from '@/components/billing/useCardAutomation'
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import '@/pages/Hoy/hoy.css'
import SectionCard from './SectionCard'

/** Ficha de facturación: cómo paga el cliente y todo su historial de pagos. */
const Billing = () => {
    const { overview, loading } = useBilling()
    const newShell = isNewShell()
    /* Stripe la devuelve aquí tras domiciliar (o cancelar): se le confirma una vez */
    useCardAutomationReturn()

    return (
        <div className="flex flex-col gap-4">
            {/* Con el marco nuevo no hay tarjeta de cobro en el menú lateral: su resumen va aquí, en grande */}
            {newShell && <SubscriptionCard />}

            {/* Consultora con el Standard a su tarjeta: cuándo se cobra y cancelarlo o reanudarlo ella sola */}
            <StandardPlanCard />

            {/* Mientras le aplique (sin deudas, sin promoción, interruptor encendido), la invitación se queda aquí */}
            {overview?.card_automation?.available && <AutomateCardOffer automation={overview.card_automation} />}

            {/* «Invite a una Directora»: su liga y su premio, donde ve lo que paga */}
            <ReferralCard />

            <SectionCard
                icon={<CreditCardIcon aria-hidden />}
                title={newShell ? 'Cómo pagar' : 'Mi plan y forma de pago'}
                description={newShell ? 'Tu tarjeta, o las cuentas a donde transferir' : 'Cuánto pagas, cuándo se cobra y por dónde'}
            >
                <PaymentMethodPanel overview={overview} loading={loading} hideSummary={newShell} />
            </SectionCard>

            <SectionCard
                icon={<ReceiptIcon aria-hidden />}
                title="Historial de pagos"
                description="Tus periodos, su estado y sus comprobantes"
            >
                <BillingHistory years={overview?.payment_years} paymentMethod={overview?.payment_method} />
            </SectionCard>
        </div>
    )
}

export default Billing
