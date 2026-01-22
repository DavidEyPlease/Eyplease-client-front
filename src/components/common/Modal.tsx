import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    // DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Separator } from "../ui/separator"

const sizeClasses = {
    xs: 'sm:max-w-xs',
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-2xl',
    xxl: 'sm:max-w-4xl',
    '2xl': 'sm:max-w-5xl',
    full: 'sm:w-full max-w-none',
}

type ModalSize = keyof typeof sizeClasses;

interface Props {
    title?: string;
    description?: React.ReactNode;
    footer?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    open: boolean;
    size?: ModalSize;
    onOpenChange(open: boolean): void;
}

const Modal = ({ title, description, children, size = 'sm', className, footer, ...props }: Props) => {
    return (
        <Dialog {...props}>
            {/* <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger> */}
            <DialogContent className={cn(sizeClasses[size], className)} onOpenAutoFocus={(e) => e.preventDefault()}>
                <DialogHeader>
                    {title && <DialogTitle>{title}</DialogTitle>}
                    {description &&
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    }
                </DialogHeader>
                <Separator />
                {children}
                {footer &&
                    <DialogFooter>
                        {footer}
                    </DialogFooter>
                }
            </DialogContent>
        </Dialog>
    )
}

export default Modal