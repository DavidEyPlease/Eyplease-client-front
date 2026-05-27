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

    const borderColor = error
        ? "border-red-400 focus-within:border-red-500"
        : "border-eyp-gray-warm focus-within:border-eyp-violet hover:border-eyp-violet/40"

    return (
        <div>
            <div className={cn(
                "flex items-stretch gap-1 h-14 bg-white border-2 rounded-2xl transition-colors overflow-hidden",
                borderColor
            )}>
                <Select value={selected.code} onValueChange={handleCountry} disabled={disabled}>
                    <SelectTrigger
                        aria-label="Código de país"
                        className="w-[130px] h-full border-0 rounded-none px-4 focus:ring-0 focus:ring-offset-0 bg-eyp-gray-warm/60 text-eyp-ink"
                    >
                        <SelectValue>
                            <span className="inline-flex items-center gap-2 text-sm">
                                <span className="text-lg leading-none">{selected.flag}</span>
                                <span className="font-semibold">{selected.dial}</span>
                            </span>
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                        {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                                <span className="inline-flex items-center gap-2">
                                    <span className="text-base leading-none">{country.flag}</span>
                                    <span>{country.name}</span>
                                    <span className="text-eyp-gray-mid">{country.dial}</span>
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
                    className="flex-1 px-4 text-base bg-white outline-none placeholder:text-eyp-gray-mid text-eyp-ink"
                />
            </div>
            {error && <ErrorText error={error} />}
        </div>
    )
}

export default WizardPhoneInput
