import * as StackBlur from 'stackblur-canvas'

export function blur(cvs: HTMLCanvasElement, value: number = 20) {
    const { width, height } = cvs
    const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    StackBlur.canvasRGBA(cvs, 0, 0, width, height, value)
    return [cvs, ctx]
}

// 翻转
export function flip(cvs: HTMLCanvasElement, dire: 'hor' | 'ver' = 'hor') {
    const { width, height } = cvs
    const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    const { data: oPixels } = ctx.getImageData(0, 0, width, height)
    const imageData = ctx.createImageData(width, height)
    const dstPixels = imageData.data

    let y, x, off, dstOff
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            off = (y * width + x) * 4
            dstOff = dire === 'hor' ?
                (y * width + (width - x - 1)) * 4 : 
                ((height - y - 1) * width + x) * 4
            dstPixels[dstOff] = oPixels[off]
            dstPixels[dstOff + 1] = oPixels[off + 1]
            dstPixels[dstOff + 2] = oPixels[off + 2]
            dstPixels[dstOff + 3] = oPixels[off + 3]
        }
    }
    ctx.putImageData(imageData, 0, 0)
    return [cvs, ctx]
}
// 黑白
export function gray(cvs: HTMLCanvasElement) {
    const { width, height } = cvs
    const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    const { data: oPixels } = ctx.getImageData(0, 0, width, height)
    const imageData = ctx.createImageData(width, height)
    const dstPixels = imageData.data

    let i, r, g, b, v
    for (i = 0; i < oPixels.length; i += 4) {
        r = oPixels[i]
        g = oPixels[i + 1]
        b = oPixels[i + 2]
        v = 0.3 * r + 0.59 * g + 0.11 * b
        dstPixels[i] = dstPixels[i + 1] = dstPixels[i + 2] = v
        dstPixels[i + 3] = oPixels[i + 3]
    }
    ctx.putImageData(imageData, 0, 0)
    return [cvs, ctx]
}
// 马赛克
export function mosaic(cvs: HTMLCanvasElement, block: number = 10) {
    const { width, height } = cvs
    const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    const { data: oPixels } = ctx.getImageData(0, 0, width, height)
    const imageData = ctx.createImageData(width, height)
    const dstPixels = imageData.data
    
    let cols = Math.ceil(width / block),
        rows = Math.ceil(height / block),
        row, col, x_start, x_end, y_start, y_end,
        x, y, yIndex, index, size, r, g, b, a

    for (row = 0; row < rows; row++) {
        y_start = row * block
        y_end   = y_start + block
        if (y_end > height) y_end = height

        for (col = 0; col < cols; col++) {
            x_start = col * block
            x_end   = x_start + block
            if (x_end > width) x_end = width
            r = g = b = a = 0
            size = (x_end - x_start) * (y_end - y_start)

            for (y = y_start; y < y_end; y += 1) {
                yIndex = y * width
                for (x = x_start; x < x_end; x += 1) {
                    index = (yIndex + x) << 2
                    r += oPixels[index]
                    g += oPixels[index + 1]
                    b += oPixels[index + 2]
                    a += oPixels[index + 3]
                }
            }

            r = (r / size) + 0.5 | 0
            g = (g / size) + 0.5 | 0
            b = (b / size) + 0.5 | 0
            a = (a / size) + 0.5 | 0

            for (y = y_start; y < y_end; y++) {
                yIndex = y * width
                for (x = x_start; x < x_end; x++) {
                    index = (yIndex + x) << 2
                    dstPixels[index] = r
                    dstPixels[index + 1] = g
                    dstPixels[index + 2] = b
                    dstPixels[index + 3] = a
                }
            }
        }
    }
    ctx.putImageData(imageData, 0, 0)
    return [cvs, ctx]
}
// range: 1 - 5
// levels: 1 - 256
export function oil(cvs: HTMLCanvasElement, range: number = 2, levels: number = 32) {
    const { width, height } = cvs
    const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    const { data: oPixels } = ctx.getImageData(0, 0, width, height)
    const imageData = ctx.createImageData(width, height)
    const dstPixels = imageData.data
    
    const rh: number[] = [],
        gh: number[] = [],
        bh: number[] = [],
        rt: number[] = [],
        gt: number[] = [],
        bt: number[] = []
    let index = 0, rowIndex, colIndex, offset, srcIndex, 
        x, y, z, row, col, sr, sg, sb, ri, gi, bi, r, g, b
    
    for (y = 0; y < height; y++) {
        for (x = 0; x < width; x++) {
            for (z = 0; z < levels; z++) {
                rh[z] = gh[z] = bh[z] = rt[z] = gt[z] = bt[z] = 0
            }
            
            for (row = -range; row <= range; row++) {
                rowIndex = y + row
                if (rowIndex < 0 || rowIndex >= height) continue
                offset = rowIndex * width
                for (col = -range; col <= range; col++) {
                    colIndex = x + col
                    if (colIndex < 0 || colIndex >= width) continue
                    srcIndex = (offset + colIndex) << 2
                    sr = oPixels[srcIndex]
                    sg = oPixels[srcIndex + 1]
                    sb = oPixels[srcIndex + 2]
                    ri = (sr * levels) >> 8
                    gi = (sg * levels) >> 8
                    bi = (sb * levels) >> 8
                    rt[ri] += sr
                    gt[gi] += sg
                    bt[bi] += sb
                    rh[ri] += 1
                    gh[gi] += 1
                    bh[bi] += 1
                }
            }
            r = g = b = 0
            for (z = 1; z < levels; z++) {
                if (rh[z] > rh[r]) r = z
                if (gh[z] > gh[g]) g = z
                if (bh[z] > bh[b]) b = z
            }
            dstPixels[index] = rt[r] / rh[r] | 0
            dstPixels[index + 1] = gt[g] / gh[g] | 0
            dstPixels[index + 2] = bt[b] / bh[b] | 0
            dstPixels[index + 3] = oPixels[index + 3]
            index += 4
        }
    }
    ctx.putImageData(imageData, 0, 0)
    return [cvs, ctx]
}