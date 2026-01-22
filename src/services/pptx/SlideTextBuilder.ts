import PptxGenJS from "pptxgenjs"

class SlideTextBuilder {
    private static readonly BASE_STYLE = {
        fontFace: 'Poppins',
        color: 'FFFFFF',
    } as const

    static addText(
        slide: PptxGenJS.Slide,
        text: string | PptxGenJS.TextProps[],
        options: Partial<PptxGenJS.TextPropsOptions> = {}
    ): void {
        slide.addText(text, {
            ...this.BASE_STYLE,
            ...options
        })
    }

    static createMultilineText(
        lines: string[],
        baseOptions: PptxGenJS.TextPropsOptions
    ): PptxGenJS.TextProps[] {
        return lines.map(text => ({
            text,
            options: baseOptions
        }))
    }
}

export default SlideTextBuilder