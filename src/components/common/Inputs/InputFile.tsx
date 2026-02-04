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
            <span className="text-sm flex-1 mb-2 font-medium px-3 py-2 border border-primary rounded-lg text-indigo-600 hover:text-indigo-500">
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
