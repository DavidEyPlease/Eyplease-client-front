import { IMonthlyReportResponse } from "@/interfaces/monthlyReports"
import PptxGenJS from "pptxgenjs"

class SlideImageBuilder {
    static addBackground(slide: PptxGenJS.Slide, imagePath: string): void {
        slide.addImage({
            path: imagePath,
            x: 0, y: 0, w: '100%', h: '100%'
        })
    }

    static addProfileImage(
        slide: PptxGenJS.Slide,
        imageUrl: string,
        imageProps: PptxGenJS.ImageProps
    ): void {
        slide.addImage({
            path: imageUrl,
            ...imageProps
        })
    }

    static addImage(slide: PptxGenJS.Slide, props: PptxGenJS.ImageProps): void {
        slide.addImage(props)
    }

    static getImageDataUrl(report: IMonthlyReportResponse): string {
        const profilePhoto = report?.has_photo
            ? report!.photo_url
            : `/images/${report?.photo_filename ?? 'women-avatar.jpg'}`

        return profilePhoto
    }
}

export default SlideImageBuilder