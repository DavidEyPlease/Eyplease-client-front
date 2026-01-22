import RocketImage from '@/assets/images/rocket.png'
import Button from '../common/Button'

const UpgradePlan = () => {
    return (
        <div className="relative p-5 bg-primary-dark rounded-xl w-fit">
            <div className="flex flex-col gap-1 text-white">
                <Button text="Ascender Plan" rounded size="lg" />
                <p className="text-xs text-center opacity-75">Asciende de plan para disfrutar de muchas más opciones.</p>
            </div>
            <div>
                <img
                    src={RocketImage}
                    alt="Rocket Image"
                    className="absolute top-[-40px] right-0 w-16"
                />
            </div>
        </div>

    )
}

export default UpgradePlan