import { useEffect, useState } from 'react'
import { detectDeviceOS, type DeviceOS } from '@/utils/userAgent'

const useDeviceOS = (): DeviceOS => {
    const [os, setOs] = useState<DeviceOS>('desktop')

    useEffect(() => {
        setOs(detectDeviceOS())
    }, [])

    return os
}

export default useDeviceOS
