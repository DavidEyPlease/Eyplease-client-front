import { Button } from "@/components/ui/button"
import { useState } from "react"

interface AlphabetFilterProps {
    onFilter: (letter: string) => void;
}

const AlphabetFilter = ({ onFilter }: AlphabetFilterProps) => {
    const [selectedLetter, setSelectedLetter] = useState<string>("")

    // Generate the alphabet (A-Z)
    const alphabet = Array.from({ length: 26 }, (_, i) =>
        String.fromCharCode(65 + i)
    )

    const handleLetterClick = (letter: string) => {
        setSelectedLetter(letter)
        onFilter(letter)
    }

    const handleReset = () => {
        setSelectedLetter("")
        onFilter("")
    }

    return (
        <div className="flex flex-wrap gap-2">
            {alphabet.map((letter) => (
                <Button
                    key={letter}
                    variant={selectedLetter === letter ? "default" : "outline"}
                    onClick={() => handleLetterClick(letter)}
                    className="flex items-center justify-center w-5 h-8 text-xs cursor-pointer"
                >
                    {letter}
                </Button>
            ))}
            <Button variant="link" className="text-xs" size='sm' onClick={handleReset}>
                Restablecer
            </Button>
        </div>
    )
}

export default AlphabetFilter