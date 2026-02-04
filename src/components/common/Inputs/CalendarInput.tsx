import { Calendar } from "@/components/ui/calendar"

interface CalendarInputProps {
    value?: Date;
    onDisableDate?: (date: Date) => boolean;
    onChange: (date: Date) => void;
}

const CalendarInput = ({ value, onChange, onDisableDate }: CalendarInputProps) => {
    return (
        <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            disabled={(date) =>
                onDisableDate ? onDisableDate(date) : date > new Date() || date < new Date("1900-01-01")
            }
            required
            captionLayout="dropdown"
        />
    )
}

export default CalendarInput