import { useState } from "react"
import { XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

interface AlphabetFilterProps {
    onFilter: (letter: string) => void;
}

const AlphabetFilter = ({ onFilter }: AlphabetFilterProps) => {
    const [selectedLetter, setSelectedLetter] = useState<string>("")

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter)
        onFilter(letter)
    }

    const handleReset = () => {
        setSelectedLetter("")
        onFilter("")
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            {ALPHABET.map((letter) => (
                <Button
                    key={letter}
                    variant="ghost"
                    onClick={() => handleLetterClick(letter)}
                    className={cn(
                        // Borde transparente permanente: si solo existiera en hover, el botón cambiaría de tamaño y saltaría
                        'size-8 cursor-pointer rounded-[10px] border border-transparent text-xs font-bold text-muted-foreground hover:border-border hover:bg-surface-soft hover:text-foreground',
                        selectedLetter === letter && 'bg-primary-gradient text-white shadow-primary-glow hover:border-transparent hover:bg-primary-gradient hover:text-white'
                    )}
                >
                    {letter}
                </Button>
            ))}
            <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="cursor-pointer rounded-[10px] text-xs font-bold text-primary hover:bg-primary/5 hover:text-primary"
            >
                <XIcon className="size-3" />
                Restablecer
            </Button>
        </div>
    )
}

export default AlphabetFilter
