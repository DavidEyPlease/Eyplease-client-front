import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { InfoIcon } from "lucide-react"

interface InfoTooltipProps {
    children: React.ReactNode
}

const InfoTooltip = ({ children }: InfoTooltipProps) => {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <InfoIcon className="text-warning" />
            </TooltipTrigger>
            <TooltipContent className="text-white">
                {children}
            </TooltipContent>
        </Tooltip>
    )
}

export default InfoTooltip