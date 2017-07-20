var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _ = {
    extend: function extend(obj1, obj2) {
        for (var k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                if (_typeof(obj2[k]) == 'object') {
                    if (_typeof(obj1[k]) !== 'object' || obj1[k] === null) {
                        obj1[k] = {};
                    }
                    this.extend(obj1[k], obj2[k]);
                } else {
                    obj1[k] = obj2[k];
                }
            }
        }
        return obj1;
    },
    loadImage: function loadImage(image, loaded, error) {
        var img = new Image();
        if (image.indexOf('http') == 0) {
            img.crossOrigin = '*';
        }
        img.onload = function () {
            loaded(img);
        };
        img.onerror = function () {
            error('img load error');
        };
        img.src = image;
    },
    isArr: function isArr(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    getImage: function getImage(image, cbk) {
        if (typeof image == 'string') {
            this.loadImage(image, function (img) {
                cbk(img);
            }, function (err) {
                console.log(err);
            });
        } else if ((typeof image === 'undefined' ? 'undefined' : _typeof(image)) == 'object') {
            cbk(image);
        } else {
            console.log('add image error');
            return;
        }
    }
};

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MCanvas = function () {
    function MCanvas(cwidth, cheight) {
        _classCallCheck(this, MCanvas);

        // 配置canvas初始大小；
        // cwidth：画布宽度，Number,选填，默认为 500;
        // cheight: 画布高度，Number，选填，默认与宽度一致；
        this.ops = {
            width: cwidth || 500,
            height: cheight || cwidth
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

    _createClass(MCanvas, [{
        key: '_init',
        value: function _init() {
            this.canvas = document.createElement('canvas');
            this.canvas.width = this.ops.width;
            this.canvas.height = this.ops.height;
            this.ctx = this.canvas.getContext('2d');
        }
    }, {
        key: 'background',
        value: function background(bg) {
            var _this = this;

            this.queue.push(function () {
                if (bg.color) {
                    _this.ctx.fillStyle = bg.color;
                    _this.ctx.fillRect(0, 0, _this.canvas.width, _this.canvas.height);
                }
                if (bg.image) {
                    _.getImage(bg.image, function (img) {
                        _this._background(img, bg);
                    });
                }
            });
            return this;
        }
    }, {
        key: '_background',
        value: function _background(img, bg) {
            // 图片与canvas的长宽比；
            var iRatio = img.width / img.height;
            var cRatio = this.canvas.width / this.canvas.height;
            // 背景绘制参数；
            var sx = void 0,
                sy = void 0,
                swidth = void 0,
                sheight = void 0,
                dx = void 0,
                dy = void 0,
                dwidth = void 0,
                dheight = void 0;
            switch (bg.type) {
                // 裁剪模式，固定canvas大小，原图铺满，超出的部分裁剪；
                case 'crop':
                    sx = bg.left || 0;
                    sy = bg.top || 0;
                    if (iRatio > cRatio) {
                        swidth = img.height * cRatio;
                        sheight = img.height;
                    } else {
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
                    if (iRatio > cRatio) {
                        dwidth = this.canvas.width;
                        dheight = dwidth / iRatio;
                        dx = bg.left || 0;
                        dy = bg.top || bg.top == 0 ? bg.top : (this.canvas.height - dheight) / 2;
                    } else {
                        dheight = this.canvas.height;
                        dwidth = dheight * iRatio;
                        dy = bg.top || 0;
                        dx = bg.left || bg.left == 0 ? bg.left : (this.canvas.width - dwidth) / 2;
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
            this.ctx.drawImage(img, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);
            // this.canvas.style = 'width:300px';
            // document.querySelector('body').appendChild(this.canvas);
            this.next();
        }
    }, {
        key: 'add',
        value: function add(image, options) {
            var _this2 = this;

            if (!image) {
                console.error('add image error!');
                return;
            }
            // 默认参数；
            var ops = {
                width: '100%',
                crop: {
                    x: 0,
                    y: 0,
                    width: '100%',
                    height: '100%'
                },
                pos: {
                    x: 0,
                    y: 0,
                    scale: 1,
                    rotate: 0
                }
            };
            ops = _.extend(ops, options);

            // 将封装好的 add函数 推入队列中待执行；
            // 参数经过 _handleOps 加工；
            this.queue.push(function () {
                _.getImage(image, function (img) {
                    _this2._add(img, _this2._handleOps(ops, img));
                });
            });
            return this;
        }
    }, {
        key: '_add',
        value: function _add(img, ops) {
            var ratio = img.width / img.height;
            // 画布canvas参数；
            var cdx = void 0,
                cdy = void 0,
                cdw = void 0,
                cdh = void 0;
            // 素材canvas参数；
            var _ops$crop = ops.crop,
                lsx = _ops$crop.x,
                lsy = _ops$crop.y,
                lsw = _ops$crop.width,
                lsh = _ops$crop.height;

            var ldx = void 0,
                ldy = void 0,
                ldw = void 0,
                ldh = void 0;
            //  素材的真实宽高，用于剔除避免裁剪所添加的空白区域；
            var rw = void 0,
                rh = void 0,
                rspaceX = void 0,
                rspaceY = void 0;

            // 素材canvas的绘制;
            var lcvs = document.createElement('canvas');
            var lctx = lcvs.getContext('2d');

            // 取最长边为边长，正方形,避免旋转的时候被裁剪；
            lcvs.height = lcvs.width = ratio > 1 ? img.width : img.height;

            // 从素材canvas的中心点开始绘制；
            ldx = -img.width / 2;
            ldy = -img.height / 2;
            ldw = img.width;
            ldh = img.height;

            lctx.translate(lcvs.width / 2, lcvs.height / 2);
            lctx.rotate(ops.pos.rotate);
            lctx.drawImage(img, lsx, lsy, lsw, lsh, ldx, ldy, ldw, ldh);

            // lcvs.style = 'width:300px';
            // document.querySelector('body').appendChild(lcvs);

            // 获取素材最终的宽高;
            // 由于前面的素材canvas已经绘制成正方形，所以 w = h;
            cdh = cdw = ops.width;

            // 计算绘制成正方形造成的空白区域；
            if (ratio > 1) {
                rh = cdw / ratio;
                rw = 0;
                rspaceX = 0;
                rspaceY = (cdh - rh) / 2;
            } else {
                rw = cdh * ratio;
                rh = 0;
                rspaceX = (cdw - rw) / 2;
                rspaceY = 0;
            }

            // 获取素材的位置；
            //    配置的位置 - 缩放的影响 - 绘制成正方形的影响；
            cdx = ops.pos.x + cdw * (1 - ops.pos.scale) / 2 - rspaceX;
            cdy = ops.pos.y + cdh * (1 - ops.pos.scale) / 2 - rspaceY;

            // 计算配置的缩放值；
            cdh = cdw *= ops.pos.scale;

            this.ctx.drawImage(lcvs, cdx, cdy, cdw, cdh);
            this.next();
        }
        // 参数加工函数；

    }, {
        key: '_handleOps',
        value: function _handleOps(ops, img) {

            var cw = this.canvas.width,
                ch = this.canvas.height,
                iw = img.width,
                ih = img.height;

            // 图片宽高比；
            var ratio = iw / ih;

            // 根据参数计算后的绘制宽度；
            var width = this.get(cw, iw, ops.width, 'pos');

            // 裁剪的最大宽高；
            var maxLsw = void 0,
                maxLsh = void 0;

            // 裁剪参数；
            var _ops$crop2 = ops.crop,
                cropx = _ops$crop2.x,
                cropy = _ops$crop2.y,
                cropw = _ops$crop2.width,
                croph = _ops$crop2.height;

            var crop = {
                x: this.get(cw, iw, cropx, 'crop'),
                y: this.get(ch, ih, cropy, 'crop'),
                width: this.get(cw, iw, cropw, 'crop'),
                height: this.get(ch, ih, croph, 'crop')
            };
            // 最大值判定；
            if (crop.x > iw) crop.x = iw;
            if (crop.y > ih) crop.y = ih;
            maxLsw = img.width - crop.x;
            maxLsh = img.height - crop.y;
            if (crop.width > maxLsw) crop.width = maxLsw;
            if (crop.height > maxLsh) crop.height = maxLsh;

            // 位置参数；
            var _ops$pos = ops.pos,
                px = _ops$pos.x,
                py = _ops$pos.y,
                pr = _ops$pos.rotate,
                ps = _ops$pos.scale;

            var pos = {
                x: this.get(cw, width, px, 'pos'),
                y: this.get(ch, width / ratio, py, 'pos'),
                scale: ps,
                rotate: parseFloat(pr) * Math.PI / 180
            };
            return {
                width: width,
                crop: crop,
                pos: pos
            };
        }
        // 参数加工函数；
        // 兼容4种value值：
        // x:250, x:'250px', x:'100%', x:'left:250'

    }, {
        key: 'get',
        value: function get(par, child, str, type) {
            var result = str;
            if (typeof str === 'string') {
                if (str.indexOf(':') !== -1 && type == 'pos') {
                    var arr = str.split(':');
                    switch (arr[0]) {
                        case 'left':
                        case 'top':
                            result = +arr[1];
                            break;
                        case 'right':
                        case 'bottom':
                            result = par - +arr[1] - child;
                            break;
                        default:
                    }
                } else if (str.indexOf('px') !== -1) {
                    result = +str.replace('px', '');
                } else if (str.indexOf('%') !== -1) {
                    if (type == 'crop') {
                        result = child * +str.replace('%', '') / 100;
                    } else {
                        result = par * +str.replace('%', '') / 100;
                    }
                } else {
                    result = +str;
                }
            }
            return result;
        }
    }, {
        key: 'draw',
        value: function draw(fn) {
            var _this3 = this;

            var b64 = void 0;
            this.end = function () {
                setTimeout(function () {
                    b64 = _this3.canvas.toDataURL('image/png');
                    fn(b64);
                }, 0);
            };
            this.next();
            return this;
        }
    }, {
        key: 'next',
        value: function next() {
            if (this.queue.length > 0) {
                this.queue.shift()();
            } else {
                this.end();
            }
        }
    }, {
        key: 'text',
        value: function text() {
            return this;
        }
    }, {
        key: 'watermark',
        value: function watermark(image, ops) {
            if (!image) {
                console.log('there is not image of watermark');
                return;
            }
            var _ops$width = ops.width,
                width = _ops$width === undefined ? '20%' : _ops$width,
                _ops$pos2 = ops.pos,
                pos = _ops$pos2 === undefined ? 'rightbottom' : _ops$pos2,
                _ops$margin = ops.margin,
                margin = _ops$margin === undefined ? 20 : _ops$margin;

            var position = {
                x: 0,
                y: 0,
                scale: 1,
                rotate: 0
            };
            switch (pos) {
                case 'leftTop':
                    position.x = 'left:' + margin;
                    position.y = 'top:' + margin;
                    break;
                case 'leftBottom':
                    position.x = 'left:' + margin;
                    position.y = 'bottom:' + margin;
                    break;
                case 'rightTop':
                    position.x = 'right:' + margin;
                    position.y = 'top:' + margin;
                    break;
                case 'rightBottom':
                    position.x = 'right:' + margin;
                    position.y = 'bottom:' + margin;
                    break;
                default:
            }
            this.add(image, {
                width: width,
                pos: position
            });
            return this;
        }
    }]);

    return MCanvas;
}();

var mc = new MCanvas(1000);

// mc.initBg().await();
var img = new Image();
img.onload = function () {
    mc.background({
        image: 'http://mtapplet.meitudata.com/596c72073971d86b5128.jpg',
        left: 0,
        top: 0,
        color: '#000000',
        type: 'origin'
    }).add('images/ear.png', {
        width: 482,
        pos: {
            x: 150,
            y: 58,
            scale: 1,
            rotate: 1
        }
    }).add('images/neck.png', {
        width: 277,
        pos: {
            x: 213,
            y: 557,
            scale: 1,
            rotate: 1
        }
    }).add('images/nose.png', {
        width: 183,
        pos: {
            x: 250,
            y: 369,
            scale: 0.84,
            rotate: 1
        }
    }).text('郭晓东', {
        width: 100

    }).watermark(img, {
        width: '40%',
        pos: 'rightBottom'
    }).draw(function (b64) {
        $('.js-result').attr('src', b64);
    });
};
img.src = 'images/watermark.jpg';
//# sourceMappingURL=example.es.js.map
