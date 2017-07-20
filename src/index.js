import _ from './utils';
export default class MCanvas {
    constructor(cwidth,cheight) {
        // 配置canvas初始大小；
        // cwidth：画布宽度，Number,选填，默认为 500;
        // cheight: 画布高度，Number，选填，默认与宽度一致；
        this.ops = {
            width: cwidth || 500,
            height:cheight || cwidth,
        };
        // 全局画布；
        this.canvas = null;
        this.ctx = null;

        // 绘制函数队列；
        this.queue = [];
        // 最后执行的函数；
        this.end = null;

        // 初始化创建画布；
        this._init();
    }
    _init(){
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.ops.width;
        this.canvas.height = this.ops.height;
        this.ctx = this.canvas.getContext('2d');
    }
    background(bg){
        this.queue.push(() => {
            if(bg.color){
                this.ctx.fillStyle = bg.color;
                this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
            }
            if(bg.image){
                _.getImage(bg.image, img =>{
                    this._background(img,bg);
                });
            }
        });
        return this;
    }
    _background(img,bg){
        // 图片与canvas的长宽比；
        let iRatio = img.width / img.height;
        let cRatio = this.canvas.width / this.canvas.height;
        // 背景绘制参数；
        let sx,sy,swidth,sheight,dx,dy,dwidth,dheight;
        switch (bg.type) {
            // 裁剪模式，固定canvas大小，原图铺满，超出的部分裁剪；
            case 'crop':
                sx = bg.left || 0;
                sy = bg.top || 0;
                if(iRatio > cRatio){
                    swidth = img.height * cRatio;
                    sheight = img.height;
                }else{
                    swidth = img.width;
                    sheight = swidth / cRatio;
                }
                dx = 0;
                dy = 0;
                dheight = this.canvas.height;
                dwidth = this.canvas.width;
                break;
            // 包含模式，固定canvas大小，包含背景图；
            case 'contain':
                sx = 0;
                sy = 0;
                swidth = img.width;
                sheight = img.height;
                if(iRatio > cRatio){
                    dwidth = this.canvas.width;
                    dheight = dwidth / iRatio;
                    dx = bg.left || 0;
                    dy = (bg.top || bg.top == 0) ? bg.top : (this.canvas.height - dheight)/2;
                }else{
                    dheight = this.canvas.height;
                    dwidth = dheight * iRatio;
                    dy = bg.top || 0;
                    dx = (bg.left || bg.left == 0) ? bg.left : (this.canvas.width - dwidth)/2;
                }
                break;
            // 原图模式：canvas与原图大小一致，忽略初始化 传入的宽高参数；
            // 同时，background 传入的 left/top 均被忽略；
            case 'origin':
                this.canvas.width = img.width;
                this.canvas.height = img.height;
                sx = 0;
                sy = 0;
                swidth = img.width;
                sheight = img.height;
                dx = 0;
                dy = 0;
                dwidth = this.canvas.width;
                dheight = this.canvas.height;
                break;
            default:
                console.err('background type error!');
        }
        this.ctx.drawImage(img,sx,sy,swidth,sheight,dx,dy,dwidth,dheight);
        // this.canvas.style = 'width:300px';
        // document.querySelector('body').appendChild(this.canvas);
        this.next();
    }
    add(image,options){
        if(!image){
            console.error('add image error!');
            return;
        }
        // 默认参数；
        let ops = {
            width:'100%',
            crop:{
                x:0,
                y:0,
                width:'100%',
                height:'100%',
            },
            pos:{
                x:0,
                y:0,
                scale:1,
                rotate:0,
            },
        };
        ops = _.extend(ops,options);

        // 将封装好的 add函数 推入队列中待执行；
        // 参数经过 _handleOps 加工；
        this.queue.push(() => {
            _.getImage(image, img => {
                this._add(img,this._handleOps(ops,img));
            });
        });
        return this;
    }
    _add(img,ops){
        let ratio = img.width / img.height;
        // 画布canvas参数；
        let cdx,cdy,cdw,cdh;
        // 素材canvas参数；
        let { x:lsx, y:lsy, width:lsw, height:lsh} = ops.crop;
        let ldx,ldy,ldw,ldh;
        //  素材的真实宽高，用于剔除避免裁剪所添加的空白区域；
        let rw,rh,rspaceX,rspaceY;

        // 素材canvas的绘制;
        let lcvs = document.createElement('canvas');
        let lctx = lcvs.getContext('2d');

        // 取最长边为边长，正方形,避免旋转的时候被裁剪；
        lcvs.height = lcvs.width = ratio > 1 ? img.width : img.height;

        // 从素材canvas的中心点开始绘制；
        ldx = -img.width/2;
        ldy = -img.height/2;
        ldw = img.width;
        ldh = img.height;

        lctx.translate(lcvs.width/2,lcvs.height/2);
        lctx.rotate(ops.pos.rotate);
        lctx.drawImage(img,lsx,lsy,lsw,lsh,ldx,ldy,ldw,ldh);

        // lcvs.style = 'width:300px';
        // document.querySelector('body').appendChild(lcvs);

        // 获取素材最终的宽高;
        // 由于前面的素材canvas已经绘制成正方形，所以 w = h;
        cdh = cdw = ops.width;

        // 计算绘制成正方形造成的空白区域；
        if(ratio > 1){
            rh = cdw / ratio;
            rw = 0;
            rspaceX = 0;
            rspaceY = (cdh-rh)/2;
        }else{
            rw = cdh * ratio;
            rh = 0;
            rspaceX = (cdw - rw)/2;
            rspaceY = 0;
        }

        // 获取素材的位置；
        //    配置的位置 - 缩放的影响 - 绘制成正方形的影响；
        cdx = ops.pos.x + cdw * ( 1 - ops.pos.scale )/2 - rspaceX;
        cdy = ops.pos.y + cdh * ( 1 - ops.pos.scale )/2 - rspaceY;

        // 计算配置的缩放值；
        cdh = cdw *= ops.pos.scale;

        this.ctx.drawImage(lcvs,cdx,cdy,cdw,cdh);
        this.next();
    }
    // 参数加工函数；
    _handleOps(ops,img){

        let cw = this.canvas.width,
            ch = this.canvas.height,
            iw = img.width,
            ih = img.height;

        // 图片宽高比；
        let ratio = iw / ih;

        // 根据参数计算后的绘制宽度；
        let width =  this.get(cw,iw,ops.width,'pos');

        // 裁剪的最大宽高；
        let maxLsw,maxLsh;

        // 裁剪参数；
        let { x:cropx,y:cropy,width:cropw,height:croph } = ops.crop;
        let crop = {
            x: this.get(cw,iw,cropx,'crop'),
            y: this.get(ch,ih,cropy,'crop'),
            width:this.get(cw,iw,cropw,'crop'),
            height:this.get(ch,ih,croph,'crop'),
        };
        // 最大值判定；
        if(crop.x > iw)crop.x = iw;
        if(crop.y > ih)crop.y = ih;
        maxLsw = img.width - crop.x;
        maxLsh = img.height - crop.y;
        if(crop.width > maxLsw)crop.width = maxLsw;
        if(crop.height > maxLsh)crop.height = maxLsh;

        // 位置参数；
        let { x: px, y: py, rotate: pr, scale: ps } = ops.pos;
        let pos = {
            x:this.get(cw,width,px,'pos'),
            y:this.get(ch,width/ratio,py,'pos'),
            scale : ps,
            rotate : parseFloat(pr) * Math.PI / 180,
        };
        return {
            width,
            crop,
            pos,
        };
    }
    // 参数加工函数；
    // 兼容4种value值：
    // x:250, x:'250px', x:'100%', x:'left:250'
    get(par,child,str,type){
        let result = str;
        if(typeof str === 'string'){
            if(str.indexOf(':') !== -1 && type == 'pos'){
                let arr = str.split(':');
                switch (arr[0]) {
                    case 'left':
                    case 'top':
                        result = +arr[1];
                        break;
                    case 'right':
                    case 'bottom':
                        result = par - (+arr[1]) - child;
                        break;
                    default:
                }
            }else if (str.indexOf('px') !== -1) {
                result = (+str.replace('px', ''));
            } else if (str.indexOf('%') !== -1) {
                if(type == 'crop'){
                    result = child * (+str.replace('%', '')) / 100;
                }else{
                    result = par * (+str.replace('%', '')) / 100;
                }
            }else{
                result = +str;
            }
        }
        return result;
    }
    draw(fn){
        let b64;
        this.end = () => {
            setTimeout(()=>{
                b64 = this.canvas.toDataURL('image/png');
                fn(b64);
            },0);
        };
        this.next();
        return this;
    }
    next(){
        if(this.queue.length > 0){
            this.queue.shift()();
        }else{
            this.end();
        }
    }
    text(){
        return this;
    }
    watermark(image,ops){
        if(!image){
            console.log('there is not image of watermark');
            return;
        }
        let { width = '20%' , pos = 'rightbottom' , margin = 20} = ops;
        let position = {
            x:0,
            y:0,
            scale:1,
            rotate:0,
        };
        switch (pos) {
            case 'leftTop':
                position.x = `left:${margin}`;
                position.y = `top:${margin}`;
                break;
            case 'leftBottom':
                position.x = `left:${margin}`;
                position.y = `bottom:${margin}`;
                break;
            case 'rightTop':
                position.x = `right:${margin}`;
                position.y = `top:${margin}`;
                break;
            case 'rightBottom':
                position.x = `right:${margin}`;
                position.y = `bottom:${margin}`;
                break;
            default:
        }
        this.add(image,{
            width,
            pos:position,
        });
        return this;
    }

}
