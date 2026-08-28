import { CreditCardIcon, ReceiptIcon } from 'lucide-react'

import BillingHistory from '@/components/billing/BillingHistory'
import PaymentMethodPanel from '@/components/billing/PaymentMethodPanel'
import useBilling from '@/components/billing/useBilling'
import SectionCard from './SectionCard'

/** Ficha de facturación: cómo paga el cliente y todo su historial de pagos. */
const Billing = () => {
    const { overview, loading } = useBilling()

    return (
        <div className="flex flex-col gap-4">
            <SectionCard
                icon={<CreditCardIcon aria-hidden />}
                title="Mi plan y forma de pago"
                description="Cuánto pagas, cuándo se cobra y por dónde"
            >
                <PaymentMethodPanel overview={overview} loading={loading} />
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
