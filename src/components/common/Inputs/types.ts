// import { AutocompleteItem } from "@/types/common"
import { AutocompleteOption } from "@/interfaces/common"
import { UseFormRegisterReturn } from "react-hook-form"

type BaseInputProps = {
    label: string
    variant?: "bordered" | "flat" | "faded" | "underlined"
    error?: string
    placeholder?: string
    isRequired?: boolean
    disabled?: boolean
    readonly?: boolean
    className?: string
    labelClassName?: string
}

export interface TextInputProps extends BaseInputProps {
    type?: string
    value?: string
    pattern?: string
    startContent?: React.ReactNode
    register?: UseFormRegisterReturn<string>
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

// export interface SelectProps extends BaseInputProps {
//     items: Iterable<AutocompleteItem>
//     register?: UseFormRegisterReturn<string>
// }
export interface AutocompleteProps {
    label?: string
    placeholder?: string
    searchPlaceholder?: string
    emptyText?: string
    multiple?: boolean
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
    onSearch?: (query: string) => Promise<AutocompleteOption[]>
    options?: AutocompleteOption[]
    loading?: boolean
    disabled?: boolean
    className?: string
}

export interface DatePickerProps extends BaseInputProps {
    value?: Date
    onChange: (date: Date) => void
}

export interface NumericInputProps extends BaseInputProps {
    value?: number | string
    decimalScale?: number
    prefix?: string
    suffix?: string
    register?: UseFormRegisterReturn<string>
    dataType?: 'number' | 'string'
    onChange: (number: number | string) => void
}

export type SwitchInputProps = {
    id: string;
    label?: string;
    checked?: boolean;
    disabled?: boolean;
    badge?: boolean;
    loading?: boolean
    onCheckedChange?: (checked: boolean) => void;
}