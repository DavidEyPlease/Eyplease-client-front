import { useEffect, useCallback, useState } from 'react'
import useBooleanHandlers from './useBooleanHandlers'

interface UseSearchFieldProps {
    value: string;
    onValueChange?: (_value: string) => void;
    freeSolo?: boolean;
}

export default function useSearchInput({ value, onValueChange }: UseSearchFieldProps) {
    const [text, setText] = useState(value || '')
    const [focused, onFocus, onBlur] = useBooleanHandlers()
    const changed = text !== value
    const isEmpty = text.length === 0
    const isFocused = focused || (!!text && changed)

    useEffect(() => setText(value), [value])

    const onSubmit = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            e.preventDefault()
            //if (!freeSolo && !changed) return;
            if (onValueChange) {
                onValueChange(text)
            }
        },
        [text, onValueChange],
    )

    const onClearSearch = useCallback(() => {
        setText('')
        if (onValueChange) {
            onValueChange('')
        }
    }, [onValueChange])

    const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setText(newValue)

        if (newValue === '' && onValueChange) {
            onValueChange('')
        }
    }, [onValueChange])

    return { text, isEmpty, changed, isFocused, setText, onFocus, onBlur, onSubmit, onClearSearch, onChange }
}
