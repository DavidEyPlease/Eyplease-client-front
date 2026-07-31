import { Link as UILink } from 'react-router'

import { cn } from '@/lib/utils'

interface Props {
    to: string
    text: string
    className?: string
}

const Link = ({ text, to, className }: Props) => {
    return (
        <UILink to={to} className={cn('text-sm font-semibold text-primary underline', className)}>{text}</UILink>
    )
}

export default Link