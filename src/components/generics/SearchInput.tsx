import useSearchInput from '@/hooks/useSearchInput'
import TextInput from '../common/Inputs/TextInput'
import { IconClear } from '../Svg/IconClear'
import { IconSearch } from '../Svg/IconSearch'

interface Props {
    placeholder?: string
    value?: string;
    onSubmitSearch: (_value: string) => void
}

const SearchInput = ({ value, placeholder, onSubmitSearch }: Props) => {
    const { text, onSubmit, onChange, onClearSearch } = useSearchInput({
        value: value || '',
        onValueChange: onSubmitSearch,
    })

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSubmit(e)
        }
    }

    return (
        <div className="relative">
            <TextInput
                label=''
                value={text}
                placeholder={placeholder}
                className='px-8 border border-b rounded-3xl border-input'
                startContent={<IconSearch />}
                onChange={onChange}
                onKeyDown={onKeyDown}
            />
            {text && <button className='absolute text-primary dark:text-white cursor-pointer top-[6px] right-[10px]' onClick={onClearSearch}><IconClear /></button>}
        </div>
    )
}

export default SearchInput