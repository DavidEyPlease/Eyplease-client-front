import { cn } from "@/lib/utils"

export type StoreVariant = "ios" | "android"

interface Props {
    variant: StoreVariant
    href: string
    className?: string
}

const AppleLogo = () => (
    <svg
        viewBox="0 0 384 512"
        className="w-7 h-7 shrink-0"
        fill="currentColor"
        aria-hidden="true"
    >
        <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7-39.2.6-79.5 23.5-100 60.4-43 74-11 183.4 30.7 243.7 20.4 29.6 44.5 62.7 76 61.5 30.4-1.2 41.9-19.9 78.9-19.9 36.7 0 47.4 19.9 79.4 19.2 32.7-.5 53.4-29.8 73.5-59.5 12.7-19.6 22.7-41.4 30.3-65.1-79.5-30.2-79.2-89.4-79.2-90.9zM256 84.5c14.8-17.9 25.6-43.6 22.6-69-22.4 1-49.6 14.9-65.1 33.7-13.9 16.6-26.1 42.5-22.8 67.5 24.7 1.9 50.2-12.6 65.3-32.2z" />
    </svg>
)

const PlayLogo = () => (
    <svg viewBox="0 0 256 290" className="w-7 h-7 shrink-0" aria-hidden="true">
        <path
            d="M126.9 134.4 6.1 256.6 6 256.7c.4 4.8 4.5 8.6 9.4 8.6 1.9 0 3.7-.5 5.3-1.4l136-77.8-29.8-51.7z"
            fill="#EA4335"
        />
        <path
            d="M249 113.8 190.2 80l-32.5 28.6 32.7 32.7 58.7-33.7c3.4-2 5.7-5.6 5.7-9.7-.1-4.2-2.4-7.8-5.8-10.1z"
            fill="#FBBC04"
        />
        <path
            d="M6.1 33.4c-.2 1-.4 2-.4 3v219.2c0 1 .2 2 .4 3l125-124.6L6.1 33.4z"
            fill="#4285F4"
        />
        <path
            d="m127.8 145 32.7-32.6L20.7 25.8c-1.6-1-3.4-1.5-5.4-1.5-4.9 0-9 3.7-9.3 8.6l121.8 112z"
            fill="#34A853"
        />
    </svg>
)

const StoreBadge = ({ variant, href, className }: Props) => {
    const isIOS = variant === "ios"
    const overline = isIOS ? "Descárgala en" : "Disponible en"
    const main = isIOS ? "App Store" : "Google Play"

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${overline} ${main}`}
            className={cn(
                "inline-flex items-center gap-3 px-5 py-3 bg-black text-white rounded-xl shadow-md hover:bg-neutral-800 transition-colors w-full sm:w-auto",
                className
            )}
        >
            {isIOS ? <AppleLogo /> : <PlayLogo />}
            <span className="flex flex-col leading-tight text-left">
                <span className="text-[10px] uppercase tracking-wide opacity-80">
                    {overline}
                </span>
                <span className="text-base font-semibold">{main}</span>
            </span>
        </a>
    )
}

export default StoreBadge
