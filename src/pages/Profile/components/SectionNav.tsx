import { ChevronRightIcon, CreditCardIcon, FileTextIcon, UserRoundIcon } from 'lucide-react'

import { IconHelpCenter } from '@/components/Svg/IconHelpCenter'
import { IconLock } from '@/components/Svg/IconLock'
import { IconPreferences } from '@/components/Svg/IconPreferences'
import useBillingAccess from '@/components/billing/useBillingAccess'
import { cn } from '@/lib/utils'
import { ProfileSectionKey } from '../utils'

const SECTIONS: { key: ProfileSectionKey, label: string, icon: React.ReactNode }[] = [
    { key: 'personal', label: 'Datos personales', icon: <UserRoundIcon /> },
    { key: 'reports', label: 'Mis boletines', icon: <FileTextIcon /> },
    { key: 'billing', label: 'Facturación', icon: <CreditCardIcon /> },
    { key: 'preferences', label: 'Preferencias', icon: <IconPreferences /> },
    { key: 'security', label: 'Seguridad', icon: <IconLock /> },
    { key: 'help', label: 'Centro de ayuda', icon: <IconHelpCenter /> },
]

interface Props {
    active: ProfileSectionKey
    onChange: (section: ProfileSectionKey) => void
}

/** Menú vertical de secciones del perfil. */
const SectionNav = ({ active, onChange }: Props) => {
    const { canSeeBilling } = useBillingAccess()
    /* La facturación no aplica a todas las cuentas: a las excluidas ni se les ofrece */
    const sections = SECTIONS.filter(section => section.key !== 'billing' || canSeeBilling)

    return (
        <nav className="flex flex-col gap-1 rounded-3xl border bg-card p-2 shadow-card">
            {sections.map(section => {
                const isActive = section.key === active

                return (
                    <button
                        key={section.key}
                        type="button"
                        aria-current={isActive}
                        onClick={() => onChange(section.key)}
                        className={cn(
                            'flex w-full cursor-pointer items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] font-bold transition-all [&_svg]:size-4 [&_svg]:shrink-0',
                            isActive
                                ? 'bg-primary-gradient text-white shadow-primary-glow'
                                : 'text-muted-foreground hover:bg-surface-soft hover:text-foreground',
                        )}
                    >
                        {section.icon}
                        {section.label}
                        <ChevronRightIcon className={cn('ml-auto opacity-50', !isActive && 'opacity-30')} aria-hidden />
                    </button>
                )
            })}
        </nav>
    )
}

export default SectionNav
