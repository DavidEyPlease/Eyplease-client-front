import Spinner from "../common/Spinner";
import EYPLEASE_LOGO_WHITE from "@/assets/images/icon-color.png"

const PageLoader = () => {
    return (
        <div className="absolute w-[98%] h-screen flex items-center rounded-sm justify-center">
            <div className="relative flex items-center justify-center -m-10">
                <Spinner size="xl" color="primary" />
                <div className="absolute top-[12px]">
                    <img src={EYPLEASE_LOGO_WHITE} className="w-10" />
                </div>
            </div>
        </div>
    )
}

export default PageLoader;