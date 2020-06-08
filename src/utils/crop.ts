import { 
    getSize, 
    getLength, 
    extend, 
    transValue,
} from './index'

import { Canvas } from '../canvas'

export function crop(img: HTMLCanvasElement | HTMLImageElement, options: TImage.cropOptions) {
    const { iw, ih  } = getSize(img)
    const ops = extend(true, { 
        x: 0,
        y: 0, 
        width: '100%',
        height: '100%',
        radius: 0,
    }, options)

    let { width, height, x, y, radius } = ops
    width = getLength(iw, width)
    height = getLength(ih, height)
    if (width > iw) width = iw
    if (height > ih) height = ih
    x = transValue(iw, width, x, 'pos')
    y = transValue(ih, height, y, 'pos')
    radius = getLength(iw, radius)

    const [cCvs, cCtx] = Canvas.create(width, height)
    cCvs.width = width
    cCvs.height = height
    Canvas.drawRoundRect(cCtx, 0, 0, width, height, radius)
    cCtx.globalCompositeOperation = 'source-in'
    cCtx.drawImage(img, -x, -y, iw, ih)

    return {
        cvs: cCvs,
        ctx: cCtx,
    }
}