import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "@formkit/tempo"
import CalendarInput from "./CalendarInput"
import { Separator } from "@/components/ui/separator"
import TimeInput from "./TimeInput"

interface DateTimePickerProps {
    dateValue?: Date;
    onDateChange: (date: Date) => void;
    timeValue?: string;
    onTimeChange: (time: string) => void;
}

const DateTimePicker = ({ dateValue, onDateChange, timeValue, onTimeChange }: DateTimePickerProps) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full max-w-[400px] pl-3 text-left font-normal dark:bg-input/30 py-5",
                        !dateValue && "text-muted-foreground"
                    )}
                >
                    {dateValue ? (
                        format(dateValue, { date: 'long' })
                    ) : (
                        <span>Selecciona una fecha</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <CalendarInput
                    value={dateValue}
                    onChange={onDateChange}
                />
                <Separator className="my-2" />
                <div className="p-2">
                    <TimeInput
                        value={timeValue}
                        onChange={onTimeChange}
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default DateTimePicker