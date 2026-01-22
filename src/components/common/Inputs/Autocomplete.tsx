import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { AutocompleteProps } from "./types"
import { AutocompleteOption } from "@/interfaces/common"

export function Autocomplete({
    placeholder = "Seleccionar...",
    searchPlaceholder = "Buscar...",
    emptyText = "No se encontraron resultados",
    multiple = false,
    value,
    onValueChange,
    onSearch,
    options = [],
    loading = false,
    disabled = false,
    className,
    label,
}: AutocompleteProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [searchResults, setSearchResults] = React.useState<AutocompleteOption[]>([])
    const [isSearching, setIsSearching] = React.useState(false)

    // Debounce search
    React.useEffect(() => {
        if (!onSearch || !searchQuery.trim()) {
            setSearchResults([])
            return
        }

        const timeoutId = setTimeout(async () => {
            setIsSearching(true)
            try {
                const results = await onSearch(searchQuery)
                setSearchResults(results)
            } catch (error) {
                console.error("Error searching:", error)
                setSearchResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(timeoutId)
    }, [searchQuery, onSearch])

    const displayOptions = searchQuery ? searchResults : options

    const selectedValues = React.useMemo(() => {
        if (multiple) {
            return Array.isArray(value) ? value : []
        }
        return typeof value === "string" ? [value] : []
    }, [value, multiple])

    const selectedOptions = React.useMemo(() => {
        return displayOptions.filter((option) => selectedValues.includes(option.value))
    }, [displayOptions, selectedValues])

    const handleSelect = (selectedValue: string) => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : []
            const newValues = currentValues.includes(selectedValue)
                ? currentValues.filter((v) => v !== selectedValue)
                : [...currentValues, selectedValue]
            onValueChange?.(newValues)
        } else {
            onValueChange?.(selectedValue === value ? "" : selectedValue)
            setOpen(false)
        }
    }

    const handleRemove = (valueToRemove: string) => {
        if (multiple && Array.isArray(value)) {
            const newValues = value.filter((v) => v !== valueToRemove)
            onValueChange?.(newValues)
        }
    }

    const getDisplayText = () => {
        if (selectedOptions.length === 0) {
            return placeholder
        }

        if (multiple) {
            return `${selectedOptions.length} seleccionado${selectedOptions.length > 1 ? "s" : ""}`
        }

        return selectedOptions[0]?.label || placeholder
    }

    return (
        <div className={cn("relative space-y-2 w-full", className)}>
            {label && <Label>{label}</Label>}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-transparent"
                        disabled={disabled}
                    >
                        <span className="truncate">{getDisplayText()}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput placeholder={searchPlaceholder} value={searchQuery} onValueChange={setSearchQuery} />
                        <CommandList>
                            <CommandEmpty>{isSearching || loading ? "Buscando..." : emptyText}</CommandEmpty>
                            {displayOptions.length > 0 && (
                                <CommandGroup>
                                    {displayOptions.map((option) => (
                                        <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedValues.includes(option.value) ? "opacity-100" : "opacity-0",
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected items display for multiple selection */}
            {multiple && selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                    {selectedOptions.map((option) => (
                        <Badge key={option.value} variant="secondary" className="text-xs">
                            {option.label}
                            <button
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleRemove(option.value)
                                    }
                                }}
                                onMouseDown={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                }}
                                onClick={() => handleRemove(option.value)}
                            >
                                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    )
}
