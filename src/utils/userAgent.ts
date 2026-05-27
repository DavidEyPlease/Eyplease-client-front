export type DeviceOS = 'ios' | 'android' | 'desktop'

export const detectDeviceOS = (userAgent: string = navigator.userAgent): DeviceOS => {
    const ua = userAgent.toLowerCase()
    if (/iphone|ipad|ipod/.test(ua) || (ua.includes('mac') && 'ontouchend' in document)) {
        return 'ios'
    }
    if (/android/.test(ua)) {
        return 'android'
    }
    return 'desktop'
}
