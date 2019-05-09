(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.MCanvas = {}));
}(this, function (exports) { 'use strict';

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var _ = {
    extend: function extend(obj1, obj2) {
      var _this = this;

      var type = this.isType(obj2);

      if (type === 'object') {
        this.forin(obj2, function (k, v) {
          var vType = _this.isType(v);

          if (vType !== 'object' && vType !== 'array') {
            obj1[k] = v;
          } else {
            if (_this.isType(obj1[k]) !== vType || obj1[k] === null) {
              obj1[k] = vType === 'object' ? {} : [];
            }

            _this.extend(obj1[k], v);
          }
        });
      } else if (type === 'array') {
        for (var i = 0; i < obj2.length; i++) {
          obj1[i] = obj2[i];
        }
      } else {
        obj1 = obj2;
      }

      return obj1;
    },
    loadImage: function loadImage(image, loaded, error) {
      var img = new Image();

      if (image.indexOf('http') === 0) {
        img.crossOrigin = '*';
      }

      img.onload = function () {
        loaded(img);
        setTimeout(function () {
          return img = null;
        }, 1000);
      };

      img.onerror = function () {
        error('img load error');
      };

      img.src = image;
    },
    isObject: function isObject(tar) {
      return this.isObjFunc(tar, 'Object');
    },
    isBoolean: function isBoolean(tar) {
      return this.isObjFunc(tar, 'Boolean');
    },
    isArr: function isArr(tar) {
      return this.isObjFunc(tar, 'Array');
    },
    getImage: function getImage(image, cbk, error) {
      if (typeof image === 'string') {
        this.loadImage(image, function (img) {
          cbk(img);
        }, error);
      } else if (_typeof(image) === 'object') {
        cbk(image);
      } else {
        console.log('add image error');
        return;
      }
    },
    forin: function forin(obj, cbk) {
      for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
          cbk(k, obj[k]);
        }
      }
    },
    isIos8: function isIos8() {
      var UA = window.navigator.userAgent.toLowerCase();
      var IOS = /(iPhone|iPad|iPod|iOS)/gi.test(UA);
      var IPAD = /(iPad)/gi.test(UA);

      if (IOS) {
        return IPAD ? UA.match(/cpu os (\d*)/)[1] < 9 : UA.match(/iphone os (\d*)/)[1] < 9;
      } else {
        return false;
      }
    },
    deepCopy: function deepCopy(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    isObjFunc: function isObjFunc(tar, name) {
      return Object.prototype.toString.call(tar) === '[object ' + name + ']';
    },
    isType: function isType(tar) {
      return Object.prototype.toString.call(tar).split(' ')[1].replace(']', '').toLowerCase();
    },
    getSize: function getSize(img) {
      var iw, ih;

      if (img.tagName === 'IMG') {
        iw = img.naturalWidth;
        ih = img.naturalHeight;
      } else if (img.tagName === 'CANVAS') {
        iw = img.width;
        ih = img.height;
      } else {
        iw = img.offsetWidth;
        ih = img.offsetHeight;
      }

      return {
        iw: iw,
        ih: ih
      };
    }
  };

  function MCanvas() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    // 兼容不使用 new 的方式；
    if (!(this instanceof MCanvas)) return new MCanvas(options); // 配置canvas初始大小；
    // width：画布宽度，Number,选填，默认为 500;
    // height: 画布高度，Number，选填，默认与宽度一致；

    this.ops = _.extend({
      width: 500,
      height: 500,
      backgroundColor: ''
    }, options); // 全局画布；

    this.canvas = null;
    this.ctx = null; // 绘制函数队列；

    this.queue = []; // 回调函数池；

    this.fn = {
      // 最后执行的函数；
      success: function success() {},
      // 错误回调；
      error: function error() {}
    };
    this.data = {
      // 文字id；
      textId: 0,
      // 文字绘制数据；
      text: {},
      // 背景图数据;
      bgConfig: null // 初始化创建画布；

    };

    this._init();
  }

  MCanvas.prototype._init = function () {
    this.canvas = document.createElement('canvas');
    this.canvas.width = this.ops.width;
    this.canvas.height = this.ops.height;
    this.ctx = this.canvas.getContext('2d');
    this.ctx.save();
    this.ops.backgroundColor && this.setBgColor(this.ops.backgroundColor);
  }; // --------------------------------------------------------
  // 绘制背景部分；
  // --------------------------------------------------------


  MCanvas.prototype.background = function (image) {
    var _this = this;

    var bg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
      type: 'origin'
    };

    if (!image && !this.data.bgConfig) {
      console.error('mcanvas error : the init background must has a image.');
      return;
    } // 缓存bg options， 用于重置；


    if (!image) {
      bg = this.data.bgConfig;
    } else {
      bg.image = image;
      this.data.bgConfig = bg;
    }

    this.queue.push(function () {
      if (bg.color) _this.setBgColor(bg.color);

      _.getImage(bg.image, function (img) {
        _this._background(img, bg);
      }, _this.fn.error);
    });
    return this;
  }; // 设置画布颜色;


  MCanvas.prototype.setBgColor = function (color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  };

  MCanvas.prototype._getBgAlign = function (left, iw, cw, cropScale) {
    var rv;

    if (typeof left === 'string') {
      if (left === '50%' || left === 'center') {
        rv = Math.abs((iw - cw / cropScale) / 2);
      } else if (left === '100%') {
        rv = Math.abs(iw - cw / cropScale);
      } else if (left === '0%') {
        rv = 0;
      }
    } else if (typeof left === 'number') {
      rv = left;
    } else {
      rv = 0;
    }

    return rv;
  };

  MCanvas.prototype._background = function (img, bg) {
    var _$getSize = _.getSize(img),
        iw = _$getSize.iw,
        ih = _$getSize.ih; // 图片与canvas的长宽比；


    var iRatio = iw / ih;
    var cRatio = this.canvas.width / this.canvas.height; // 背景绘制参数；

    var sx, sy, swidth, sheight, dx, dy, dwidth, dheight;
    var cropScale;

    switch (bg.type) {
      // 裁剪模式，固定canvas大小，原图铺满，超出的部分裁剪；
      case 'crop':
        if (iRatio > cRatio) {
          swidth = ih * cRatio;
          sheight = ih;
          cropScale = this.canvas.height / ih;
        } else {
          swidth = iw;
          sheight = swidth / cRatio;
          cropScale = this.canvas.width / iw;
        }

        sx = this._getBgAlign(bg.left, iw, this.canvas.width, cropScale);
        sy = this._getBgAlign(bg.top, ih, this.canvas.height, cropScale);
        dy = dx = 0;
        dheight = this.canvas.height;
        dwidth = this.canvas.width;
        break;
      // 包含模式，固定canvas大小，包含背景图；

      case 'contain':
        sy = sx = 0;
        swidth = iw;
        sheight = ih;

        if (iRatio > cRatio) {
          dwidth = this.canvas.width;
          dheight = dwidth / iRatio;
          dx = bg.left || 0;
          dy = bg.top || bg.top === 0 ? bg.top : (this.canvas.height - dheight) / 2;
        } else {
          dheight = this.canvas.height;
          dwidth = dheight * iRatio;
          dy = bg.top || 0;
          dx = bg.left || bg.left === 0 ? bg.left : (this.canvas.width - dwidth) / 2;
        }

        break;
      // 原图模式：canvas与原图大小一致，忽略初始化 传入的宽高参数；
      // 同时，background 传入的 left/top 均被忽略；

      case 'origin':
        this.canvas.width = iw;
        this.canvas.height = ih;
        sx = sy = 0;
        swidth = iw;
        sheight = ih;
        dx = dy = 0;
        dwidth = this.canvas.width;
        dheight = this.canvas.height;
        break;

      default:
        console.error('mcanvas error:background type error!');
        return;
    }

    this.ctx.drawImage(img, sx, sy, swidth, sheight, dx, dy, dwidth, dheight);

    this._next();
  }; // --------------------------------------------------------
  // 绘制图层部分；
  // --------------------------------------------------------
  // 绘制矩形层；


  MCanvas.prototype.rect = function (ops) {
    var _this2 = this;

    this.queue.push(function () {
      var _ops$fillColor = ops.fillColor,
          fillColor = _ops$fillColor === void 0 ? '#fff' : _ops$fillColor,
          _ops$strokeColor = ops.strokeColor,
          strokeColor = _ops$strokeColor === void 0 ? fillColor : _ops$strokeColor,
          _ops$strokeWidth = ops.strokeWidth,
          strokeWidth = _ops$strokeWidth === void 0 ? 0 : _ops$strokeWidth;
      var cw = _this2.canvas.width,
          ch = _this2.canvas.height;
      var width = _this2._get(cw, 0, ops.width || 0, 'pos') - 2 * strokeWidth,
          height = _this2._get(ch, 0, ops.height || 0, 'pos') - 2 * strokeWidth;
      var x = _this2._get(cw, width, ops.x || 0, 'pos') + strokeWidth / 2,
          y = _this2._get(ch, height, ops.y || 0, 'pos') + strokeWidth / 2;
      _this2.ctx.lineWidth = strokeWidth;
      _this2.ctx.fillStyle = fillColor;
      _this2.ctx.strokeStyle = strokeColor;

      _this2.ctx.beginPath();

      _this2.ctx.strokeRect(x, y, width, height);

      _this2.ctx.fillRect(x, y, width, height);

      _this2.ctx.closePath();

      _this2._resetCtx()._next();
    });
    return this;
  }; // 绘制圆形层；


  MCanvas.prototype.circle = function (ops) {
    var _this3 = this;

    this.queue.push(function () {
      var _ops$fillColor2 = ops.fillColor,
          fillColor = _ops$fillColor2 === void 0 ? '#fff' : _ops$fillColor2,
          _ops$strokeColor2 = ops.strokeColor,
          strokeColor = _ops$strokeColor2 === void 0 ? fillColor : _ops$strokeColor2,
          _ops$strokeWidth2 = ops.strokeWidth,
          strokeWidth = _ops$strokeWidth2 === void 0 ? 0 : _ops$strokeWidth2;
      var cw = _this3.canvas.width,
          ch = _this3.canvas.height;
      var r = _this3._get(cw, 0, ops.r || 0, 'pos') - 2 * strokeWidth;
      var x = _this3._get(cw, 2 * r, ops.x || 0, 'pos') + strokeWidth / 2 + r,
          y = _this3._get(ch, 2 * r, ops.y || 0, 'pos') + strokeWidth / 2 + r;

      _this3.ctx.beginPath();

      _this3.ctx.arc(x, y, r, 0, Math.PI * 2, false);

      _this3.ctx.fillStyle = fillColor;

      _this3.ctx.fill();

      _this3.ctx.strokeStyle = strokeColor;
      _this3.ctx.lineWidth = strokeWidth;

      _this3.ctx.stroke();

      _this3.ctx.closePath();

      _this3._resetCtx()._next();
    });
    return this;
  }; // 重置ctx属性;


  MCanvas.prototype._resetCtx = function () {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.restore();
    return this;
  }; // 绘制水印；基于 add 函数封装；


  MCanvas.prototype.watermark = function () {
    var image = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ops = arguments.length > 1 ? arguments[1] : undefined;

    if (!image) {
      console.error('mcanvas error : there is not image of watermark.');
      return;
    } // 参数默认值；


    var _ops$width = ops.width,
        width = _ops$width === void 0 ? '40%' : _ops$width,
        _ops$pos = ops.pos,
        pos = _ops$pos === void 0 ? 'rightbottom' : _ops$pos,
        _ops$margin = ops.margin,
        margin = _ops$margin === void 0 ? 20 : _ops$margin;
    var position = {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0
    };

    switch (pos) {
      case 'leftTop':
        position.x = "left:".concat(margin);
        position.y = "top:".concat(margin);
        break;

      case 'leftBottom':
        position.x = "left:".concat(margin);
        position.y = "bottom:".concat(margin);
        break;

      case 'rightTop':
        position.x = "right:".concat(margin);
        position.y = "top:".concat(margin);
        break;

      case 'rightBottom':
        position.x = "right:".concat(margin);
        position.y = "bottom:".concat(margin);
        break;

      default:
    }

    this.add(image, {
      width: width,
      pos: position
    });
    return this;
  }; // 通用绘制图层函数；
  // 使用方式：
  // 多张图: add([{image:'',options:{}},{image:'',options:{}}]);
  // 单张图: add(image,options);


  MCanvas.prototype.add = function () {
    var _this4 = this;

    var image = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var options = arguments.length > 1 ? arguments[1] : undefined;
    // 默认参数；
    var def = {
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
    if (!_.isArr(image)) image = [{
      image: image,
      options: options
    }];
    image.forEach(function (v) {
      // 将封装好的 add函数 推入队列中待执行；
      // 参数经过 _handleOps 加工；
      _this4.queue.push(function () {
        _.getImage(v.image, function (img) {
          _this4._add(img, _this4._handleOps(_.extend(def, v.options), img));
        }, _this4.fn.error);
      });
    });
    return this;
  };

  MCanvas.prototype._add = function (img, ops) {
    if (ops.width === 0) console.warn("mcanvas warn: the width of mc-element is zero");

    var _$getSize2 = _.getSize(img),
        iw = _$getSize2.iw,
        ih = _$getSize2.ih; // let ratio = iw / ih;
    // 画布canvas参数；


    var cdx, cdy, cdw, cdh; // 素材canvas参数；

    var _ops$crop = ops.crop,
        lsx = _ops$crop.x,
        lsy = _ops$crop.y,
        lsw = _ops$crop.width,
        lsh = _ops$crop.height;
    var cratio = lsw / lsh;
    var ldx, ldy, ldw, ldh; // 素材canvas的绘制;

    var lcvs = document.createElement('canvas');
    var lctx = lcvs.getContext('2d'); // 图片宽高比 * 1.4 是一个最安全的宽度，旋转任意角度都不会被裁剪；
    // 没有旋转却长宽比很高大的图，会导致放大倍数太大，因此甚至了最高倍数为5；
    // _ratio 为 较大边 / 较小边 的比例；

    var _ratio = iw > ih ? iw / ih : ih / iw;

    var lctxScale = _ratio * 1.4 > 5 ? 5 : _ratio * 1.4;
    var spaceX, spaceY;
    lcvs.width = Math.round(lsw * lctxScale);
    lcvs.height = Math.round(lsh * lctxScale); // 限制canvas的大小，ios8以下为 2096, 其余平台均限制为 4096;

    var shrink;

    if (_.isIos8() && (lcvs.width > 2096 || lcvs.height > 2096)) {
      if (cratio > 1) {
        shrink = 2096 / lcvs.width;
      } else {
        shrink = 2096 / lcvs.height;
      }
    } else if (lcvs.width > 4096 || lcvs.height > 4096) {
      if (cratio > 1) {
        shrink = 4096 / lcvs.width;
      } else {
        shrink = 4096 / lcvs.height;
      }
    } // 从素材canvas的中心点开始绘制；


    ldx = -Math.round(lsw / 2);
    ldy = -Math.round(lsh / 2);
    ldw = lsw;
    ldh = Math.round(lsw / cratio); // 获取素材最终的宽高;

    if (shrink) {
      var _map = [lcvs.width, lcvs.height, ldx, ldy, ldw, ldh].map(function (v) {
        return Math.round(v * shrink);
      });

      var _map2 = _slicedToArray(_map, 6);

      lcvs.width = _map2[0];
      lcvs.height = _map2[1];
      ldx = _map2[2];
      ldy = _map2[3];
      ldw = _map2[4];
      ldh = _map2[5];
    }

    lctx.translate(lcvs.width / 2, lcvs.height / 2);
    lctx.rotate(ops.pos.rotate);
    lctx.drawImage(img, lsx, lsy, lsw, lsh, ldx, ldy, ldw, ldh);
    cdw = Math.round(ops.width * lctxScale);
    cdh = Math.round(cdw / cratio);
    spaceX = (lctxScale - 1) * ops.width / 2;
    spaceY = spaceX / cratio; // 获取素材的位置；
    //    配置的位置 - 缩放的影响 - 绘制成正方形的影响；

    cdx = Math.round(ops.pos.x + cdw * (1 - ops.pos.scale) / 2 - spaceX);
    cdy = Math.round(ops.pos.y + cdh * (1 - ops.pos.scale) / 2 - spaceY);
    cdw *= ops.pos.scale;
    cdh *= ops.pos.scale;
    this.ctx.drawImage(lcvs, cdx, cdy, cdw, cdh);
    lcvs = lctx = null;

    this._next();
  }; // 参数加工函数；


  MCanvas.prototype._handleOps = function (ops, img) {
    var cw = this.canvas.width,
        ch = this.canvas.height;

    var _$getSize3 = _.getSize(img),
        iw = _$getSize3.iw,
        ih = _$getSize3.ih; // 图片宽高比；


    var ratio = iw / ih; // 根据参数计算后的绘制宽度；

    var width = this._get(cw, iw, ops.width, 'pos'); // 裁剪的最大宽高；


    var maxLsw, maxLsh; // 裁剪参数；

    var _ops$crop2 = ops.crop,
        cropx = _ops$crop2.x,
        cropy = _ops$crop2.y,
        cropw = _ops$crop2.width,
        croph = _ops$crop2.height;
    var crop = {};
    crop.width = this._get(cw, iw, cropw, 'crop');
    crop.height = this._get(ch, ih, croph, 'crop');
    crop.x = this._get(iw, crop.width, cropx, 'crop');
    crop.y = this._get(ih, crop.height, cropy, 'crop'); // 最大值判定；

    if (crop.x > iw) crop.x = iw;
    if (crop.y > ih) crop.y = ih;
    maxLsw = iw - crop.x;
    maxLsh = ih - crop.y;
    if (crop.width > maxLsw) crop.width = maxLsw;
    if (crop.height > maxLsh) crop.height = maxLsh; // 位置参数；

    var _ops$pos2 = ops.pos,
        px = _ops$pos2.x,
        py = _ops$pos2.y,
        pr = _ops$pos2.rotate,
        ps = _ops$pos2.scale;
    var pos = {
      x: this._get(cw, width, px, 'pos'),
      y: this._get(ch, width / ratio, py, 'pos'),
      scale: ps,
      rotate: parseFloat(pr) * Math.PI / 180
    };
    return {
      width: width,
      crop: crop,
      pos: pos
    };
  }; // --------------------------------------------------------
  // 绘制文字部分；
  // --------------------------------------------------------


  MCanvas.prototype.text = function () {
    var _this5 = this;

    var context = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
    var ops = arguments.length > 1 ? arguments[1] : undefined;
    // 默认字体；
    var fontFamily = "helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif"; // 默认的字体大小;

    var size = this.canvas.width / 20;
    this.queue.push(function () {
      var defaultStyle = {
        color: '#000',
        type: 'fill',
        // strokeText or fillText,
        lineWidth: 1,
        shadow: {
          color: null,
          blur: 0,
          offsetX: 0,
          offsetY: 0
        }
      };
      var option = {
        width: 300,
        align: 'left',
        smallStyle: _objectSpread({
          font: "".concat(size * 0.8, "px ").concat(fontFamily),
          lineHeight: size * 0.9
        }, _.deepCopy(defaultStyle)),
        normalStyle: _objectSpread({
          font: "".concat(size, "px ").concat(fontFamily),
          lineHeight: size * 1.1,
          type: 'fill'
        }, _.deepCopy(defaultStyle)),
        largeStyle: _objectSpread({
          font: "".concat(size * 1.3, "px ").concat(fontFamily),
          lineHeight: size * 1.4
        }, _.deepCopy(defaultStyle)),
        pos: {
          x: 0,
          y: 0,
          rotate: 0
        }
      };
      option = _.extend(option, ops); // 解析字符串模板后，调用字体绘制函数；

      var parseContext = _this5._parse(context);

      var max = 0,
          maxFont;
      parseContext.map(function (v) {
        if (v.size > max) {
          max = v.size;
          maxFont = v.type;
        }
      }); // 当设置的宽度小于字体宽度时，强行将设置宽度设为与字体一致；

      var maxFontSize = parseInt(option["".concat(maxFont, "Style")].font);
      if (maxFontSize && option.width < maxFontSize) option.width = maxFontSize;

      _this5._text(parseContext, option);

      _this5._resetCtx()._next();
    });
    return this;
  }; // 字符串模板解析函数
  // 解析 <s></s> <b></b>


  MCanvas.prototype._parse = function (context) {
    var arr = context.split(/<s>|<b>/);
    var result = [];

    for (var i = 0; i < arr.length; i++) {
      var value = arr[i];

      if (/<\/s>|<\/b>/.test(value)) {
        var splitTag = /<\/s>/.test(value) ? '</s>' : '</b>',
            type = /<\/s>/.test(value) ? 'small' : 'large';
        var tmp = arr[i].split(splitTag);
        result.push({
          type: type,
          text: tmp[0],
          // 用于字体的大小比较；
          size: type === 'small' ? 0 : 2
        });
        tmp[1] && result.push({
          type: 'normal',
          text: tmp[1],
          size: 1
        });
        continue;
      }

      arr[i] && result.push({
        text: arr[i],
        type: 'normal',
        size: 1
      });
    }

    return result;
  };

  MCanvas.prototype._text = function (textArr, option) {
    var _this6 = this;

    this.data.textId++;
    this.data.text[this.data.textId] = {}; // 处理宽度参数；

    option.width = this._get(this.canvas.width, 0, option.width, 'pos');

    var style,
        line = 1,
        length = 0,
        lineHeight = getLineHeight(textArr, option),
        x = this._get(this.canvas.width, option.width, 0, 'pos'),
        y = this._get(this.canvas.height, 0, 0, 'pos') + lineHeight; // data:字体数据；
    // lineWidth:行宽；


    this.data.text[this.data.textId][line] = {
      data: [],
      lineWidth: 0 // 生成字体数据；

    };
    textArr.forEach(function (v) {
      style = option["".concat(v.type, "Style")];
      _this6.ctx.font = style.font;

      var width = _this6.ctx.measureText(v.text).width; // 处理 <br> 换行，先替换成 '|',便于单字绘图时进行判断；


      var context = v.text.replace(/<br>/g, '|'); // 先进行多字超出判断，超出宽度后再进行单字超出判断；

      if (length + width > option.width || context.indexOf('|') !== -1) {
        for (var i = 0, fontLength = context.length; i < fontLength; i++) {
          var font = context[i];
          width = _this6.ctx.measureText(font).width; // 当字体的计算宽度 > 设置的宽度 || 内容中包含换行时,进入换行逻辑；

          if (length + width > option.width || font === '|') {
            length = 0;
            x = _this6._get(_this6.canvas.width, option.width, 0, 'pos');
            y += lineHeight;
            line += 1;
            _this6.data.text[_this6.data.textId][line] = {
              data: [],
              lineWidth: 0
            };
            if (font === '|') continue;
          }

          _this6.data.text[_this6.data.textId][line]['data'].push({
            context: font,
            x: x,
            y: y,
            style: style,
            width: width
          });

          length += width;
          x += width;
          _this6.data.text[_this6.data.textId][line]['lineWidth'] = length;
        }
      } else {
        _this6.data.text[_this6.data.textId][line]['data'].push({
          context: context,
          x: x,
          y: y,
          style: style,
          width: width
        });

        length += width;
        x += width;
        _this6.data.text[_this6.data.textId][line]['lineWidth'] = length;
      }
    }); // 创建文字画布；

    var tcvs = document.createElement('canvas');
    var tctx = tcvs.getContext('2d');

    var tdx = this._get(this.canvas.width, option.width, option.pos.x, 'pos'),
        tdy = this._get(this.canvas.height, 0, option.pos.y, 'pos');

    var tdw, tdh;
    tdw = tcvs.width = option.width;
    tdh = tcvs.height = this._getTextRectHeight(line); // 通过字体数据进行文字的绘制；

    _.forin(this.data.text[this.data.textId], function (k, v) {
      // 增加 align 的功能；
      var add = 0;

      if (v.lineWidth < option.width) {
        if (option.align === 'center') {
          add = (option.width - v.lineWidth) / 2;
        } else if (option.align === 'right') {
          add = option.width - v.lineWidth;
        }
      }

      v.data.forEach(function (text) {
        text.x += add;

        _this6._fillText(tctx, text);
      });
    }); // tcvs.style.width = '300px';
    // document.querySelector('body').appendChild(tcvs);
    // 绘制文字画布；


    var originX = tdx + tdw / 2,
        originY = tdy + tdh / 2;
    this.ctx.translate(originX, originY);
    this.ctx.rotate(parseFloat(option.pos.rotate) * Math.PI / 180);
    this.ctx.drawImage(tcvs, -tdw / 2, -tdh / 2, tdw, tdh); // 获取行高；

    function getLineHeight(textArr, option) {
      var lh = 0,
          vlh;
      textArr.forEach(function (v) {
        vlh = option["".concat(v.type, "Style")].lineHeight;
        if (vlh > lh) lh = vlh;
      });
      return lh;
    }
  };

  MCanvas.prototype._fillText = function (ctx, text) {
    var context = text.context,
        x = text.x,
        y = text.y,
        style = text.style;
    var align = style.align,
        lineWidth = style.lineWidth,
        shadow = style.shadow;
    var color = shadow.color,
        blur = shadow.blur,
        offsetX = shadow.offsetX,
        offsetY = shadow.offsetY;
    ctx.font = style.font;
    ctx.textAlign = align;
    ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;

    if (style.gradient) {
      var _style$gradient = style.gradient,
          type = _style$gradient.type,
          colorStop = _style$gradient.colorStop;
      var x1, y1, x2, y2;

      if (type === 1) {
        x1 = x;
        y1 = y;
        x2 = x + text.width;
        y2 = y;
      } else {
        x1 = x;
        y1 = y - style.lineHeight;
        x2 = x;
        y2 = y;
      }

      var grad = ctx.createLinearGradient(x1, y1, x2, y2);
      var colorNum = colorStop.length || 0;

      _.forin(colorStop, function (i, v) {
        grad.addColorStop(1 / colorNum * (+i + 1), v);
      });

      ctx["".concat(style.type, "Style")] = grad;
    } else {
      ctx["".concat(style.type, "Style")] = style.color;
    }

    ctx["".concat(style.type, "Text")](context, x, y);

    this._resetCtx();
  };

  MCanvas.prototype._getTextRectHeight = function (lastLine) {
    var lastLineData = this.data.text[this.data.textId][lastLine].data[0];
    return lastLineData.y + lastLineData.style.lineHeight;
  }; // --------------------------------------------------------
  // 业务功能函数部分
  // --------------------------------------------------------
  // 参数加工函数；
  // 兼容 5 种 value 值：
  // x:250, x:'250px', x:'100%', x:'left:250',x:'center',
  // width:100,width:'100px',width:'100%'


  MCanvas.prototype._get = function (par, child, str, type) {
    var result = str;

    if (typeof str === 'string') {
      if (str.indexOf(':') !== -1 && type === 'pos') {
        var arr = str.split(':');

        switch (arr[0]) {
          case 'left':
          case 'top':
            result = +arr[1].replace('px', '');
            break;

          case 'right':
          case 'bottom':
            result = par - +arr[1].replace('px', '') - child;
            break;

          default:
        }
      } else if (str.indexOf('px') !== -1) {
        result = +str.replace('px', '');
      } else if (str.indexOf('%') !== -1) {
        if (type === 'crop') {
          result = child * +str.replace('%', '') / 100;
        } else {
          result = par * +str.replace('%', '') / 100;
        }
      } else if (str === 'center') {
        result = (par - child) / 2;
      } else if (str === 'origin') {
        result = child;
      } else {
        result = +str;
      }
    }

    return Math.round(result);
  }; // 绘制函数；


  MCanvas.prototype.draw = function (ops) {
    var _this7 = this;

    var _ops = {
      type: 'jpg',
      quality: .9,
      success: function success() {},
      error: function error() {}
    },
        b64;

    if (typeof ops === 'function') {
      _ops.success = ops;
    } else {
      _ops = _.extend(_ops, ops);
      if (_ops.type === 'jpg') _ops.type = 'jpeg';
    }

    this.fn.error = _ops.error;

    this.fn.success = function () {
      setTimeout(function () {
        b64 = _this7.canvas.toDataURL("image/".concat(_ops.type), _ops.quality);

        _ops.success(b64);
      }, 0);
    };

    this._next();

    return this;
  };

  MCanvas.prototype._next = function () {
    if (this.queue.length > 0) {
      this.queue.shift()();
    } else {
      this.fn.success();
    }
  };

  MCanvas.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    return this;
  };

  var getPos = function getPos(imgW, cropW, str) {
    if (!str && str !== 0) return str;
    var result = str;

    if (typeof str === 'string') {
      if (str.indexOf(':') !== -1) {
        var arr = str.split(':');

        switch (arr[0]) {
          case 'left':
          case 'top':
            result = +arr[1].replace('px', '');
            break;

          case 'right':
          case 'bottom':
            result = imgW - +arr[1].replace('px', '');
            break;

          default:
        }
      } else if (str.indexOf('px') !== -1) {
        result = +str.replace('px', '');
      } else if (str.indexOf('%') !== -1) {
        result = imgW * +str.replace('%', '') / 100;
      } else if (str === 'center') {
        result = (imgW - cropW) / 2;
      } else {
        result = +str;
      }
    }

    return Math.round(result);
  };

  var getLength = function getLength(imgW, str) {
    if (!str && str !== 0) return str;
    var result = str;

    if (typeof str === 'string') {
      if (str.indexOf('px') !== -1) {
        result = +str.replace('px', '');
      } else if (str.indexOf('%') !== -1) {
        result = imgW * +str.replace('%', '') / 100;
      } else if (str === 'center') {
        result = imgW / 2;
      } else {
        result = +str;
      }
    }

    return Math.round(result);
  }; // interface ops {
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


  function MCrop(image) {
    var ops = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (!image) {
      console.error('mcrop error : there is not a image.');
      return;
    }

    var _ops$success = ops.success,
        success = _ops$success === void 0 ? function () {} : _ops$success,
        _ops$error = ops.error,
        error = _ops$error === void 0 ? function () {} : _ops$error;

    _.getImage(image, function (img) {
      var _$getSize = _.getSize(img),
          iw = _$getSize.iw,
          ih = _$getSize.ih;

      var minL = Math.min(iw, ih);
      var _ops$type = ops.type,
          type = _ops$type === void 0 ? 'rect' : _ops$type;
      var cvs = document.createElement('canvas');
      var ctx = cvs.getContext('2d');

      if (type === 'rect') {
        var width = getLength(iw, ops.width) || iw;
        var height = getLength(ih, ops.height) || ih;
        if (width > iw) width = iw;
        if (height > ih) height = ih;
        var x = getPos(iw, width, ops.x);
        var y = getPos(ih, height, ops.y); // 扣除超出部分，避免截图出现空白

        if (x + width > iw) width = iw - x;
        if (y + height > ih) height = ih - y;
        cvs.width = width;
        cvs.height = height;
        ctx.drawImage(img, -x, -y, iw, ih);
      } else if (type === 'circle') {
        var r = getLength(minL, ops.r) || minL / 2;
        if (r * 2 > minL) r = minL / 2;

        var _x = getPos(iw, r * 2, ops.x);

        var _y = getPos(ih, r * 2, ops.y);

        cvs.width = r * 2;
        cvs.height = r * 2;
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2, false);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.globalCompositeOperation = 'source-in';
        ctx.drawImage(img, -_x, -_y, iw, ih);
      }

      setTimeout(function () {
        var exportConfig = _.extend({
          type: 'jpg',
          quality: .9
        }, ops.exportConfig || {});

        var b64 = cvs.toDataURL("image/".concat(exportConfig.type), exportConfig.quality);
        success(b64);
      }, 0);
    }, function (err) {
      console.error('mcrop error : load image error.', err);
      error(err);
    });
  }

  var MCrop$1 = MCrop;
  if (!window.MCanvas) window.MCanvas = MCanvas;
  if (!window.MCrop) window.MCrop = MCrop$1;

  exports.MCrop = MCrop$1;
  exports.default = MCanvas;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=mcanvas.js.map
