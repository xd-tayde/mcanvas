import { createCanvas, loadImage } from 'canvas'

// 使用 node-canvas， 兼容 Node 环境
export const _Canvas = {
    name: 'NodeCanvas',
    create(width: number = 500, height: number = 500) {
        const cvs = createCanvas(width, height)
        const ctx = cvs.getContext('2d')
        return [cvs, ctx]
    },
    loadImage(image: string, loaded: (img: any) => any, error: (msg: string) => any) {
        loadImage(image).then(loaded).catch(error)
    },
}