import { is } from './is'
export { is, type } from './is'
export { extend } from './extend'
export { drawRoundRect } from './draw'
export { Queue } from './queueClass'

export function loadImage(image, loaded, error) {
    let img: null | HTMLImageElement = new Image()
    if (image.indexOf('http') === 0) img.crossOrigin = '*'
    img.onload = () => {
        loaded(img)
        setTimeout(() => img = null, 1000)
    }
    img.onerror = () => {
        error('img load error')
    }
    img.src = image
}

export function getImage(image, cbk, error) {
    if (typeof image === 'string') {
        loadImage(image, img => {
            cbk(img)
        }, error)
    }else if (typeof image === 'object') {
        cbk(image)
    }else {
        console.log('add image error')
        return
    }
}

export function forin(obj, cbk) {
    for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
            cbk(k, obj[k])
        }
    }
}

export function belowIOS8() {
    let UA = window.navigator.userAgent.toLowerCase()
    let IOS = /(iPhone|iPad|iPod|iOS)/gi.test(UA)
    let IPAD = /(iPad)/gi.test(UA)

    if (IOS) {
        const version = IPAD ? UA.match(/cpu os (\d*)/) : UA.match(/iphone os (\d*)/)
        return !!(version && +version[1] < 9)
    }else {
        return false
    }
}

export function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function isImg(dom: any): dom is HTMLImageElement {
    return dom.tagName === 'IMG'
}

function isCanvas(dom: any): dom is HTMLCanvasElement {
    return dom.tagName === 'CANVAS'
}


export type TGetSizeImage = HTMLImageElement | HTMLCanvasElement | HTMLElement
export function getSize(img: TGetSizeImage): {
    iw: number,
    ih: number,
} {
    let iw, ih
    if (isImg(img)) {
        iw = img.naturalWidth
        ih = img.naturalHeight
    }else if (isCanvas(img)) {
        iw = img.width
        ih = img.height
    } else {
        iw = img.offsetWidth
        ih = img.offsetHeight
    }
    return { iw, ih }
}

export function include(tar, value) {
    return tar.indexOf && tar.indexOf(value) !== -1
}

// 参数加工函数；
// 兼容 5 种 value 值：
// x:250, x:'250px', x:'100%', x:'left:250',x:'center',
// width:100,width:'100px',width:'100%'
    // par: 父级尺寸
    // child: 自身尺寸
    // value: 值
    // type: 不同处理方式
export function transValue(par: number, child: number, value: number | string, type: 'pos' | 'crop') {
    let result = value
    if (is.str(value)) {
        if (include(value, ':') && type === 'pos') {
            const [ _attr, _value ] = value.split(':')
            switch (_attr) {
                case 'left':
                case 'top':
                    result = +(_value.replace('px', ''))
                    break
                case 'right':
                case 'bottom':
                    result = par - (+(_value.replace('px', ''))) - child
                    break
            }
        } else if (include(value, 'px')) {
            result = (+value.replace('px', ''))
        } else if (include(value, '%')) {
            result = (type === 'crop' ? child : par) * (+value.replace('%', '')) / 100
        } else if (include(['top', 'left'], value)) {
            result = 0
        } else if (include(['bottom', 'right'], value)) {
            result = par - child
        } else if (value === 'center') {
            result = (par - child) / 2
        } else if (value === 'origin') {
            result = child
        } else {
            result = +value
        }
    }

    return Math.round(result as number)
}

// 获取长度
    // imgW: 参照尺寸
    // value: 值
export function getLength(ref: number, value: string | number) {
    let result = value
    if (is.str(value)) {
        if (include(value, 'px')) {
            result = (+value.replace('px', ''))
        } else if (include(value, '%')) {
            result = ref * (+value.replace('%', '')) / 100
        } else if (value === 'center') {
            result = ref / 2
        } else {
            result = +value
        }
    }
    return Math.round(result as number)
}

export function _Promise(fn: (resolve, reject) => void) {
    if (window.Promise) {
        return new Promise(fn)
    } else {
        throwWarn('Promise is not supported.You can use Promise polyfill or callback function.')
        return fn(() => {}, () => {})
    }
}

export function createCanvas(width?: number, height?: number) {
    const cvs = document.createElement('canvas')
    const ctx = cvs.getContext('2d')
    if (is.num(width)) cvs.width = width
    if (is.num(height)) cvs.height = height
    return [cvs, ctx] as [HTMLCanvasElement, CanvasRenderingContext2D]
}

export function throwError(msg: string) {
    throw new Error(`[MCanvas ERROR]: ${msg}`)
}

export function throwWarn(msg: string) {
    throw new Error(`[MCanvas WARN]: ${msg}`)
}