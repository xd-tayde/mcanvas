import { 
    getImage, 
    getSize, 
    extend, 
    _Promise,
    is,
    Queue,
    createCanvas
} from '../utils'

export class MFilter {
    private _image: TCommon.image
    private _queue: Queue
    private _error: (error) => any
    constructor(
        image: TCommon.image, 
    ) {
        this._image = image
        this._queue = new Queue()
        this.clear()
    }
    public clear() {
        this.getImage().drawCanvas()
    }
    private getImage() {
        // 加载图片
        this._queue.push((next) => {
            if (is.str(this._image)) {
                getImage(this._image, img => {
                    this._image = img
                    next(img)
                }, this._error)
            } else {
                next(this._image)
            }
        })
        return this
    }
    private drawCanvas() {
        this._queue.push((next, img) => {
            const { iw, ih } = getSize(img)
            const [cvs, ctx] = createCanvas(iw, ih)
            ctx.drawImage(img, 0, 0, iw, ih)
            next({ cvs, ctx })
        })
    }
    // 高斯模糊
    public blur(value: number = 6) {
        this._queue.push((next, { cvs, ctx }) => {
            ctx.globalAlpha = 1 / (2 * +value)
            for (let y = -value; y <= value; y += 2) {
                for (let x = -value; x <= value; x += 2) {
                    ctx.drawImage(cvs, x, y)
                    if (x >= 0 && y >= 0) ctx.drawImage(cvs, -(x - 1), -(y - 1))
                }
            }
            ctx.globalAlpha = 1
            next({ cvs, ctx })
        })
        return this
    }
    // 翻转
    public flip(dire: 'hor' | 'ver' = 'hor') {
        this._queue.push((next, { cvs, ctx }) => {
            const { width, height } = cvs
            const { data: origin } = ctx.getImageData(0, 0, width, height)
            const imageData = ctx.createImageData(width, height)
            const result = imageData.data
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const off = (y * width + x) * 4
                    const resultOff = dire === 'hor' ?
                        (y * width + (width - x - 1)) * 4 : 
                        ((height - y - 1) * width + x) * 4
                    result[resultOff] = origin[off]
                    result[resultOff + 1] = origin[off + 1]
                    result[resultOff + 2] = origin[off + 2]
                    result[resultOff + 3] = origin[off + 3]
                }
            }
            ctx.putImageData(imageData, 0, 0)
            next({ cvs, ctx })
        })
        return this
    }
    // 黑白
    public gray() {
        this._queue.push((next, { cvs, ctx }) => {
            const { width, height } = cvs
            const { data: origin } = ctx.getImageData(0, 0, width, height)
            const imageData = ctx.createImageData(width, height)
            const result = imageData.data
            for (let i = 0; i < origin.length; i += 4) {
                let r = origin[i]
                let g = origin[i + 1]
                let b = origin[i + 2]
                let v = 0.3 * r + 0.59 * g + 0.11 * b
                result[i] = result[i + 1] = result[i + 2] = v
                result[i + 3] = origin[i + 3]
              }
            ctx.putImageData(imageData, 0, 0)
            next({ cvs, ctx })
        })
        return this
    }
    public draw(exportConfig: TCommon.drawOptions | ((b64: string) => void) = {}) {
        return _Promise((resolve, reject) => {
            let config = {
                type: 'jpeg',
                quality: 1,
                exportType: 'base64',
                success(result) {},
                error(err) {},
            }

            if (is.fn(exportConfig)) {
                config.success = exportConfig
            } else {
                config = extend(true, config, exportConfig) 
                if (config.type === 'jpg') config.type = 'jpeg'
            }

            const success = (result) => {
                config.success(result)
                resolve(result)
            } 

            this._error = (err) => {
                config.error(err)
                reject(err)
            }

            this._queue.perform(({ cvs, ctx }) => {
                if (config.exportType === 'canvas') {
                    success(cvs)
                } else {
                    setTimeout(() => {
                        const b64 = cvs.toDataURL(`image/${config.type}`, config.quality)
                        success(b64)
                    }, 0)
                }
            })
        })
    }
}