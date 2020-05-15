import { 
    getImage, 
    getSize, 
    getLength, 
    throwError, 
    extend, 
    transValue,
    _Promise,
    is,
    drawRoundRect
} from '../utils'

export class MCrop {
    private cvs: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private image: TCommon.image
    private ops: Required<TCrop.options> = { 
        x: 0,
        y: 0, 
        width: '100%',
        height: '100%',
        radius: 0,
    }
    constructor(
        image: TCommon.image, 
        ops: TCrop.options
    ) {
        this.image = image
        this.ops = extend(true, this.ops, ops)
        this.cvs = document.createElement('canvas')
        this.ctx = this.cvs.getContext('2d') as CanvasRenderingContext2D
    }
    public draw(exportConfig: TCommon.drawOptions | ((b64: string) => void) = {}) {
        return _Promise((resolve, reject) => {
            let config = {
                type: 'jpeg',
                quality: .9,
                exportType: 'base64',
                success(result) {},
                error(err) {},
            }

            if (is.fn(exportConfig)) {
                config.success = exportConfig
            } else {
                config = extend(true, config, exportConfig) 
                if(config.type === 'jpg') config.type = 'jpeg'
            }

            const success = (result) => {
                config.success(result)
                resolve(result)
            } 

            const error = (err) => {
                config.error(err)
                reject(err)
            }

            getImage(this.image, 
                img => {
                    const { iw, ih } = getSize(img)
                    let { width, height, x, y, radius } = this.ops
                    width = getLength(iw, width)
                    height = getLength(ih, height)
                    if (width > iw) width = iw
                    if (height > ih) height = ih
                    x = transValue(iw, width, x, 'pos')
                    y = transValue(ih, height, y, 'pos')
                    radius = getLength(iw, radius)

                    this.cvs.width = width
                    this.cvs.height = height
                    drawRoundRect(this.ctx, 0, 0, width, height, radius)
                    this.ctx.globalCompositeOperation = 'source-in'
                    this.ctx.drawImage(img, -x, -y, iw, ih)
                    
                    if (config.exportType === 'canvas') {
                        success(this.cvs)
                    } else {
                        if (radius > 0) config.type = 'png'
                        setTimeout(()=>{
                            const b64 = this.cvs.toDataURL(`image/${config.type}`, config.quality)
                            success(b64)
                        }, 0)
                    }
                }, 
                error
            )
        })
    }
}