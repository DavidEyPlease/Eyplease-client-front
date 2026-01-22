import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface DropdownProps {
    value?: string;
    placeholder: string;
    label?: string;
    items: Array<{ label: string; value: string, color?: string }>;
    disabled?: boolean;
    onChange?: (value: string) => void;
}

const Dropdown = ({ placeholder, label, items, disabled, value, onChange }: DropdownProps) => {
    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}
            <Select value={value} onValueChange={onChange} disabled={disabled}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.color && <div className={`size-3 rounded-full ${item.color}`} />}
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>

    )
}

export default Dropdown;