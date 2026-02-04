import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"

interface DynamicTabsProps {
    label?: string
    items: { value: string; label: string, disabled?: boolean, icon?: React.ReactNode }[];
    value?: string;
    onValueChange?: (value: string) => void;
}

const DynamicTabs = ({ label, items, value, onValueChange }: DynamicTabsProps) => {
    return (
        <>
            {label && <p className="text-sm font-medium mb-2">{label}</p>}
            <Tabs defaultValue={value} onValueChange={(e) => onValueChange?.(e)}>
                <TabsList>
                    {items.map(item => (
                        <TabsTrigger key={item.value} value={item.value} disabled={item.disabled}>
                            {item.icon}
                            {item.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </>
    )
}

export default DynamicTabs
