import { PlusIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface InputFileProps {
    id: string
    label?: string
    multiple?: boolean
    accept?: string
    disabled?: boolean
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function InputFile({ id, accept = '*', multiple, disabled, label = 'Seleccionar archivo', onChange }: InputFileProps) {
    return (
        <Label htmlFor={id} className="cursor-pointer">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-primary/40 bg-card px-3.5 py-2 text-[12.5px] font-bold text-primary transition-colors hover:bg-primary/5">
                <PlusIcon className="size-3.5" aria-hidden />
                {label}
            </span>
            <Input
                id={id}
                disabled={disabled}
                type="file"
                multiple={multiple}
                className="hidden"
                accept={accept}
                onChange={onChange}
            />
        </Label>
    )
}
