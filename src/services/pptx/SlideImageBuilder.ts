import { IMonthlyReportResponse } from "@/interfaces/monthlyReports"
import PptxGenJS from "pptxgenjs"

class SlideImageBuilder {
    /**
     * Appends a cache-busting query parameter to external URLs to avoid
     * the browser serving a cached response (from a prior <img> load)
     * that lacks CORS headers, which causes PptxGenJS's XHR to fail.
     */
    private static bustCorsCache(url: string): string {
        if (!url || !url.startsWith('http')) return url
        const separator = url.includes('?') ? '&' : '?'
        return `${url}${separator}cb=${Date.now()}`
    }

    static addBackground(slide: PptxGenJS.Slide, imagePath: string): void {
        slide.addImage({
            path: this.bustCorsCache(imagePath),
            x: 0, y: 0, w: '100%', h: '100%'
        })
    }

    static addProfileImage(
        slide: PptxGenJS.Slide,
        imageUrl: string,
        imageProps: PptxGenJS.ImageProps
    ): void {
        slide.addImage({
            path: this.bustCorsCache(imageUrl),
            ...imageProps
        })
    }

    static addImage(slide: PptxGenJS.Slide, props: PptxGenJS.ImageProps): void {
        const bustedProps = props.path
            ? { ...props, path: this.bustCorsCache(props.path) }
            : props
        slide.addImage(bustedProps)
    }

    static getImageDataUrl(report: IMonthlyReportResponse): string {
        const profilePhoto = report?.has_photo
            ? report!.photo_url
            : `/images/${report?.photo_filename ?? 'women-avatar.jpg'}`

        return profilePhoto
    }
}

export default SlideImageBuilder