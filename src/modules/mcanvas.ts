import { 
    include,
    extend, 
    throwError,
    getSize, 
    is, 
    throwWarn, 
    belowIOS8,
    TGetSizeImage, 
    forin,
    transValue,
    getLength,
} from '@Src/utils'
import { Canvas } from '@Src/canvas'
import { crop as cropFn } from '@Src/utils/crop'

export class MCanvas {
    private ops: Required<TComposer.options>
    private cvs: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    // 绘制函数队列；
    private queue: TComposer.queue = []
    // 回调函数池；
    private fn = {
        // 最后执行的函数；
        success() {},
        // 错误回调；
        error(err) {},
    }
    private data: TComposer.data = {
        // 文字id；
        textId: 0,
        // 文字绘制数据；
        text : {},
        // 背景图数据;
        bgConfig: null,
    }
    constructor(options: TComposer.options = { }) {
        // 配置canvas初始大小；
        // width：画布宽度，Number,选填，默认为 500;
        // height: 画布高度，Number，选填，默认与宽度一致；
        this.ops = extend({
            width: 500,
            height: 500,
            backgroundColor: '',
        }, options)

        this._init()
    }

    private _init() {
        const { width, height, backgroundColor } = this.ops;
        [this.cvs, this.ctx] = Canvas.create(width, height)
        backgroundColor && this._setBgColor(backgroundColor)
    }

    // --------------------------------------------------------
    // 绘制背景部分；
    // --------------------------------------------------------
    public background(image?: TCommon.image, bg: TComposer.backgroundOptions = { type : 'origin' }) {
        if (!image && !this.data.bgConfig) {
            throwError('the init background must has a image.')
            return this
        }
    
        // 缓存bg options， 用于重置；
        if (image) {
            bg.image = image
            this.data.bgConfig = bg
        } else if (this.data.bgConfig) {
            bg = this.data.bgConfig
        }
    
        this.queue.push(() => {
            if (bg.color) this._setBgColor(bg.color)
            Canvas.getImage(bg.image)
                .then(img => this._background(img, bg))
                .catch(this.fn.error)
        })
        return this
    }
    
    // 设置画布颜色;
    private _setBgColor(color: string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.cvs.width, this.cvs.height)
    }

    private _getBgAlign(
        left: TComposer.backgroundOptions['left'], 
        iw: number, 
        cw: number, 
        cropScale: number
    ) {
        let rv
        if (is.str(left)) {
            if (left === '50%' || left === 'center') {
                rv = Math.abs((iw - cw / cropScale) / 2)
            } else if (left === '100%') {
                rv = Math.abs(iw - cw / cropScale)
            } else if (left === '0%') {
                rv = 0
            }
        } else if (is.num(left)) {
            rv = left
        } else {
            rv = 0
        }
        return rv
    }
    
    private _background(img: HTMLImageElement, bg: TComposer.backgroundOptions) {
        const { iw, ih } = getSize(img)
        // 图片与canvas的长宽比；
        const iRatio = iw / ih
        const cRatio = this.cvs.width / this.cvs.height
        // 背景绘制参数；
        let sx, sy, swidth, sheight, dx, dy, dwidth, dheight
        let cropScale
        switch (bg.type) {
            case 'crop':
                // 裁剪模式，固定canvas大小，原图铺满，超出的部分裁剪；
                if (iRatio > cRatio) {
                    swidth = ih * cRatio
                    sheight = ih
                    cropScale = this.cvs.height / ih
                } else {
                    swidth = iw
                    sheight = swidth / cRatio
                    cropScale = this.cvs.width / iw
                }
    
                sx = this._getBgAlign(bg.left, iw, this.cvs.width, cropScale)
                sy = this._getBgAlign(bg.top, ih, this.cvs.height, cropScale)
    
                dy = dx = 0
                dheight = this.cvs.height
                dwidth = this.cvs.width
                break
            case 'contain':
                // 包含模式，固定canvas大小，包含背景图；
                sy = sx = 0
                swidth = iw
                sheight = ih
                if (iRatio > cRatio) {
                    dwidth = this.cvs.width
                    dheight = dwidth / iRatio
                    dx = bg.left || 0
                    dy = (bg.top || bg.top === 0) ? bg.top : (this.cvs.height - dheight) / 2
                } else {
                    dheight = this.cvs.height
                    dwidth = dheight * iRatio
                    dy = bg.top || 0
                    dx = (bg.left || bg.left === 0) ? bg.left : (this.cvs.width - dwidth) / 2
                }
                break
            case 'origin':
                // 原图模式：canvas与原图大小一致，忽略初始化 传入的宽高参数；
                // 同时，background 传入的 left/top 均被忽略；
                this.cvs.width = iw
                this.cvs.height = ih
                sx = sy = 0
                swidth = iw
                sheight = ih
                dx = dy = 0
                dwidth = this.cvs.width
                dheight = this.cvs.height
                break
            default:
                throwError('background type error!')
                return
        }
        this.ctx.drawImage(img, sx, sy, swidth, sheight, dx, dy, dwidth, dheight)
        this._next()
    }

    // --------------------------------------------------------
    // 绘制图层部分；
    // --------------------------------------------------------

    // 绘制矩形层；
    public rect(ops: TComposer.rectOptions = {}) {
        this.queue.push(() => {
            const { width: cw, height: ch } = this.cvs
            const { 
                fillColor = '#fff', 
                strokeColor = fillColor, 
                strokeWidth = 0,
                radius = 0,
            } = ops
            let { width = 100, height = 100, x = 0, y = 0 } = ops
            width = transValue(cw, 0, width, 'pos') - 2 * strokeWidth,
            height = transValue(ch, 0, height, 'pos') - 2 * strokeWidth

            // 计算尾值时，与边框的关系则为相反
            x = transValue(cw, width, x, 'pos') + (include(x, 'right') ? -strokeWidth : strokeWidth)
            y = transValue(ch, height, y, 'pos') + (include(y, 'bottom') ? -strokeWidth : strokeWidth)

            Canvas.drawRoundRect(
                this.ctx, 
                x, y, 
                width, height, 
                radius, 
                fillColor,
                strokeWidth,
                strokeColor,
            )

            this._resetCtx()._next()
        })
        return this
    }

    // 绘制圆形层；
    public circle(ops: TComposer.circleOptions = {}) {
        this.queue.push(() => {
            const { fillColor = '#fff', strokeColor = fillColor, strokeWidth = 0 } = ops
            const { width: cw, height: ch } = this.cvs
            let { x = 0, y = 0, radius = 100 } = ops
            const r = transValue(cw, 0, radius, 'pos') - 2 * strokeWidth
            x = transValue(cw, 2 * r, x, 'pos') + r + (include(x, 'right') ? -strokeWidth : strokeWidth)
            y = transValue(ch, 2 * r, y, 'pos') + r + (include(y, 'bottom') ? -strokeWidth : strokeWidth)

            this.ctx.beginPath()
            this.ctx.arc(x, y, r, 0, Math.PI * 2, false)
            this.ctx.fillStyle = fillColor
            this.ctx.fill()
            this.ctx.strokeStyle = strokeColor
            this.ctx.lineWidth = strokeWidth
            this.ctx.stroke()
            this.ctx.closePath()

            this._resetCtx()._next()
        })
        return this
    }

    // 重置ctx属性;
    private _resetCtx() {
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        return this
    }

    // 绘制水印；基于 add 函数封装；
    public watermark(
        image: TCommon.image, 
        ops: TComposer.watermarkOptions = {},
    ) {
        if (!image) {
            throwError('there is not image of watermark.')
            return this
        }

        // 参数默认值；
        const { width = '40%', pos = 'rightbottom', margin = 20 } = ops
        const position: Required<TComposer.position> = {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
        }
        switch (pos) {
            case 'leftTop':
                position.x = `left:${margin}`
                position.y = `top:${margin}`
                break
            case 'leftBottom':
                position.x = `left:${margin}`
                position.y = `bottom:${margin}`
                break
            case 'rightTop':
                position.x = `right:${margin}`
                position.y = `top:${margin}`
                break
            case 'rightBottom':
                position.x = `right:${margin}`
                position.y = `bottom:${margin}`
                break
            default:
        }
        this.add(image, {
            width,
            pos: position,
        })
        return this
    }
    // 通用绘制图层函数；
    // 使用方式：
    // 多张图: add([{image:'',options:{}},{image:'',options:{}}]);
    // 单张图: add(image,options);
    public add(
        image: TComposer.addData[] | TCommon.image, 
        options?: TComposer.addOptions
    ) {
        // 默认参数；
        const def = {
            width: '100%',
            crop: {
                x: 0,
                y: 0,
                width: '100%',
                height: '100%',
                radius: 0,
            },
            pos: {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
            },
        }

        const images = is.arr(image) ? image : [{ image, options }]
        images.map(({ image, options }) => {
            // 将封装好的 add函数 推入队列中待执行；
            // 参数经过 _handleOps 加工；
            this.queue.push(() => {
                Canvas.getImage(image).then(img => {
                    this._add(
                        img, 
                        this._handleOps(img, extend(true, def, options))
                    )
                }).catch(this.fn.error)
            })
        })
        return this
    }

    private _add(img, ops: Required<TComposer.addOptions>) {
        const crop = ops.crop as {
            x: number,
            y: number,
            width: number,
            height: number,
            radius: number,
        }
        const pos = ops.pos as {
            x: number,
            y: number,
            scale: number,
            rotate: number,
        }
        const width = ops.width as number

        if (width === 0) throwWarn(`the width of mc-element is zero`)

        const { iw, ih } = getSize(img)
        // 画布canvas参数；
        let cdx, cdy, cdw, cdh
        // 素材canvas参数；
        const { width: lsw, height: lsh, radius } = crop

        // 图片需要裁剪
        if (lsw !== iw || lsh !== ih || radius > 0) {
            // 此时 img 已加载，且直接导出 canvas
            // 因此 success 为同步代码
            img = cropFn(img, crop).cvs
        }

        const cratio = lsw / lsh
        let ldx, ldy, ldw, ldh

        // 由于 canvas 的特性，旋转只是 ctx 的旋转，并不是 canvas,
        // 因此如果 canvas 与 ctx 完全相等时，旋转就会出现被裁剪的问题
        // 这里通过将 canvas 放大的方式来解决该问题；

        // 图片宽高比 * 1.4 是一个最安全的宽度，旋转任意角度都不会被裁剪；
        // 没有旋转却长宽比很高大的图，会导致放大倍数太大，因此设置最高倍数为5；
        // _ratio 为 较大边 / 较小边 的比例；
        const _ratio = iw > ih ? iw / ih : ih / iw
        const lctxScale = _ratio * 1.4 > 5 ? 5 : _ratio * 1.4
        let spaceX, spaceY

        // 素材canvas的绘制;
        const [lcvs, lctx] = Canvas.create(
            Math.round(lsw * lctxScale), 
            Math.round(lsh * lctxScale)
        )

        // 限制canvas的大小，ios8以下为 2096, 其余平台均限制为 4096;
        const limitLength = belowIOS8() && (lcvs.width > 2096 || lcvs.height > 2096) ? 2096 : 4096
        const shrink = cratio > 1 ? limitLength / lcvs.width : limitLength / lcvs.height

        // 从素材canvas的中心点开始绘制；
        ldx = - Math.round(lsw / 2)
        ldy = - Math.round(lsh / 2)
        ldw = lsw
        ldh = Math.round(lsw / cratio)

        // 当素材缩放后超出限制时，缩放为限制值，避免绘制失败；
        // 获取素材最终的宽高;
        if ((lcvs.width > limitLength || lcvs.height > limitLength) && shrink) {
            [lcvs.width, lcvs.height, ldx, ldy, ldw, ldh] = [lcvs.width, lcvs.height, ldx, ldy, ldw, ldh].map(v => Math.round(v * shrink))
        }

        lctx.translate(lcvs.width / 2, lcvs.height / 2)
        lctx.rotate(pos.rotate)

        lctx.drawImage(img, ldx, ldy, ldw, ldh)

        cdw = Math.round(width * lctxScale)
        cdh = Math.round(cdw / cratio)

        spaceX = (lctxScale - 1) * width / 2
        spaceY = spaceX / cratio

        // 获取素材的位置；
        //    配置的位置 - 缩放的影响 - 绘制成正方形的影响；
        cdx = Math.round(pos.x + cdw * (1 - pos.scale) / 2 - spaceX)
        cdy = Math.round(pos.y + cdh * (1 - pos.scale) / 2 - spaceY)

        cdw *= pos.scale
        cdh *= pos.scale

        this.ctx.drawImage(lcvs, cdx, cdy, cdw, cdh)
        this._next()
    }

    private _getRotate(r?: string | number) {
        if (is.str(r)) {
            return parseFloat(r) * Math.PI / 180
        } else if (is.num(r)) {
            return r * Math.PI / 180
        } else {
            return 0
        }
    }

    // 参数加工函数；
    private _handleOps(img: TGetSizeImage, ops: Required<TComposer.addOptions>) {
        const { width: cw, height: ch } = this.cvs
        const { iw, ih } = getSize(img)

        // 图片宽高比；
        const ratio = iw / ih

        // 根据参数计算后的绘制宽度；
        const width = transValue(cw, iw, ops.width, 'pos')

        // 裁剪参数；
        const cropw = transValue(cw, iw, ops.crop.width!, 'crop')
        const croph = transValue(ch, ih, ops.crop.height!, 'crop')
        const crop = {
            width: cropw,
            height: croph,
            x: transValue(iw, cropw, ops.crop.x!, 'crop'),
            y: transValue(ih, croph, ops.crop.y!, 'crop'),
            radius: getLength(cropw, ops.crop.radius!),
        }

        // 裁剪的最大宽高；
        let maxLsw, maxLsh
        // 最大值判定；
        if (crop.x > iw) crop.x = iw
        if (crop.y > ih) crop.y = ih
        maxLsw = iw - crop.x
        maxLsh = ih - crop.y
        if (crop.width > maxLsw) crop.width = maxLsw
        if (crop.height > maxLsh) crop.height = maxLsh

        // 位置参数；
        const { x: px, y: py, rotate: pr, scale: ps = 1 } = ops.pos
        const pos = {
            x: transValue(cw, width, px!, 'pos'),
            y: transValue(ch, width / ratio, py!, 'pos'),
            scale: ps,
            rotate: this._getRotate(pr),
        }
        return { width, crop, pos }
    }

    // --------------------------------------------------------
    // 绘制文字部分；
    // --------------------------------------------------------
    private _defaultFontFamily = 'helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif'
    private _createStyle(fontSize: number, lineHeight: number) {
        return {
            font: `${fontSize}px ${this._defaultFontFamily}`,
            lineHeight,
            color: '#000',
            type : 'fill',
            lineWidth : 1,
            shadow: {
                color: null,
                blur: 0,
                offsetX: 0,
                offsetY: 0,
            },
        }
    }
    public text(context: string, ops: TComposer.textOptions = {}) {
        // 默认的字体大小;
        const dfs = this.cvs.width / 20

        this.queue.push(() => {
            const option = extend(true, {
                width: 300,
                align: 'left',
                smallStyle: this._createStyle(dfs * 0.8, dfs * 0.9),
                normalStyle: this._createStyle(dfs, dfs * 1.1),
                largeStyle: this._createStyle(dfs * 1.3, dfs * 1.4),
                pos: {
                    x: 0,
                    y: 0,
                    rotate: 0,
                },
            }, ops) as Required<TComposer.textOptions>

            // 解析字符串模板后，调用字体绘制函数；
            const parseContext = this._parse(String(context))
            let max = 0, maxFont
            parseContext.map(v => {
                if (v.size > max) {
                    max = v.size
                    maxFont = v.type
                }
            })
            // 当设置的宽度小于字体宽度时，强行将设置宽度设为与字体一致；
            const maxFontSize = parseInt(option[`${maxFont}Style`].font)
            if (maxFontSize && option.width < maxFontSize) option.width = maxFontSize

            this._text(parseContext, option)
            this._resetCtx()._next()
        })
        return this
    }
    // 字符串模板解析函数
    // 解析 <s></s> <b></b>
    private _parse(context: string) {
        const arr = context.split(/<s>|<b>/)
        const result: {
            type: 'small' | 'normal' | 'large',
            text: string,
            // 用于字体的大小比较；
            size: 0 | 1 | 2,
        }[] = []
        for (let i = 0; i < arr.length; i++) {
            const value = arr[i]
            if (/<\/s>|<\/b>/.test(value)) {
                const splitTag = /<\/s>/.test(value) ? '</s>' : '</b>',
                    type = /<\/s>/.test(value) ? 'small' : 'large', 
                    tmp = arr[i].split(splitTag)
                result.push({
                    type,
                    text: tmp[0],
                    // 用于字体的大小比较；
                    size: type === 'small' ? 0 : 2,
                })
                tmp[1] && result.push({
                    type: 'normal',
                    text: tmp[1],
                    size: 1,
                })
                continue
            }
            arr[i] && result.push({
                text: arr[i],
                type: 'normal',
                size: 1,
            })
        }
        return result
    }

    private _text(
        textArr: {
            type: "small" | "normal" | "large";
            text: string;
            size: 0 | 1 | 2;
        }[], 
        option: Required<TComposer.textOptions>
    ) {
        this.data.textId++
        this.data.text[this.data.textId] = {}
        
        // 处理宽度参数；
        const opsWidth = option.width = transValue(this.cvs.width, 0, option.width, 'pos')
        
        let style, 
            line = 1, 
            lineWidth = 0,
            lineHeight = this._getLineHeight(textArr, option),
            x = transValue(this.cvs.width, opsWidth, 0, 'pos'),
            y = (transValue(this.cvs.height, 0, 0, 'pos')) + lineHeight

        // data:字体数据；
        // lineWidth:行宽；
        this.data.text[this.data.textId][line] = {
            data: [],
            lineWidth: 0,
        }

        // 生成字体数据；
        textArr.map(v => {
            style = option[`${v.type}Style`]
            this.ctx.font = style.font

            // 先获取整个字体块的宽度
            // 用于判断是否会再当前字体块产生换行
            let width = this.ctx.measureText(v.text).width

            // 处理 <br> 换行，先替换成 '|',便于单字绘图时进行判断；
            const context = v.text.replace(/<br>/g, '|')

            // 先进行字体块超出判断，超出宽度 或 包含换行符 时采用单字绘制；
            if ((lineWidth + width) > opsWidth || include(context, '|')) {
                for (let i = 0, fontLength = context.length; i < fontLength; i++) {
                    const _context = context[i]
                    width = this.ctx.measureText(_context).width

                    // 当字体的计算宽度 > 设置的宽度 || 内容中包含换行时,进入换行逻辑；
                    if ((lineWidth + width) > opsWidth || _context === '|') {
                        x = lineWidth = 0
                        y += lineHeight
                        line += 1
                        this.data.text[this.data.textId][line] = {
                            data: [],
                            lineWidth: 0,
                        }
                        // 不绘制换行符
                        if (_context === '|') continue
                    }

                    // 生成绘制数据
                    const lineData = this.data.text[this.data.textId][line]
                    lineData.data.push({ context: _context, x, y, style, width })
                    x += width
                    lineData.lineWidth = lineWidth += width
                }
            } else {
                // 当前字体块不会换行，则整块绘制；
                const lineData = this.data.text[this.data.textId][line]
                lineData.data.push({ context, x, y, style, width })
                x += width
                lineData.lineWidth = lineWidth += width
            }
        })

        // 创建文字画布；
        const [tcvs, tctx] = Canvas.create(opsWidth, this._getTextRectHeight(line))
        const tdh = tcvs.height
        const tdw = tcvs.width
        const tdx = transValue(this.cvs.width, tdw, option.pos.x!, 'pos')
        const tdy = transValue(this.cvs.height, tdh, option.pos.y!, 'pos')

        // 通过字体数据进行文字的绘制；
        forin(this.data.text[this.data.textId], (k, v) => {
            // 增加 align 的功能；
            let add = 0
            if (v.lineWidth < opsWidth) {
                if (option.align === 'center') {
                    add = (opsWidth - v.lineWidth) / 2
                }else if (option.align === 'right') {
                    add = opsWidth - v.lineWidth
                }
            }
            v.data.map(text => {
                text.x += add
                this._fillText(tctx, text)
            })
        })

        // tcvs.style.width = '300px'
        // document.body.appendChild(tcvs)

        // 绘制文字画布；
        this.ctx.translate(tdx + tdw / 2, tdy + tdh / 2)
        this.ctx.rotate(this._getRotate(option.pos.rotate))
        this.ctx.drawImage(tcvs, -tdw / 2, -tdh / 2, tdw, tdh)
    }

    private _getLineHeight(textArr, option) {
        let lh = 0, vlh
        textArr.map(v => {
            vlh = option[`${v.type}Style`].lineHeight
            if (vlh > lh) lh = vlh
        })
        return lh
    }

    private _fillText(ctx, text) {
        const { context, x, y, style } = text
        const { align, lineWidth, shadow, font, gradient, lineHeight } = style
        const { color, blur, offsetX, offsetY } = shadow
        ctx.font = font
        ctx.textAlign = align
        ctx.textBaseline = 'alphabetic'
        ctx.lineWidth = lineWidth
        ctx.shadowColor = color
        ctx.shadowBlur = blur
        ctx.shadowOffsetX = offsetX
        ctx.shadowOffsetY = offsetY

        if (gradient) {
            const { type, colorStop } = gradient
            let x1, y1, x2, y2
            if (type === 1) {
                x1 = x
                y1 = y
                x2 = x + text.width
                y2 = y
            } else {
                x1 = x
                y1 = y - lineHeight
                x2 = x 
                y2 = y
            }
            const grad  = ctx.createLinearGradient(x1, y1, x2, y2)
            const colorNum = colorStop.length || 0
            forin(colorStop, (i, v) => {
                grad.addColorStop(1 / colorNum * (+i + 1), v)
            })
            ctx[`${style.type}Style`] = grad
        }else {
            ctx[`${style.type}Style`] = style.color
        }

        ctx[`${style.type}Text`](context, x, y)
        this._resetCtx()
    }

    private _getTextRectHeight (lastLine) {
        const lastLineData = this.data.text[this.data.textId][lastLine].data[0]
        return lastLineData.y + lastLineData.style.lineHeight
    }

    // 绘制函数；
    public draw(ops: TCommon.drawOptions | ((b64: string) => void) = {}) {
        return new Promise((resolve, reject) => {
            let config = {
                type: 'jpeg',
                quality: .9,
                exportType: 'base64',
                success(b64) { },
                error(err) { },
            }
    
            if (is.fn(ops)) {
                config.success = ops
            }else {
                config = extend(true, config, ops)
                if (config.type === 'jpg') config.type = 'jpeg'
            }
            this.fn.error = (err) => {
                config.error(err)
                reject(err)
            }
            this.fn.success = () => {
                if (config.exportType === 'canvas') {
                    config.success(this.cvs)
                    resolve(this.cvs)
                } else {
                    setTimeout(() => {
                        const b64 = this.cvs.toDataURL(`image/${config.type}`, config.quality)
                        config.success(b64)
                        resolve(b64)
                    }, 0)
                }
            }
            this._next()
        })
    }

    private _next() {
        if (this.queue.length > 0) {
            this.ctx.save()
            const next = this.queue.shift()
            next && next()
            this.ctx.restore()
        }else {
            this.fn.success()
        }
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.cvs.width, this.cvs.height)
        return this
    }
}