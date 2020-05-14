import { 
    getImage, 
    getSize, 
    getLength, 
    throwError, 
    extend, 
    transValue,
    Point
} from '../utils'

// 加工获取 pos.x 和 pos.y
// const getPos = (imgW, cropW, str) => {
//     if (!str && str !== 0) return str
//     let result = str
//     if(typeof str === 'string'){
//         if(str.indexOf(':') !== -1){
//             let arr = str.split(':')
//             switch (arr[0]) {
//                 case 'left':
//                 case 'top':
//                     result = +(arr[1].replace('px', ''))
//                     break
//                 case 'right':
//                 case 'bottom':
//                     result = imgW - (+(arr[1].replace('px', '')))
//                     break
//                 default:
//             }
//         } else if (str.indexOf('px') !== -1) {
//             result = (+str.replace('px', ''))
//         } else if (str.indexOf('%') !== -1) {
//             result = imgW * (+str.replace('%', '')) / 100
//         } else if (str === 'center'){
//             result = (imgW - cropW) / 2
//         } else {
//             result = +str
//         }
//     }
//     return Math.round(result)
// }

// 获取长度
// const getLength = (imgW, str) => {
//     if (!str && str !== 0) return str
//     let result = str
//     if(typeof str === 'string'){
//         if (str.indexOf('px') !== -1) {
//             result = (+str.replace('px', ''))
//         } else if (str.indexOf('%') !== -1) {
//             result = imgW * (+str.replace('%', '')) / 100
//         } else if (str === 'center'){
//             result = imgW / 2
//         } else {
//             result = +str
//         }
//     }
//     return Math.round(result)
// }

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

    public fillRoundRect(
        x: number, 
        y: number, 
        width: number, 
        height: number, 
        radius: number
    ) {
        // 圆的直径必然要小于矩形的宽高
        const minL = Math.min(width, height)      
        if (2 * radius > minL) radius = minL / 2
        this.ctx.save()
        this.ctx.translate(x, y)
        // 绘制圆角矩形的各个边  
        this._drawRoundRectPath(width, height, radius)
        this.ctx.fillStyle = "#000"
        this.ctx.fill()
        this.ctx.restore()
    }
    private _drawRoundRectPath(width: number, height: number, radius: number) {
        this.ctx.beginPath()
        this.ctx.arc(width - radius, height - radius, radius, 0, Math.PI / 2)
        this.ctx.lineTo(radius, height)
        this.ctx.arc(radius, height - radius, radius, Math.PI / 2, Math.PI)
        this.ctx.lineTo(0, radius)
        this.ctx.arc(radius, radius, radius, Math.PI, Math.PI * 3 / 2)
        this.ctx.lineTo(width - radius, 0)
        this.ctx.arc(width - radius, radius, radius, Math.PI * 3 / 2, Math.PI * 2)
        this.ctx.lineTo(width, height - radius)
        this.ctx.closePath()
    }
    public draw(exportConfig: TCommon.drawOptions | ((b64: string) => void) = {}) {
        return new Promise((resolve, reject) => {
            const config = extend(true, {
                type: 'jpeg',
                quality: .9,
                success() {},
                error() {},
            }, exportConfig) 

            getImage(this.image, img => {
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
                this.fillRoundRect(x, y, width, height, radius)
                this.ctx.globalCompositeOperation = 'source-in'
                this.ctx.drawImage(img, -x, -y, iw, ih)
                
   
                if (radius > 0) config.type = 'png'
                setTimeout(()=>{
                    const b64 = this.cvs.toDataURL(`image/${config.type}`, config.quality)
                    resolve(b64)
                    config.success(b64)
                }, 0)
            }, err => {
                config.error(err)
                reject(err)
            })
        })
    }
}