import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { COUNTRIES } from "@/constants/countries"
import { cn } from "@/lib/utils"
import ErrorText from "./ErrorText"

export interface PhoneValue {
    countryCode: string
    number: string
}

interface Props {
    label?: string
    error?: string
    value: PhoneValue
    onChange: (next: PhoneValue) => void
    disabled?: boolean
}

const WizardPhoneInput = ({ value, onChange, error, disabled }: Props) => {
    const selected = COUNTRIES.find(c => c.code === value.countryCode) ?? COUNTRIES[0]

    const handleCountry = (countryCode: string) => {
        onChange({ ...value, countryCode })
    }

    const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
        const onlyDigits = e.target.value.replace(/[^0-9]/g, "")
        onChange({ ...value, number: onlyDigits })
    }

    return (
        <div>
            {/* Lada y número en una sola píldora, con el mismo trato que `ui/input` */}
            <div className={cn(
                "flex h-12 items-stretch overflow-hidden rounded-brand border bg-surface-soft transition-[box-shadow,background-color,border-color] dark:bg-input/30",
                "focus-within:border-primary-light focus-within:bg-card focus-within:ring-4 focus-within:ring-primary/15",
                error ? "border-destructive ring-destructive/20" : "border-input"
            )}>
                <Select value={selected.code} onValueChange={handleCountry} disabled={disabled}>
                    <SelectTrigger
                        aria-label="Código de país"
                        className="h-full w-[112px] shrink-0 rounded-none border-0 border-r border-input bg-transparent px-3.5 shadow-none focus-visible:ring-0 data-[size=default]:h-full dark:bg-transparent dark:hover:bg-white/5"
                    >
                        <SelectValue>
                            <span className="inline-flex items-center gap-2 text-[14px]">
                                <span className="text-lg leading-none">{selected.flag}</span>
                                <span className="font-bold">{selected.dial}</span>
                            </span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                        {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                                <span className="inline-flex items-center gap-2">
                                    <span className="text-base leading-none">{country.flag}</span>
                                    <span>{country.name}</span>
                                    <span className="text-muted-foreground">{country.dial}</span>
                                </span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    placeholder="Número de WhatsApp"
                    aria-invalid={error ? "true" : "false"}
                    value={value.number}
                    onChange={handleNumber}
                    disabled={disabled}
                    className="min-w-0 flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:text-muted-foreground"
                />
            </div>
            {error && <ErrorText error={error} />}
        </div>
    )
}

export default WizardPhoneInput
