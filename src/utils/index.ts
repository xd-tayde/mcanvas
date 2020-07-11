import { Image as NodeImage } from 'canvas'
import { is } from './is'
export { is, type } from './is'
export { extend } from './extend'

export function forin(obj, cbk) {
    for (let k in obj) {
        if (obj.hasOwnProperty(k)) {
            cbk(k, obj[k])
        }
    }
}

export function belowIOS8() {
    if (ENV === 'node') return false
    const UA = window.navigator.userAgent.toLowerCase()
    const IOS = /(iPhone|iPad|iPod|iOS)/gi.test(UA)
    const IPAD = /(iPad)/gi.test(UA)

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


export type TGetSizeImage = HTMLImageElement | HTMLCanvasElement | NodeImage
export function getSize(img: TGetSizeImage): {
    iw: number,
    ih: number,
} {
    if (isImg(img)) {
        return {
            iw: img.naturalWidth,
            ih: img.naturalHeight
        }
    }
    return {
        iw: img.width,
        ih: img.height
    }
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

export function throwError(msg: string) {
    throw new Error(`[MCanvas ERROR]: ${msg}`)
}

export function throwWarn(msg: string) {
    throw new Error(`[MCanvas WARN]: ${msg}`)
}

function isLetter(temp: string) {
    const re = /^[A-Za-z]+$/g
    if (re.test(temp)) return true 
    return false
}

function isSymbol(temp: string) {
    const re = /[\ |\s*(.*?)\s+$|\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\(|\)|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\，|\。|\“|\”|\‘|\’|\¥|\？|\（|\）|\；|\：|\、|\！|\<|\.|\>|\/|\?]/g
    if (re.test(temp)) return true 
    return false
}

export function splitWords(context: string) {
    if (!is.str(context)) return []
    const result: string[] = []
    let i, l = context.length, word = ''
    for (i = 0; i < l; i++) {
        const single = context[i]
        if (isLetter(single)) {
            // 英文， 需要进行分词
            const next = context[i + 1]
            word += single
            if (isSymbol(next)) {
                result.push(word)
                word = ''   
            }
        } else {
            // 非英文
            result.push(single)
        }
    }
    return result
}
