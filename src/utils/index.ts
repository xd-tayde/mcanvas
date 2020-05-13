export { is, type } from './is'
export { extend } from './extend'

export function loadImage(image, loaded, error) {
    let img: null | HTMLImageElement = new Image()
    if(image.indexOf('http') === 0) img.crossOrigin = '*'
    img.onload = () => {
        loaded(img)
        setTimeout(() => img = null, 1000)
    }
    img.onerror = () => {
        error('img load error')
    }
    img.src = image
}

export function getImage(image, cbk, error){
    if(typeof image === 'string'){
        loadImage(image, img => {
            cbk(img)
        }, error)
    }else if(typeof image === 'object'){
        cbk(image)
    }else{
        console.log('add image error')
        return
    }
}

export function forin(obj, cbk){
    for(let k in obj){
        if(obj.hasOwnProperty(k)){
            cbk(k, obj[k])
        }
    }
}

export function isIos8(){
    let UA = window.navigator.userAgent.toLowerCase()
    let IOS = /(iPhone|iPad|iPod|iOS)/gi.test(UA)
    let IPAD = /(iPad)/gi.test(UA)

    if(IOS){
        const version = IPAD ? UA.match(/cpu os (\d*)/) : UA.match(/iphone os (\d*)/)
        return !!(version && +version[1] < 9)
    }else{
        return false
    }
}

export function deepCopy(obj){
    return JSON.parse(JSON.stringify(obj))
}

function isImg(dom: any): dom is HTMLImageElement {
    return dom.tagName === 'IMG'
}

function isCanvas(dom: any): dom is HTMLCanvasElement {
    return dom.tagName === 'CANVAS'
}


export type TGetSizeImage = HTMLImageElement | HTMLCanvasElement | HTMLElement
export function getSize(img: TGetSizeImage){
    let iw, ih
    if(isImg(img)){
        iw = img.naturalWidth
        ih = img.naturalHeight
    }else if(isCanvas(img)){
        iw = img.width
        ih = img.height
    } else {
        iw = img.offsetWidth
        ih = img.offsetHeight
    }
    return { iw, ih }
}

export function throwError(msg: string) {
    throw new Error(`[MCanvas ERROR]: ${msg}`)
}

export function throwWarn(msg: string) {
    throw new Error(`[MCanvas WARN]: ${msg}`)
}