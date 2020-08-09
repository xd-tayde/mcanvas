/// <reference path="./types/commom.d.ts" />
/// <reference path="./types/mcanvas.d.ts" />
/// <reference path="./types/mimage.d.ts" />

declare module 'mcanvas' {
    export class MCanvas {
        constructor(options?: TCanvas.options)
        background(image?: TCommon.image, bg?: TCanvas.backgroundOptions): MCanvas
        rect(ops?: TCanvas.rectOptions): MCanvas
        circle(ops?: TCanvas.circleOptions): MCanvas
        watermark(image: TCommon.image, ops?: TCanvas.watermarkOptions): MCanvas
        add(image: TCanvas.addData[] | TCommon.image, options?: TCanvas.addOptions): MCanvas
        text(context: string, ops?: TCanvas.textOptions): MCanvas
        draw(ops?: TCommon.drawOptions | ((b64: string) => void)): Promise<string | HTMLCanvasElement>
    }
    
    export class MImage {
        constructor(image: TCommon.image)
        crop(options?: TImage.cropOptions): MImage
        compress(options?: TImage.compressOptions): MImage
        filter(type: TImage.ftype, ...data: any): MImage
        clear(): MImage
        draw(ops?: TCommon.drawOptions | ((b64: string) => void)): Promise<string | HTMLCanvasElement>
    }
    
    export default MCanvas
}