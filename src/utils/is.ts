const typeString = 'Boolean Number String Function Array Date RegExp Object Error Symbol'
const class2type = {}
typeString.split(' ').forEach((type) => {
    class2type[`[object ${type}]`] = type.toLowerCase()
})

export function type(object: any) {
    const type = class2type.toString.call(object)
    if (object === null) return object + ''
    if (Number.isNaN(object)) return 'NaN'

    const isObject = typeof object === 'object'
    const isFn = typeof object === 'function'
    return isObject || isFn ? class2type[type] || 'object' : typeof object
}

export const is = {
    primitive(tar: any): tar is (string | number) {
        return ['string', 'number'].includes(type(tar))
    },
    array(tar: any): tar is any[] {
        return type(tar) === 'array'
    },
    str(tar: any): tar is string {
        return type(tar) === 'string'
    },
    obj(tar: any): tar is object {
        return type(tar) === 'object'
    },
    arr(tar: any): tar is any[] {
        return type(tar) === 'array'
    },
    num(tar: any): tar is number {
        return type(tar) === 'number'
    },
    fn(tar: any): tar is (...data: any) => any {
        return type(tar) === 'function'
    },
    undef(tar: any): tar is undefined {
        return type(tar) === 'undefined'
    },
    def(tar: any) {
        return !is.undef(tar)
    },
    null(tar: any): tar is null {
        return type(tar) === 'null'
    },
    empty(tar: any): boolean {
        const t = type(tar)
        switch (t) {
            case 'object':
                return Object.keys(tar).length === 0
            case 'array':
                return tar.length === 0
            case 'string': 
                return !(tar.trim())
            case 'undefined':
            case 'null':
            case 'NaN':
            case 'boolean':
                return true
            default:
                return false
        }
    },
    Nil(tar: any): tar is (null | undefined) {
        return ['null', 'undefined'].includes(type(tar))
    },
    NaN(tar: any): boolean {
        return type(tar) === 'NaN'
    },
    promise(tar: any): tar is Promise<any> {
        return !!tar && (is.obj(tar) || is.fn(tar)) && is.fn(tar['then'])
    }
}
