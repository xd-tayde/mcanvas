import { Queue } from '@Src/utils/queue'
import { getSize, is, extend } from '@Src/utils'
import { crop } from '@Src/utils/crop'
import { blur, flip, gray, mosaic, oil } from '@Src/utils/filter'
import { Canvas } from '@Src/canvas'

export class MImage {
    private _image: TCommon.image
    private _queue: Queue
    private _error: (error) => any
    constructor(image: TCommon.image) {
        this._image = image
        this._queue = new Queue()
        this.clear()
    }
    public clear() {
        this._getImage()._drawCanvas()
        return this
    }
    private _drawCanvas() {
        return this._run((img) => {
            const { iw, ih } = getSize(img)
            const [cvs, ctx] = Canvas.create(iw, ih)
            ctx.drawImage(img, 0, 0, iw, ih)
            return { cvs, ctx }
        })
    }

    private _getImage() {
        // 加载图片
        return this._run(() => (
            new Promise(resolve => {
                if (is.str(this._image)) {
                    Canvas.getImage(this._image, img => {
                        resolve(this._image = img)
                    }, this._error)
                } else {
                    resolve(this._image)
                }
            })
        ))
    }

    private _run(fn: (data: any) => any) {
        this._queue.push((next, data) => {
            setTimeout(async () => {
                const nextData = fn(data)
                if (is.promise(nextData)) {
                    nextData.then(next)
                } else {
                    next(nextData)
                }
            }, 0)
        })
        return this
    }

    public draw(exportConfig: TCommon.drawOptions | ((b64: string) => void) = {}) {
        return new Promise((resolve, reject) => {
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

            this._queue.perform(({ cvs }) => {
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
    // 裁剪
    public crop(options: TImage.cropOptions = {}) {
        return this._run(({ cvs }) => crop(cvs, options))
    }
    // 压缩
    public compress(options: TCommon.drawOptions = {}) {
        return this.draw(options)
    }
    // 滤镜
    public filter(type: TImage.ftype, ...data) {
        return this._run(({ cvs, ctx }) => {
            let fcvs = cvs, fctx = ctx
            switch (type) {
                case 'blur':
                    [fcvs, fctx] = blur(cvs, ...data)
                    break
                case 'flip':
                    [fcvs, fctx] = flip(cvs, ...data)
                    break
                case 'gray':
                    [fcvs, fctx] = gray(cvs)
                    break
                case 'mosaic':
                    [fcvs, fctx] = mosaic(cvs, ...data)
                    break
                case 'oil':
                    [fcvs, fctx] = oil(cvs, ...data)
                    break
            }

            return {
                cvs: fcvs,
                ctx: fctx,
            }
        })
    }
}