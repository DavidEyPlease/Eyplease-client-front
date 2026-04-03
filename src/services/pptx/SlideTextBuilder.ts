import PptxGenJS from "pptxgenjs"
import { getFontColor } from "./baseConfig"

class SlideTextBuilder {
    private static get BASE_STYLE() {
        return {
            fontFace: 'Poppins',
            color: getFontColor(),
        }
    }

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