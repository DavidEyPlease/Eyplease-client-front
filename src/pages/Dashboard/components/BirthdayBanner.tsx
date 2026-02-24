import { useState } from "react"
import Confetti from "react-confetti"
import { Gift, PartyPopper } from "lucide-react"
import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import useAuthStore from "@/store/auth"
import { IPost, PostTypes } from "@/interfaces/posts"
import { queryKeys } from "@/utils/cache"
import useFetchQuery from "@/hooks/useFetchQuery"
import { API_ROUTES } from "@/constants/api"
import PageTitle from "@/components/generics/PageTitle"
import PostItem from "@/pages/Posts/components/PostItem"

interface BirthdayBannerProps {
    variant?: "full" | "compact"
}

const BirthdayBanner = ({ variant = "full" }: BirthdayBannerProps) => {
    const user = useAuthStore((state) => state.user)
    const [showConfetti, setShowConfetti] = useState(true)
    const [showGiftModal, setShowGiftModal] = useState(false)

    const { response: birthdayPost, loading: loadingBirthdayPost } = useFetchQuery<IPost>(API_ROUTES.POSTS.MY_BIRTHDAY, {
        customQueryKey: queryKeys.list('post/my-birthday'),
        queryParams: {
            post_type: PostTypes.EYPLEASE_CLIENTS,
        },
        staleTime: 1000 * 60 * 60 * 24,
    })

    if (loadingBirthdayPost || (!loadingBirthdayPost && !birthdayPost?.data)) {
        return null
    }

    const firstName = user?.name?.split(" ")[0] || ""

    if (variant === "compact") {
        return (
            <div className="relative mx-2 mb-2 overflow-hidden rounded-xl bg-gradient-to-br from-purple-600/90 via-indigo-600/90 to-blue-500/90 p-3 shadow-lg">
                {/* Decorative glow */}
                <div className="pointer-events-none absolute -top-4 -right-4 h-16 w-16 rounded-full bg-yellow-300/20 blur-xl" />
                <div className="pointer-events-none absolute -bottom-3 -left-3 h-12 w-12 rounded-full bg-pink-400/20 blur-xl" />

                <div className="relative z-10 flex flex-col items-center gap-2 text-center">
                    <span className="text-2xl leading-none">🎂</span>
                    <p className="text-xs font-bold leading-tight text-white">
                        ¡Feliz Cumpleaños{firstName ? `, ${firstName}` : ""}! 🎉
                    </p>
                    <p className="text-[10px] leading-snug text-white/75">
                        Tenemos algo especial para ti
                    </p>
                    <Button
                        size="sm"
                        text={
                            <span className="flex items-center gap-1.5 text-[11px]">
                                <Gift className="h-3.5 w-3.5" />
                                Ve nuestro obsequio
                            </span>
                        }
                        className="bg-gradient-to-r! from-yellow-400! to-orange-400! text-purple-900! mt-1 w-full! px-3! py-1.5! text-[11px]! font-bold shadow-md transition-all duration-300 hover:shadow-lg"
                        onClick={() => setShowGiftModal(true)}
                    />
                </div>

                <Modal
                    open={showGiftModal}
                    onOpenChange={setShowGiftModal}
                    title="🎁 Tu obsequio de cumpleaños"
                    description="¡Esperamos que lo disfrutes!"
                    size="md"
                >
                    {birthdayPost?.data && <PostItem item={birthdayPost.data} />}
                </Modal>
            </div>
        )
    }

    return (
        <PageTitle className="relative col-span-3 overflow-hidden rounded-2xl border-0 p-0 shadow-xl">
            {/* Confetti */}
            {showConfetti && (
                <Confetti
                    width={1200}
                    height={400}
                    recycle={true}
                    numberOfPieces={120}
                    gravity={0.08}
                    colors={["#fbbf24", "#f472b6", "#818cf8", "#34d399", "#fb923c", "#f9fafb"]}
                    onConfettiComplete={() => setShowConfetti(false)}
                />
            )}

            <div className="relative z-10 flex flex-col items-center gap-6 px-6 py-5 text-center md:flex-row md:gap-10 md:px-12 md:text-left">
                {/* Cake SVG illustration */}
                <div className="flex shrink-0 items-center justify-center">
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/15 shadow-inner backdrop-blur-sm md:h-36 md:w-36">
                        <svg
                            viewBox="0 0 128 128"
                            className="h-20 w-20 drop-shadow-lg md:h-24 md:w-24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* Candle flames */}
                            <ellipse cx="44" cy="22" rx="4" ry="7" fill="#fbbf24" opacity="0.9">
                                <animate attributeName="ry" values="7;9;7" dur="0.8s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.9;1;0.9" dur="0.8s" repeatCount="indefinite" />
                            </ellipse>
                            <ellipse cx="64" cy="18" rx="4.5" ry="8" fill="#fb923c" opacity="0.9">
                                <animate attributeName="ry" values="8;10;8" dur="1s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.9;1;0.9" dur="1s" repeatCount="indefinite" />
                            </ellipse>
                            <ellipse cx="84" cy="22" rx="4" ry="7" fill="#fbbf24" opacity="0.9">
                                <animate attributeName="ry" values="7;9;7" dur="0.9s" repeatCount="indefinite" />
                                <animate attributeName="opacity" values="0.9;1;0.9" dur="0.9s" repeatCount="indefinite" />
                            </ellipse>

                            {/* Candle sticks */}
                            <rect x="42" y="28" width="4" height="18" rx="2" fill="#f9fafb" />
                            <rect x="62" y="24" width="4" height="22" rx="2" fill="#f9fafb" />
                            <rect x="82" y="28" width="4" height="18" rx="2" fill="#f9fafb" />

                            {/* Cake top layer (frosting) */}
                            <path
                                d="M28 48 C28 42, 38 38, 64 38 C90 38, 100 42, 100 48 L100 58 L28 58 Z"
                                fill="#f9a8d4"
                            />
                            {/* Frosting drips */}
                            <path
                                d="M28 58 Q34 68, 40 58 Q46 68, 52 58 Q58 68, 64 58 Q70 68, 76 58 Q82 68, 88 58 Q94 68, 100 58"
                                fill="#f9a8d4"
                                stroke="#f9a8d4"
                                strokeWidth="1"
                            />

                            {/* Cake middle */}
                            <rect x="28" y="58" width="72" height="24" rx="2" fill="#fef3c7" />

                            {/* Decorative dots on cake */}
                            <circle cx="42" cy="70" r="2.5" fill="#c084fc" />
                            <circle cx="54" cy="70" r="2.5" fill="#60a5fa" />
                            <circle cx="66" cy="70" r="2.5" fill="#c084fc" />
                            <circle cx="78" cy="70" r="2.5" fill="#60a5fa" />
                            <circle cx="88" cy="70" r="2.5" fill="#c084fc" />

                            {/* Cake bottom layer */}
                            <rect x="22" y="82" width="84" height="26" rx="6" fill="#fde68a" />

                            {/* Bottom frosting */}
                            <path
                                d="M22 82 Q30 92, 38 82 Q46 92, 54 82 Q62 92, 70 82 Q78 92, 86 82 Q94 92, 106 82"
                                fill="#f9a8d4"
                                stroke="#f9a8d4"
                                strokeWidth="1"
                            />

                            {/* Cake plate */}
                            <ellipse cx="64" cy="108" rx="50" ry="6" fill="#e2e8f0" opacity="0.6" />

                            {/* Sprinkles */}
                            <rect x="32" y="90" width="5" height="2" rx="1" fill="#c084fc" transform="rotate(-30,34,91)" />
                            <rect x="50" y="94" width="5" height="2" rx="1" fill="#60a5fa" transform="rotate(20,52,95)" />
                            <rect x="68" y="90" width="5" height="2" rx="1" fill="#fb923c" transform="rotate(-15,70,91)" />
                            <rect x="82" y="94" width="5" height="2" rx="1" fill="#34d399" transform="rotate(25,84,95)" />
                            <rect x="40" y="98" width="5" height="2" rx="1" fill="#fbbf24" transform="rotate(10,42,99)" />
                            <rect x="72" y="99" width="5" height="2" rx="1" fill="#f472b6" transform="rotate(-20,74,100)" />
                        </svg>

                        {/* Sparkle accents */}
                        <PartyPopper className="absolute -top-2 -right-2 h-7 w-7 text-yellow-300 animate-bounce" />
                        <PartyPopper className="absolute -bottom-1 -left-2 h-6 w-6 text-pink-300 animate-bounce [animation-delay:0.3s]" />
                    </div>
                </div>

                {/* Text content */}
                <div className="flex flex-1 flex-col gap-4">
                    <div className="flex items-center justify-center gap-2 md:justify-start">
                        <span className="text-3xl">🎉</span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-md md:text-3xl">
                            ¡Feliz Cumpleaños{firstName ? `, ${firstName}` : ""}!
                        </h2>
                        <span className="text-3xl">🎉</span>
                    </div>
                    <p className="mx-auto max-w-lg text-base leading-relaxed text-white/85 md:mx-0 md:text-lg">
                        Hoy es un día muy especial y queremos celebrarlo contigo. ¡Gracias por ser parte de nuestro equipo! Tenemos algo preparado para ti.
                    </p>

                    {/* CTA Button */}
                    <div className="mt-2 flex justify-center md:justify-start">
                        <Button
                            text={
                                <span className="flex items-center gap-2 text-base">
                                    <Gift className="h-5 w-5" />
                                    Ve nuestro obsequio
                                </span>
                            }
                            className="bg-gradient-to-r! from-yellow-400! to-orange-400! text-purple-900! hover:from-yellow-300 hover:to-orange-300 px-8! py-3 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                            onClick={() => setShowGiftModal(true)}
                        />
                    </div>
                </div>
            </div>

            <Modal
                open={showGiftModal}
                onOpenChange={setShowGiftModal}
                title="🎁 Tu obsequio de cumpleaños"
                description="¡Esperamos que lo disfrutes!"
                size="md"
            >
                {birthdayPost?.data && <PostItem item={birthdayPost.data} />}
            </Modal>
        </PageTitle>
    )
}

export default BirthdayBanner
