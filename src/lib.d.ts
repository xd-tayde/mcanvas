declare module 'mcanvas' {
    export class MCompose {
        constructor(options?: TComposer.options)
        background(image?: TCommon.image, bg?: TComposer.backgroundOptions): MCompose
        rect(ops?: TComposer.rectOptions): MCompose
        circle(ops?: TComposer.circleOptions): MCompose
        watermark(image: TCommon.image, ops?: TComposer.watermarkOptions): MCompose
        add(image: TComposer.addData[] | TCommon.image, options?: TComposer.addOptions): MCompose
        text(context: string, ops?: TComposer.textOptions): MCompose
        draw(ops?: TCommon.drawOptions | ((b64: string) => void)): Promise<string | HTMLCanvasElement>
    }
    
    export class MImage {
        constructor(image: TCommon.image)
        crop(options?: TImage.cropOptions): MImage
        compress(options?: TCommon.drawOptions): MImage
        filter(type: TImage.ftype, ...data: any): MImage
        clear(): MImage
        draw(ops?: TCommon.drawOptions | ((b64: string) => void)): Promise<string | HTMLCanvasElement>
    }
    
    export default MCompose
}