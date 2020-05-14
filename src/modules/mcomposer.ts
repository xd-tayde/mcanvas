import { 
    extend, 
    throwError,
    getImage, 
    getSize, 
    is, 
    throwWarn, 
    isIos8,
    TGetSizeImage, 
    deepCopy,
    forin,
    transValue,
} from '../utils'

export class MComposer {
    private ops: Required<TComposer.options>
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    // 绘制函数队列；
    private queue: TComposer.queue = []
    // 回调函数池；
    private fn = {
        // 最后执行的函数；
        success(){},
        // 错误回调；
        error(err){},
    }
    private data: TComposer.data = {
        // 文字id；
        textId: 0,
        // 文字绘制数据；
        text : {},
        // 背景图数据;
        bgConfig: null,
    }
    constructor(options: TComposer.options = {}) {
        // 配置canvas初始大小；
        // width：画布宽度，Number,选填，默认为 500;
        // height: 画布高度，Number，选填，默认与宽度一致；
        this.ops = extend({
            width: 500,
            height: 500,
            backgroundColor : '',
        }, options)

        this._init()
    }

    private _init() {
        const { width, height, backgroundColor } = this.ops
        this.canvas = document.createElement('canvas')
        this.canvas.width = width
        this.canvas.height = height
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

        backgroundColor && this._setBgColor(backgroundColor)
    }

    // --------------------------------------------------------
    // 绘制背景部分；
    // --------------------------------------------------------
    public background(image?, bg: TComposer.backgroundOptions = { type : 'origin' }){
        if(!image && !this.data.bgConfig) {
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
            if(bg.color) this._setBgColor(bg.color)
            getImage(bg.image, img => this._background(img, bg), this.fn.error)
        })
        return this
    }
    
    // 设置画布颜色;
    private _setBgColor(color: string) {
        this.ctx.fillStyle = color
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
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
            } else if (left === '100%'){
                rv = Math.abs(iw - cw / cropScale)
            } else if (left === '0%'){
                rv = 0
            }
        } else if (is.num(left)){
            rv = left
        } else {
            rv = 0
        }
        return rv
    }
    
    private _background(img: HTMLImageElement, bg: TComposer.backgroundOptions) {
        let { iw, ih } = getSize(img)
        // 图片与canvas的长宽比；
        let iRatio = iw / ih
        let cRatio = this.canvas.width / this.canvas.height
        // 背景绘制参数；
        let sx, sy, swidth, sheight, dx, dy, dwidth, dheight
        let cropScale
        switch (bg.type) {
            // 裁剪模式，固定canvas大小，原图铺满，超出的部分裁剪；
            case 'crop':
                if(iRatio > cRatio){
                    swidth = ih * cRatio
                    sheight = ih
                    cropScale = this.canvas.height / ih
                }else{
                    swidth = iw
                    sheight = swidth / cRatio
                    cropScale = this.canvas.width / iw
                }
    
                sx = this._getBgAlign(bg.left, iw, this.canvas.width, cropScale)
                sy = this._getBgAlign(bg.top, ih, this.canvas.height, cropScale)
    
                dy = dx = 0
                dheight = this.canvas.height
                dwidth = this.canvas.width
                break
            // 包含模式，固定canvas大小，包含背景图；
            case 'contain':
                sy = sx = 0
                swidth = iw
                sheight = ih
                if(iRatio > cRatio){
                    dwidth = this.canvas.width
                    dheight = dwidth / iRatio
                    dx = bg.left || 0
                    dy = (bg.top || bg.top === 0) ? bg.top : (this.canvas.height - dheight) / 2
                }else{
                    dheight = this.canvas.height
                    dwidth = dheight * iRatio
                    dy = bg.top || 0
                    dx = (bg.left || bg.left === 0) ? bg.left : (this.canvas.width - dwidth) / 2
                }
                break
            // 原图模式：canvas与原图大小一致，忽略初始化 传入的宽高参数；
            // 同时，background 传入的 left/top 均被忽略；
            case 'origin':
                this.canvas.width = iw
                this.canvas.height = ih
                sx = sy = 0
                swidth = iw
                sheight = ih
                dx = dy = 0
                dwidth = this.canvas.width
                dheight = this.canvas.height
                break
            default:
                console.error('mcanvas error:background type error!')
                return
        }
        this.ctx.drawImage(img, sx, sy, swidth, sheight, dx, dy, dwidth, dheight)
        this._next()
    }

    // --------------------------------------------------------
    // 绘制图层部分；
    // --------------------------------------------------------

    // 绘制矩形层；
    public rect(ops: TComposer.rectOptions){
        this.queue.push(() => {
            let { fillColor = '#fff', strokeColor = fillColor, strokeWidth = 0 } = ops
            let cw = this.canvas.width, ch = this.canvas.height
            let width = transValue(cw, 0, ops.width || 0, 'pos') - 2 * strokeWidth,
                height = transValue(ch, 0, ops.height || 0, 'pos') - 2 * strokeWidth
            let x = transValue(cw, width, ops.x || 0, 'pos') + strokeWidth / 2,
                y = transValue(ch, height, ops.y || 0, 'pos') + strokeWidth / 2
            this.ctx.lineWidth = strokeWidth
            this.ctx.fillStyle = fillColor
            this.ctx.strokeStyle = strokeColor

            this.ctx.beginPath()
            this.ctx.strokeRect(x, y, width, height)
            this.ctx.fillRect(x, y, width, height)
            this.ctx.closePath()

            this._resetCtx()._next()
        })
        return this
    }

    // 绘制圆形层；
    public circle(ops: TComposer.circleOptions){
        this.queue.push(() => {
            let { fillColor = '#fff', strokeColor = fillColor, strokeWidth = 0 } = ops
            let cw = this.canvas.width, ch = this.canvas.height
            let r = transValue(cw, 0, ops.r || 0, 'pos') - 2 * strokeWidth
            let x = transValue(cw, 2 * r, ops.x || 0, 'pos') + strokeWidth / 2 + r,
                y = transValue(ch, 2 * r, ops.y || 0, 'pos') + strokeWidth / 2 + r

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
    private _resetCtx(){
        this.ctx.setTransform(1, 0, 0, 1, 0, 0)
        return this
    }

    // 绘制水印；基于 add 函数封装；
    public watermark(
        image: TCommon.image, 
        ops: TComposer.watermarkOptions,
    ){
        if(!image){
            throwError('there is not image of watermark.')
            return this
        }

        // 参数默认值；
        const { width = '40%', pos = 'rightbottom', margin = 20 } = ops
        const position: Required<TComposer.position> = {
            x:0,
            y:0,
            scale:1,
            rotate:0,
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
            width:'100%',
            crop:{
                x:0,
                y:0,
                width:'100%',
                height:'100%',
            },
            pos:{
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0,
            },
        }

        const images = is.arr(image) ? image : [{ image, options }]

        images.map(v =>{
            // 将封装好的 add函数 推入队列中待执行；
            // 参数经过 _handleOps 加工；
            this.queue.push(() => {
                getImage(v.image, img => {
                    this._add(
                        img, 
                        this._handleOps(img, extend(true, def, v.options))
                    )
                }, this.fn.error)
            })
        })
        return this
    }

    private _add(img, ops: Required<TComposer.addOptions>){
        const crop = ops.crop as {
            x: number,
            y: number,
            width: number,
            height: number,
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
        // let ratio = iw / ih;
        // 画布canvas参数；
        let cdx, cdy, cdw, cdh
        // 素材canvas参数；
        let { x: lsx, y: lsy, width: lsw, height: lsh } = crop

        const cratio = lsw / lsh
        let ldx, ldy, ldw, ldh
        // 素材canvas的绘制;
        let lcvs = document.createElement('canvas')
        let lctx = lcvs.getContext('2d') as CanvasRenderingContext2D
        // 图片宽高比 * 1.4 是一个最安全的宽度，旋转任意角度都不会被裁剪；
        // 没有旋转却长宽比很高大的图，会导致放大倍数太大，因此设置最高倍数为5；
        // _ratio 为 较大边 / 较小边 的比例；
        const _ratio = iw > ih ? iw / ih : ih / iw
        const lctxScale = _ratio * 1.4 > 5 ? 5 : _ratio * 1.4
        let spaceX, spaceY

        lcvs.width =  Math.round(lsw * lctxScale)
        lcvs.height = Math.round(lsh * lctxScale)

        // 限制canvas的大小，ios8以下为 2096, 其余平台均限制为 4096;
        const limitLength = isIos8() && (lcvs.width > 2096 || lcvs.height > 2096) ? 2096 : 4096
        const shrink = cratio > 1 ? limitLength / lcvs.width : limitLength / lcvs.height

        // 从素材canvas的中心点开始绘制；
        ldx = - Math.round(lsw / 2)
        ldy = - Math.round(lsh / 2)
        ldw = lsw
        ldh = Math.round(lsw / cratio)

        // 获取素材最终的宽高;
        if(shrink){
            [lcvs.width, lcvs.height, ldx, ldy, ldw, ldh] = [lcvs.width, lcvs.height, ldx, ldy, ldw, ldh].map(v => Math.round(v * shrink))
        }

        lctx.translate(lcvs.width / 2, lcvs.height / 2)
        lctx.rotate(pos.rotate)

        lctx.drawImage(img, lsx, lsy, lsw, lsh, ldx, ldy, ldw, ldh)

        cdw = Math.round(width * lctxScale)
        cdh = Math.round(cdw / cratio)

        spaceX = (lctxScale - 1) * width / 2
        spaceY = spaceX / cratio

        // 获取素材的位置；
        //    配置的位置 - 缩放的影响 - 绘制成正方形的影响；
        cdx = Math.round(pos.x + cdw * ( 1 - pos.scale ) / 2 - spaceX)
        cdy = Math.round(pos.y + cdh * ( 1 - pos.scale ) / 2 - spaceY)

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
    private _handleOps(img: TGetSizeImage, ops: Required<TComposer.addOptions>){
        const cw = this.canvas.width,
            ch = this.canvas.height
        const { iw, ih } = getSize(img)

        // 图片宽高比；
        const ratio = iw / ih

        // 根据参数计算后的绘制宽度；
        const width =  transValue(cw, iw, ops.width, 'pos')

        // 裁剪的最大宽高；
        let maxLsw, maxLsh

        // 裁剪参数；
        const cropw = transValue(cw, iw, ops.crop.width!, 'crop')
        const croph = transValue(ch, ih, ops.crop.height!, 'crop')
        const crop = {
            width: cropw,
            height: croph,
            x: transValue(iw, cropw, ops.crop.x!, 'crop'),
            y: transValue(ih, croph, ops.crop.y!, 'crop')
        }

        // 最大值判定；
        if (crop.x > iw) crop.x = iw
        if (crop.y > ih) crop.y = ih
        maxLsw = iw - crop.x
        maxLsh = ih - crop.y
        if(crop.width > maxLsw)crop.width = maxLsw
        if(crop.height > maxLsh)crop.height = maxLsh

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
    public text(context: string = '', ops: TComposer.textOptions){
        // 默认字体；
        const fontFamily = `helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif`
        // 默认的字体大小;
        const size = this.canvas.width / 20

        this.queue.push(()=>{
            const defaultStyle = {
                color:'#000',
                type : 'fill',   // stroke | fill,
                lineWidth : 1,
                shadow:{
                    color: null,
                    blur: 0,
                    offsetX: 0,
                    offsetY: 0,
                },
            }
            const option = extend(true, {
                width: 300,
                align: 'left',
                smallStyle: {
                    font : `${size * 0.8}px ${fontFamily}`,
                    lineHeight:size * 0.9,
                    ...deepCopy(defaultStyle),
                },
                normalStyle:{
                    font : `${size}px ${fontFamily}`,
                    lineHeight:size * 1.1,
                    type : 'fill',   // strokeText or fillText,
                    ...deepCopy(defaultStyle),
                },
                largeStyle:{
                    font : `${size * 1.3}px ${fontFamily}`,
                    lineHeight:size * 1.4,
                    ...deepCopy(defaultStyle),
                },
                pos:{
                    x:0,
                    y:0,
                    rotate: 0,
                },
            }, ops) as Required<TComposer.textOptions>

            // 解析字符串模板后，调用字体绘制函数；
            const parseContext = this._parse(context)
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
    private _parse(context: string){
        const arr = context.split(/<s>|<b>/)
        const result: {
            type: 'small' | 'normal' | 'large',
            text: string,
            // 用于字体的大小比较；
            size: 0 | 1 | 2,
        }[] = []
        for(let i = 0;i < arr.length;i++){
            const value = arr[i]
            if(/<\/s>|<\/b>/.test(value)){
                const splitTag = /<\/s>/.test(value) ? '</s>' : '</b>',
                    type = /<\/s>/.test(value) ? 'small' : 'large', 
                    tmp = arr[i].split(splitTag)
                result.push({
                    type,
                    text:tmp[0],
                    // 用于字体的大小比较；
                    size: type === 'small' ? 0 : 2,
                })
                tmp[1] && result.push({
                    type:'normal',
                    text:tmp[1],
                    size: 1,
                })
                continue
            }
            arr[i] && result.push({
                text:arr[i],
                type:'normal',
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
    ){
        
        this.data.textId++
        this.data.text[this.data.textId] = {}
        
        // 处理宽度参数；
        option.width = transValue(this.canvas.width, 0, option.width, 'pos') as number
        const opsWidth = option.width 
        
        let style, line = 1, length = 0,
            lineHeight = getLineHeight(textArr, option),
            x = transValue(this.canvas.width, opsWidth, 0, 'pos'),
            y = (transValue(this.canvas.height, 0, 0, 'pos')) + lineHeight

        // data:字体数据；
        // lineWidth:行宽；
        this.data.text[this.data.textId][line] = {
            data:[],
            lineWidth:0,
        }

        // 生成字体数据；
        textArr.map(v =>{
            style = option[`${v.type}Style`]
            this.ctx.font = style.font
            let width = this.ctx.measureText(v.text).width

            // 处理 <br> 换行，先替换成 '|',便于单字绘图时进行判断；
            const context = v.text.replace(/<br>/g, '|')

            // 先进行多字超出判断，超出宽度后再进行单字超出判断；
            if((length + width) > opsWidth || context.indexOf('|') !== -1){
                for (let i = 0, fontLength = context.length; i < fontLength; i++) {
                    let font = context[i]
                    width = this.ctx.measureText(font).width

                    // 当字体的计算宽度 > 设置的宽度 || 内容中包含换行时,进入换行逻辑；
                    if((length + width) > opsWidth || font === '|'){
                        length = 0
                        x = transValue(this.canvas.width, opsWidth, 0, 'pos')
                        y += lineHeight
                        line += 1
                        this.data.text[this.data.textId][line] = {
                            data:[],
                            lineWidth:0,
                        }
                        if(font === '|')continue
                    }
                    this.data.text[this.data.textId][line]['data'].push({
                        context:font, x, y, style, width,
                    })
                    length += width
                    x += width
                    this.data.text[this.data.textId][line]['lineWidth'] = length
                }
            } else {
                this.data.text[this.data.textId][line]['data'].push({
                    context, x, y, style, width,
                })
                length += width
                x += width
                this.data.text[this.data.textId][line]['lineWidth'] = length
            }
        })

        // 创建文字画布；
        const tcvs = document.createElement('canvas')
        const tctx = tcvs.getContext('2d')
        const tdx = transValue(this.canvas.width, opsWidth, option.pos.x as number, 'pos'),
            tdy = transValue(this.canvas.height, 0, option.pos.y as number, 'pos')
        let tdw, tdh
        tdw = tcvs.width = opsWidth
        tdh = tcvs.height = this._getTextRectHeight(line)

        // 通过字体数据进行文字的绘制；
        forin(this.data.text[this.data.textId], (k, v)=>{
            // 增加 align 的功能；
            let add = 0
            if(v.lineWidth < opsWidth){
                if(option.align === 'center'){
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

        // tcvs.style.width = '300px';
        // document.querySelector('body').appendChild(tcvs);

        // 绘制文字画布；
        const originX = tdx + tdw / 2,
            originY = tdy + tdh / 2
        this.ctx.translate(originX, originY)
        this.ctx.rotate(this._getRotate(option.pos.rotate))
        this.ctx.drawImage(tcvs, -tdw / 2, -tdh / 2, tdw, tdh)

        // 获取行高；
        function getLineHeight(textArr, option) {
            let lh = 0, vlh
            textArr.map( v =>{
                vlh = option[`${v.type}Style`].lineHeight
                if(vlh > lh)lh = vlh
            })
            return lh
        }
    }

    private _fillText(ctx, text){
        let { context, x, y, style } = text
        let { align, lineWidth, shadow } = style
        let { color, blur, offsetX, offsetY } = shadow
        ctx.font = style.font
        ctx.textAlign = align
        ctx.textBaseline = 'alphabetic'
        ctx.lineWidth = lineWidth
        ctx.shadowColor = color
        ctx.shadowBlur = blur
        ctx.shadowOffsetX = offsetX
        ctx.shadowOffsetY = offsetY

        if(style.gradient){
            let { type, colorStop } = style.gradient
            let x1, y1, x2, y2
            if(type === 1){
                x1 = x; y1 = y
                x2 = x + text.width; y2 = y
            }else{
                x1 = x; y1 = y - style.lineHeight
                x2 = x; y2 = y
            }
            let grad  = ctx.createLinearGradient(x1, y1, x2, y2)
            let colorNum = colorStop.length || 0
            forin(colorStop, (i, v)=>{
                grad.addColorStop(1 / colorNum * (+i + 1), v)
            })
            ctx[`${style.type}Style`] = grad
        }else{
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
    public draw(ops: TCommon.drawOptions | ((b64: string) => void)){
        return new Promise((resolve, reject) => {
            let _ops = {
                type: 'jpeg',
                quality: .9,
                success(b64){},
                error(err){},
            }, b64
    
            if(is.fn(ops)){
                _ops.success = ops
            }else{
                _ops = extend(_ops, ops)
                if(_ops.type === 'jpg') _ops.type = 'jpeg'
            }
            this.fn.error = (err) => {
                _ops.error(err)
                reject(err)
            }
            this.fn.success = () => {
                setTimeout(()=>{
                    b64 = this.canvas.toDataURL(`image/${_ops.type}`, _ops.quality)
                    _ops.success(b64)
                    resolve(b64)
                }, 0)
            }
            this._next()
        })
    }

    private _next(){
        if(this.queue.length > 0){
            this.ctx.save()
            const next = this.queue.shift()
            next && next()
            this.ctx.restore()
        }else{
            this.fn.success()
        }
    }

    public clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        return this
    }
}