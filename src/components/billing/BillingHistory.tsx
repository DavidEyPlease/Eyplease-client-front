import { useMemo, useState } from 'react'
import { DownloadIcon, ReceiptIcon, UploadCloudIcon } from 'lucide-react'

import { EmptySection } from '@/components/generics/EmptySection'
import FilterChip from '@/components/generics/FilterChip'
import LoadMorePaginator from '@/components/generics/LoadMorePaginator'
import { Skeleton } from '@/components/ui/skeleton'
import useInfiniteListQuery from '@/hooks/useInfiniteListQuery'
import { API_ROUTES } from '@/constants/api'
import { IBillingPayment, IBillingPaymentMethod } from '@/interfaces/billing'
import { formatCurrency } from '@/utils'
import { formatDate } from '@/utils/dates'
import PaymentStatusBadge from './PaymentStatusBadge'
import UploadReceiptDialog from './UploadReceiptDialog'
import { billingPaymentsKey, PAYMENT_METHOD_LABELS, periodLabel } from './utils'

const PAYMENTS_PER_PAGE = 12
const ALL_YEARS = 'all'

interface IBillingPaymentFilters {
    perPage: number
    year?: number
}

interface Props {
    /** Años con movimientos. Sin al menos dos, el filtro no aporta nada y no se pinta. */
    years?: number[]
    /** Se pasa al diálogo para que el cliente vea a dónde transferir. */
    paymentMethod?: IBillingPaymentMethod
}

/** Historial de periodos: qué se pagó, cuándo y con qué comprobante. */
const BillingHistory = ({ years = [], paymentMethod }: Props) => {
    const [year, setYear] = useState<number | typeof ALL_YEARS>(ALL_YEARS)
    const [uploadTarget, setUploadTarget] = useState<IBillingPayment | null>(null)

    /* Van como filtros porque el hook los aplana en la query string tal cual */
    const filters = useMemo<IBillingPaymentFilters>(
        () => ({ perPage: PAYMENTS_PER_PAGE, ...(year === ALL_YEARS ? {} : { year }) }),
        [year],
    )

    const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } = useInfiniteListQuery<IBillingPayment, IBillingPaymentFilters>(
        API_ROUTES.BILLING.PAYMENTS,
        {
            queryParams: { filters },
            customQueryKey: [...billingPaymentsKey, filters],
        },
    )

    const payments = data?.pages.flatMap(page => page.items) ?? []

    return (
        <div className="flex flex-col gap-4">
            {years.length > 1 && (
                <div className="flex flex-wrap gap-2">
                    <FilterChip label="Todo" active={year === ALL_YEARS} onClick={() => setYear(ALL_YEARS)} />
                    {years.map(option => (
                        <FilterChip
                            key={option}
                            label={String(option)}
                            active={year === option}
                            onClick={() => setYear(option)}
                        />
                    ))}
                </div>
            )}

            {isLoading ? (
                <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-16 rounded-2xl" />)}
                </div>
            ) : !payments.length ? (
                <EmptySection
                    media={<ReceiptIcon aria-hidden />}
                    title="Sin movimientos"
                    description={year === ALL_YEARS
                        ? 'Todavía no hay pagos registrados en tu cuenta.'
                        : `No hay pagos registrados en ${year}.`}
                />
            ) : (
                <ul className="flex flex-col gap-2">
                    {payments.map(payment => (
                        <li key={payment.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border bg-card px-4 py-3">
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-extrabold tracking-tight">{periodLabel(payment.period)}</p>
                                <p className="truncate text-[11.5px] font-semibold text-muted-foreground">
                                    {[
                                        payment.paid_at && `Pagado el ${formatDate(payment.paid_at, { formatter: { date: 'medium' } })}`,
                                        payment.method && PAYMENT_METHOD_LABELS[payment.method],
                                        payment.reference_number && `Ref. ${payment.reference_number}`,
                                    ].filter(Boolean).join(' · ') || 'Sin registrar'}
                                </p>
                            </div>

                            <div className="text-right">
                                <p className="text-[13px] font-extrabold tracking-tight">
                                    {formatCurrency(payment.amount, payment.currency)}
                                </p>
                                {payment.remaining > 0 && (
                                    <p className="text-[11px] font-semibold text-muted-foreground">
                                        Falta {formatCurrency(payment.remaining, payment.currency)}
                                    </p>
                                )}
                            </div>

                            <PaymentStatusBadge status={payment.status} />

                            <div className="flex items-center gap-1">
                                {payment.receipt_url && (
                                    <a
                                        href={payment.receipt_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Ver comprobante"
                                        className="grid size-8 place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-soft hover:text-primary [&>svg]:size-4"
                                    >
                                        <DownloadIcon aria-hidden />
                                    </a>
                                )}
                                {payment.can_upload_receipt && (
                                    <button
                                        type="button"
                                        title={payment.has_receipt ? 'Reemplazar comprobante' : 'Subir comprobante'}
                                        onClick={() => setUploadTarget(payment)}
                                        className="grid size-8 cursor-pointer place-content-center rounded-lg text-muted-foreground transition-colors hover:bg-surface-soft hover:text-primary [&>svg]:size-4"
                                    >
                                        <UploadCloudIcon aria-hidden />
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {hasNextPage && (
                <LoadMorePaginator loading={isFetchingNextPage} onLoadMore={fetchNextPage} />
            )}

            {uploadTarget && (
                <UploadReceiptDialog
                    open
                    periods={[uploadTarget.period]}
                    amount={uploadTarget.remaining}
                    currency={uploadTarget.currency}
                    paymentMethod={paymentMethod}
                    onOpenChange={open => !open && setUploadTarget(null)}
                />
            )}
        </div>
    )
}

export default BillingHistory
