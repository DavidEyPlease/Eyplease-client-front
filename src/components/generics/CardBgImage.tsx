import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"


interface Props {
    srcImage: string;
    classImageHeight: string;
    children?: React.ReactNode;
    className?: string;
    objectPosition?: 'object-contain' | 'object-cover' | 'object-fill' | 'object-none' | 'object-scale-down';
}

const CardBgImage = ({ className, children, srcImage, classImageHeight, objectPosition = 'object-contain' }: Props) => {
    return (
        <Card className={cn('p-0', className)}>
            {children}
            <img src={srcImage} alt="" className={`${objectPosition} w-full rounded-sm ${classImageHeight}`} />
        </Card>
    )
}

export default CardBgImage