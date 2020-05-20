import { is } from '../utils'

// Web环境
export const _Canvas = {
    name: 'WebCanvas',
    create(width: number = 500, height: number = 500) {
        const cvs = document.createElement('canvas')
        const ctx = cvs.getContext('2d')
        if (is.num(width)) cvs.width = width
        if (is.num(height)) cvs.height = height
        return [cvs, ctx] as [HTMLCanvasElement, CanvasRenderingContext2D]
    },
    loadImage(image: string) {
        return new Promise((resolve, reject) => {
            const img = new Image()
            if (image.indexOf('http') === 0) img.crossOrigin = '*'
            img.onload = () => resolve(img)
            img.onerror = () => reject(`img load error.url: ${image}`)
            img.src = image
        })
    },
}