import { AlertTriangleIcon, UploadCloudIcon } from 'lucide-react'
import { Link } from 'react-router'

import Button from '@/components/common/Button'
import { formatCurrency } from '@/utils'
import { periodLabel, periodsLabel } from '../utils'
import { useBillingEnforcement } from './context'
import { daysLabel, PROFILE_BILLING_PATH } from './utils'

/**
 * Aviso de pago atrasado en el home, los primeros días. Después lo releva la
 * barra global, que ya se ve desde cualquier pantalla.
 */
const HomeOverdueBanner = () => {
    const { enforcement, payment, debt, openUploadReceipt } = useBillingEnforcement()

    if (!payment || !enforcement.show_home_banner) return null

    const multiple = (debt?.periods.length ?? 0) > 1
    const owedTotal = multiple ? debt!.total : payment.remaining
    const owedLabel = multiple ? periodsLabel(debt!.periods.map(item => item.period)) : periodLabel(payment.period)

    return (
        <section className="flex flex-wrap items-center gap-4 rounded-3xl border border-red-200 bg-card p-5 shadow-card dark:border-red-500/30">
            <span className="grid size-11 shrink-0 place-content-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 [&>svg]:size-5">
                <AlertTriangleIcon aria-hidden />
            </span>

            <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-extrabold tracking-tight">Tienes un pago atrasado</h3>
                <p className="text-[12.5px] font-semibold text-muted-foreground">
                    {formatCurrency(owedTotal, payment.currency)} de {owedLabel} · {daysLabel(enforcement.days_overdue)} de atraso
                </p>
            </div>

            <div className="flex items-center gap-3">
                <Link to={PROFILE_BILLING_PATH} className="text-[12.5px] font-semibold text-muted-foreground transition-colors hover:text-foreground">
                    Ver mi facturación
                </Link>
                {payment.can_upload_receipt && (
                    <Button
                        text={<span className="flex items-center gap-1.5"><UploadCloudIcon className="size-4" aria-hidden />Subir comprobante</span>}
                        className="py-2.5 text-sm"
                        onClick={openUploadReceipt}
                    />
                )}
            </div>
        </section>
    )
}

export default HomeOverdueBanner
