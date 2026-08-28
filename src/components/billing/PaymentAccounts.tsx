import { BuildingIcon, CopyIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { IPaymentAccount } from '@/interfaces/billing'
import { copyToClipboard } from '@/utils'

interface Props {
    accounts: IPaymentAccount[]
    instructions?: string | null
}

const NUMBER_TYPE_LABELS: Record<string, string> = {
    clabe: 'CLABE',
    tarjeta: 'Tarjeta',
}

/** Cuentas a las que el cliente puede transferir. El número se copia de un toque. */
const PaymentAccounts = ({ accounts, instructions }: Props) => {
    if (!accounts.length) {
        return (
            <p className="rounded-xl border border-dashed px-3.5 py-3 text-[12.5px] font-medium text-muted-foreground">
                Todavía no hay cuentas de cobro publicadas. Escríbenos y te indicamos cómo pagar.
            </p>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {accounts.map(account => (
                <div key={`${account.bank}-${account.number}`} className="flex items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5">
                    <span className="grid size-8 shrink-0 place-content-center rounded-lg bg-primary/[0.08] text-primary [&>svg]:size-4">
                        <BuildingIcon aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12.5px] font-bold tracking-tight">{account.number}</span>
                        <span className="block truncate text-[10.5px] font-semibold text-muted-foreground">
                            {[account.bank, NUMBER_TYPE_LABELS[account.numberType ?? ''], account.beneficiary]
                                .filter(Boolean)
                                .join(' · ')}
                        </span>
                    </span>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Copiar número"
                        className="shrink-0 cursor-pointer text-muted-foreground/60 hover:text-primary"
                        onClick={() => copyToClipboard(account.number)}
                    >
                        <CopyIcon />
                    </Button>
                </div>
            ))}

            {instructions && (
                <p className="text-[11.5px] font-medium text-muted-foreground">{instructions}</p>
            )}
        </div>
    )
}

export default PaymentAccounts
