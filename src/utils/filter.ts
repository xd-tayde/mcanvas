export function boxBlur(src, dst, width, height, radius) {
    const tableSize = radius * 2 + 1
    const radiusPlus1 = radius + 1
    const widthMinus1 = width - 1

    let r, g, b, a
    let srcIndex = 0
    let dstIndex
    let p, next, prev
    let i, l, x, y, nextIndex, prevIndex

    const sumTable: number[] = []
    for (i = 0, l = 256 * tableSize; i < l; i += 1) {
        sumTable[i] = i / tableSize | 0
    }

    for (y = 0; y < height; y += 1) {
        r = g = b = a = 0
        dstIndex = y

        p = srcIndex << 2
        r += radiusPlus1 * src[p]
        g += radiusPlus1 * src[p + 1]
        b += radiusPlus1 * src[p + 2]
        a += radiusPlus1 * src[p + 3]

        for (i = 1; i <= radius; i += 1) {
            p = (srcIndex + (i < width ? i : widthMinus1)) << 2
            r += src[p]
            g += src[p + 1]
            b += src[p + 2]
            a += src[p + 3]
        }

        for (x = 0; x < width; x += 1) {
            p = dstIndex << 2
            dst[p]     = sumTable[r]
            dst[p + 1] = sumTable[g]
            dst[p + 2] = sumTable[b]
            dst[p + 3] = sumTable[a]

            nextIndex = x + radiusPlus1
            if (nextIndex > widthMinus1) {
                nextIndex = widthMinus1
            }

            prevIndex = x - radius
            if (prevIndex < 0) {
                prevIndex = 0
            }

            next = (srcIndex + nextIndex) << 2
            prev = (srcIndex + prevIndex) << 2

            r += src[next]     - src[prev]
            g += src[next + 1] - src[prev + 1]
            b += src[next + 2] - src[prev + 2]
            a += src[next + 3] - src[prev + 3]
            
            dstIndex += height
        }

        srcIndex += width
    }
}

/**
 * Algorithm based on BoxBlurFilter.java by Huxtable.com
 * @see http://www.jhlabs.com/ip/blurring.html
 * Copyright 2005 Huxtable.com. All rights reserved.
 */
export function blur(cvs: HTMLCanvasElement, value: number = 6) {
    const ctx = cvs.getContext('2d') as CanvasRenderingContext2D
    ctx.globalAlpha = 1 / (2 * +value)
    for (let y = -value; y <= value; y += 2) {
        for (let x = -value; x <= value; x += 2) {
            ctx.drawImage(cvs, x, y)
            if (x >= 0 && y >= 0) ctx.drawImage(cvs, -(x - 1), -(y - 1))
        }
    }
    ctx.globalAlpha = 1
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