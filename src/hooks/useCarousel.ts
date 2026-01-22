import { CarouselApi } from "@/components/ui/carousel"
import { useEffect, useState } from "react"

const useCarousel = () => {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    return {
        setApi,
        current
    }
}

export default useCarousel