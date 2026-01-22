import Button from "@/components/common/Button"

interface Props {
    icon: React.ReactNode
    text?: string
    className?: string
    onClick: () => void
}

const FabButton = ({ icon, text, className, onClick }: Props) => {
    return (
        <Button
            className="fixed gap-0 rounded-full bottom-14 right-6 group flex items-center justify-start cursor-pointer hover:w-44 overflow-hidden transition-all duration-200 shadow-lg active:translate-x-1 active:translate-y-1"
            color="primary"
            // size="icon"
            text={
                <>
                    <div
                        className="flex items-center justify-center transition-all duration-300 group-hover:justify-start"
                    >
                        {icon}
                    </div>
                    {text && (
                        <div
                            className="absolute font-normal right-6 transform translate-x-full opacity-0 text-white text-base transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        >
                            {text}
                        </div>
                    )}
                </>
            }
            onClick={onClick}
        />
    )
}

export default FabButton;