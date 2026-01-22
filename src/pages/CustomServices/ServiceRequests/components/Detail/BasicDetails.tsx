import FieldValue from "@/components/generics/FieldValue"
import { UserRequestService } from "@/interfaces/requestService"
import { PaletteIcon } from "lucide-react"

interface ModalDetailProps {
    item: UserRequestService
}

const ColorSwatch = ({ label, value }: { label: string; value: string }) => {
    return (
        <div className="flex items-center gap-2">
            <span
                aria-hidden
                className="h-4 w-4 rounded ring-1 ring-black/10"
                style={{ backgroundColor: value }}
                title={value}
            />
            <span className="text-xs text-muted-foreground">
                {label}: {value}
            </span>
        </div>
    )
}

const BasicDetails = ({ item }: ModalDetailProps) => {
    return (
        <div className="space-y-4">
            <FieldValue label="Descripción" flexDirection="col" className="items-start" value={item.description || ''} />
            {item.metadata && (
                (item.metadata.primaryColor || item.metadata.secondaryColor) && (
                    <FieldValue label="Colores" flexDirection="col" className="items-start">
                        <div className="flex items-center gap-4">
                            <PaletteIcon />
                            <ColorSwatch label="Primario" value={item.metadata.primaryColor || ''} />
                            <ColorSwatch label="Secundario" value={item.metadata.secondaryColor || ''} />
                        </div>
                    </FieldValue>
                )
            )}
        </div>
    )
}

export default BasicDetails