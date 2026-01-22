import { Link as UILink } from 'react-router'

interface Props {
    to: string
    text: string
    className?: string
}

const Link = ({ text, to }: Props) => {
    return (
        <UILink to={to} className={'text-primary text-sm underline font-semibold'}>{text}</UILink>
    )
}

export default Link;