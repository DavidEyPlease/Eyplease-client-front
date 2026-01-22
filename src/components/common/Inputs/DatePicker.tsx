import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "@formkit/tempo"
import CalendarInput from "./CalendarInput"
import { Label } from "@/components/ui/label"

interface DateTimePickerProps {
    label?: string;
    dateValue?: Date;
    onDateChange: (date: Date) => void;
}

const DatePicker = ({ label, dateValue, onDateChange }: DateTimePickerProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <div>
                    {label && <Label className="mb-2">{label}</Label>}
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full max-w-[400px] pl-3 text-left font-normal dark:bg-input/30 py-5",
                            !dateValue && "text-muted-foreground"
                        )}
                        type="button"
                    >
                        {dateValue ? (
                            format(dateValue, { date: 'long' })
                        ) : (
                            <span>Selecciona una fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <CalendarInput
                    value={dateValue}
                    onChange={onDateChange}
                />
            </PopoverContent>
        </Popover>
    )
}

export default DatePicker