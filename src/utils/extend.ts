function isPlainObject(object) {
    const class2type = {},
        toString = class2type.toString,
        hasOwn = class2type.hasOwnProperty,
        fnToString = hasOwn.toString,
        ObjectFunctionString = fnToString.call(Object)

    if (!object || toString.call(object) !== '[object Object]') return false

    const proto = Object.getPrototypeOf(object)
    if (!proto) return true

    const ctor = hasOwn.call(proto, 'constructor') && proto.constructor
    return typeof ctor === 'function' && fnToString.call(ctor) === ObjectFunctionString
}

export function extend(this: any, ...args) {
    let options
    let name
    let clone
    let copy
    let source
    let copyIsArray
    let target = arguments[0] || {}
    let i = 1
    let length = arguments.length
    let deep = false

    if (typeof target === 'boolean') {
        deep = target
        target = arguments[i] || {}
        i++
    }

    if (typeof target !== 'object' && typeof target !== 'function') {
        target = {}
    }

    if (i === length) {
        target = this
        i--
    }

    for (; i < length; i++) {
        if ((options = arguments[i]) !== null) {
            for (name in options) {
                if (options.hasOwnProperty(name)) {
                    source = target[name]
                    copy = options[name]

                    if (target === copy) {
                        continue
                    }

                    if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false
                            clone = source && Array.isArray(source) ? source : []
                        } else {
                            clone = source && isPlainObject(source) ? source : {}
                        }

                        target[name] = extend(deep, clone, copy)
                    } else if (copy !== undefined) {
                        target[name] = copy
                    }
                }
            }
        }
    }

    return target
}
