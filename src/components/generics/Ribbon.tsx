interface RibbonProps {
    text: string
}

const Ribbon = ({ text }: RibbonProps) => {
    return (
        <div className="absolute left-0 top-0 h-14 w-14 z-50">
            <div
                className="bg-secondary absolute transform -rotate-45 text-center text-white text-sm font-semibold left-[-60px] top-[15px] w-[170px]">
                {text}
            </div>
        </div>
    )
}

export default Ribbon