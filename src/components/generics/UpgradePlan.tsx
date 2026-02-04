import RocketImage from '@/assets/images/rocket.png'
import Button from '../common/Button'
import Modal from '../common/Modal'
import { useState } from 'react'
import useAuthStore from '@/store/auth'
import { CheckCircleIcon } from 'lucide-react'
import { ScrollArea } from '../ui/scroll-area'

const WS_LINK = `https://api.whatsapp.com/send/?phone=${import.meta.env.VITE_WS_NUMBER}&text={textReplace}&type=phone_number&app_absent=0`

const UpgradePlan = () => {
    const [openPlans, setOpenPlans] = useState(false)
    const { utilData } = useAuthStore(state => state)

    return (
        <div className="relative p-5 bg-primary-dark rounded-xl w-fit">
            <div className="flex flex-col items-center text-center gap-1 text-white">
                <Button text="Ascender Plan" rounded size="lg" onClick={() => setOpenPlans(true)} />
                <p className="text-xs opacity-75">Asciende de plan para disfrutar de muchas más opciones.</p>
            </div>
            <div>
                <img
                    src={RocketImage}
                    alt="Rocket Image"
                    className="absolute top-[-40px] right-0 w-16"
                />
            </div>

            <Modal
                open={openPlans}
                onOpenChange={setOpenPlans}
                title="Ascender de plan"
                size="5xl"
            >
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 w-full">
                    {/* Light Card */}
                    {utilData.plans.map(plan => (
                        <div className="bg-gray-100 dark:bg-[#262626] rounded-3xl p-2 shadow-[0_12px_50px_-15px_rgba(0,0,0,0.1)] border border-gray-200/60 flex flex-col">
                            <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl p-8 mb-2">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                                    {plan.name}
                                </h2>
                                <div className="flex items-baseline mb-8">
                                    <span className="text-5xl font-bold text-gray-900 dark:text-white tracking-tighter">
                                        ${plan.price}
                                    </span>
                                    <span className="text-gray-400 text-lg ml-1">/mensual</span>
                                </div>
                                <Button text="Contratar" block size='lg' onClick={() => {
                                    window.open(WS_LINK.replace('{textReplace}', `Hola, estoy interesada (o) en el ${plan.name} de Eyplease+`), '_blank')
                                }} />
                            </div>
                            <ScrollArea className="h-96">
                                <div className="bg-gray-100 dark:bg-[#262626] px-6 pb-6 pt-4 flex-grow flex flex-col">
                                    <div className="grid gap-y-4 gap-x-4 mb-auto">
                                        {plan.features.map((feature, index) => (
                                            <div key={`${plan.name}-feature-${index}`} className="flex items-center gap-3">
                                                <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollArea>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    )
}

export default UpgradePlan