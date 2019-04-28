import _ from './utils'

const getPos = (imgW, cropW, str) => {
    if (!str && str !== 0) return str
    let result = str
    if(typeof str === 'string'){
        if(str.indexOf(':') !== -1){
            let arr = str.split(':')
            switch (arr[0]) {
                case 'left':
                case 'top':
                    result = +(arr[1].replace('px',''))
                    break
                case 'right':
                case 'bottom':
                    result = imgW - (+(arr[1].replace('px','')))
                    break
                default:
            }
        } else if (str.indexOf('px') !== -1) {
            result = (+str.replace('px', ''))
        } else if (str.indexOf('%') !== -1) {
            result = imgW * (+str.replace('%', '')) / 100
        } else if (str == 'center'){
            result = (imgW - cropW) / 2
        } else {
            result = +str
        }
    }
    return Math.round(result)
}

const getLength = (imgW, str) => {
    if (!str && str !== 0) return str
    let result = str
    if(typeof str === 'string'){
        if (str.indexOf('px') !== -1) {
            result = (+str.replace('px', ''))
        } else if (str.indexOf('%') !== -1) {
            result = imgW * (+str.replace('%', '')) / 100
        } else if (str == 'center'){
            result = imgW / 2
        } else {
            result = +str
        }
    }
    return Math.round(result)
}

// interface ops {
//     type: 'rect' | 'circle' | 'triangle'
//  左上角坐标
//     x: number | string 
//     y: number | string
//  type = 'rect' 时有效
//     width?: number | string
//     height?: number | string
//  type = 'circle' 时有效   
//     r?: number | string
//     exportConfig?: {
//         type: 'jpg' | 'png' | 'jpeg'
//         quality: number (0 - 1)
//     }
// }

export default function MCrop(image, ops = {}){
    if (!image) {
        console.error('mcrop error : there is not a image.')
        return
    }
    const { success = () => {}, error = () => {} } = ops
    _.getImage(image, img => {
        const { iw, ih } = _.getSize(img)
        const minL = Math.min(iw, ih)
        const { type = 'rect' } = ops
        const cvs = document.createElement('canvas')
        const ctx = cvs.getContext('2d')
        if (type === 'rect') {
            let width = getLength(iw, ops.width) || iw
            let height = getLength(ih, ops.height) || ih
            if (width > iw) width = iw
            if (height > ih) height = ih
            const x = getPos(iw, width, ops.x)
            const y = getPos(ih, height, ops.y)
            // 扣除超出部分，避免截图出现空白
            if (x + width > iw) width =  iw - x
            if (y + height > ih) height =  ih - y
            cvs.width = width
            cvs.height = height             
            ctx.drawImage(img, -x, -y, iw, ih)
        } else if (type === 'circle') {
            let r = getLength(minL, ops.r) || (minL / 2)
            if (r * 2 > minL) r = minL / 2
            const x = getPos(iw, r * 2, ops.x)
            const y = getPos(ih, r * 2, ops.y)
            cvs.width = r * 2
            cvs.height = r * 2
            ctx.beginPath()
            ctx.arc(r ,r , r, 0, Math.PI*2, false)
            ctx.fillStyle = '#fff'
            ctx.fill()
            ctx.globalCompositeOperation = 'source-in'
            ctx.drawImage(img, -x, -y, iw, ih)
        }
        
        setTimeout(()=>{
            const exportConfig = _.extend({
                type:'jpg',
                quality:.9,
            }, ops.exportConfig || {}) 
            const b64 = cvs.toDataURL(`image/${exportConfig.type}`, exportConfig.quality)
            success(b64)
        },0)
    }, err => {
        console.error('mcrop error : load image error.', err)
        error(err)
    })
}