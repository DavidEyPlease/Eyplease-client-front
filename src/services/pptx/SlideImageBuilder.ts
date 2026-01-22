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
}

export default SlideImageBuilder