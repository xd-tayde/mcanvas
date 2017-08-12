# MCanvas.js

 [Example](http://www.guoxiaodong.net/mcanvas/example/index.html)   

 [Git](https://github.com/xd-tayde/mcanvas)

## 简介：

在业务中，经常遇到各种合成图片的需求，如贴纸的合成，合成文字，添加水印等，因为这些业务经常需要进行各种位置，状态等参数的计算，写起来并不是那么方便。该插件就是为了解决这部分难点，封装底层 `API` 及各种计算，提供出使用更为简单的 `API`，减少项目上的重复工作，提高效率；

## 更新：

- 1.1.7 (8.12)
    - 增加`mc.background(bg)`接口初次调用时的错误提醒，修改异常提示的内容；

- 1.1.6 (8.11)
    - 修复竖直素材下,为了规避裁剪的画布放大倍数错误的问题；

- 1.1.5 (8.10)
    - 增加 `add/background/watermark` 传入的`image`可以为 `canvas`；

- 1.1.4 (8.9)
    - 增加英文文档；
    - 增加初始化时可配置默认背景色；

- 1.1.3 (8.3)
    - 修改一处警告语法错误；
    - 增加画素材的小画布放大机制，用于解决因旋转导致的裁剪；
    - 增加小画布绘制后清空机制，避免因素材太大导致占用内存过高；

- 1.0.9 (7.27)
    - 获取图片宽度由 `img.width` 修改为 `img.naturalWidth`,以避免直接传入`DOM`节点时获取宽高被`css`影响；
    - 增加背景图片错误提醒；

- 1.0.8 (7.27)
	- 调整构造函数结构，使用 `prototype` 原型链的形，以兼容不带 `new` 的调用方式；
	- 调整完善文档；
    - 删除错误的包依赖，调整包名；

- 1.0.2 (7.26)
	- 修正完善文档
	- 修改 bigStyle --> largeStyle;


## 基础使用：

由于图片的合成是异步且严格遵循顺序的，因此将使用的形式设计成了链式的方式，这种方式更为语义化且符合逻辑；

首先需要一系列的素材准备，将要绘制的素材 `add` 进 `queue` 队列中，最后再调用 `draw()` 进行绘制及导出；

```js

// 创建画布，初始化 canvas；
let mc = new MC(width,height);

// background : 准备底图；提供多种模式
mc.background({
    image:'',
    left:0,
    top:0,
    color:'#000000',
    type:'origin',
})

// add 添加图片素材基础函数；
.add('images/nose.png',{
    width:183,
    pos:{
        x:250,
        y:369,
        scale:0.84,
        rotate:1,
    },
})

// text 添加文字数据基础函数；
.text('郭晓东<br><s>啊啊啊</s>',{
    width:'300px',
    align:'center',
    pos:{
        x:0,
        y:0,
	  },
})

// watermark 添加水印函数，基于 add 函数封装；
.watermark(img ,{
    width:'40%',
    pos:'rightBottom',
})

// draw 最终绘制函数，用于最终的绘制；
.draw( b64 =>{
	 console.log(b64);
});

```

### API：

### 创建实例：

#### `new MCanvas(width,height)` || `MCanvas(width,height)`:

创建画布，初始化 `Canvas` ;

params:

	width : 画布初始宽度;
		type : Number; Default : 500; required;

	height: 画布初始高度;
		type : Number; Default : width; optional;

### 方法：

#### 1、 `mc.background(bg)`:

绘制画布的底图；

bg: optional ，如果不填，则使用 默认参数；

> 每次绘制背景后，都会将参数储存为 默认值，因此可以通过不传值调用该函数来恢复背景图初始化；

params:

```js
bg : {
	// 背景图片，type: url/HTMLImageElement/HTMLCanvasElement
    image:'' ,

    // 绘制方式: origin / crop / contain
    	// origin : 原图模式，画布与背景图大小一致，忽略初始化传入的画布宽高；忽略 left/top值；
    	// crop : 裁剪模式，背景图自适应铺满画布，多余部分裁剪；可通过 left/top值控制裁剪部分；
    	// contain : 包含模式, 类似于 background-size:contain; 可通过left/top值进行位置的控制；
    type:'origin',

    // 背景图片距离画布左上角的距离，
    left:0,
    top:0,

    // 除了背景图外的颜色，仅在 type:contain时可见；
    color:'#000000',
}
```

> TIPS：该方法可独立使用，无需通过 `draw()`;

#### 2、`add(image,options)`/`add([{image:'',options:{}},{image:'',options:{}}])`:

通用的添加图层函数，可使用上面两种调用方式，添加多张或者单张素材；

params:

```js
// 素材图，type: url/HTMLImageElement/HTMLCanvasElement
image : '',

// 配置参数：
options : {
	// 素材的宽度值，相对于画布；
	// example: width: 100 / '100%' / '100px';
    width:'100%',

    // 裁剪系数，相对于素材图；
    // crop params;
    crop:{
    	 // 相对于素材图的坐标点，原点为左上点；
        x:0,
        y:0,

        // 需要裁剪的宽高, example:100/'100%'/'100px'；
        // 内部有做最大值的判断；

        width:'100%',
        height:'100%',
    },

    // 位置系数，相对于画布；
    pos:{
    	 // 相对于画布的坐标点，原点为左上点;
    	 // example：
    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
        x:0,
        y:0,

        // 素材放大值，会叠加 width 值，进行进一步基于中心点放大；
        scale:1,

        // 素材旋转角度；
        rotate:0,
    },
}

```
#### 3、`watermark(image,options)`:

添加水印函数，基于 `add()` 封装，使用更便携方便；
prepare the watermark;

params:

```js
// 素材图，type: url/HTMLImageElement/HTMLCanvasElement
image : '',

// 配置参数：
options:{
	// 水印大小，为了根据图片进行自适应，仅支持 百分比 的形式；
	// 宽度为 画布宽度 * 百分比；
		// type : string
		// Default : '40%';
	width:'100%',

	// 位置
		// 4个选值 ： leftTop/leftBottom/rightTop/rightBottom;
		// type : string
		// Default : 'rightBottom';
	pos : 'leftTop',

	// 距离画布边界的 margin 值，
		// type : Number
		// Default : 20;
	margin :
}
```


#### 4、`text(context,options)`:

添加文字函数；支持多样式，自动换行；

params:

```js
// 文字内容，支持配置三种字体样式，big/normal/small;
	// 通过标签的形式进行配置；
	// <b></b> : 大字  |  <s>小字</s> : 小字 |  <br>：换行
	// Tips : 会根据宽度进行自适应换行处理，另外也可通过 <br> 进行主动换行；
context : '<b>大字大字大字</b>常规字体<br>换行<s>小字小字小字</s>',

options:{
	 // 定义文字每行的宽度值，相对于画布；
	 // example :  width: 100 / '100%' / '100px';
    width : 300,

    // 每一行文字的 align 值
    // 'left'/'center'/'right';
    align : 'left',

    // 为了自适应，默认常规字体大小为 画布 宽度值的 5%;
    // 小字为常规字体的 0.9 倍；
    // 大字为常规字体的 1.2 倍；
    // 字体样式默认为 `helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif`;
    // 字体颜色默认为 黑色；
    // lineheight 默认为 内容中最大字体的 1.1 倍

    // 可通过以下参数进行配置；
    // 小字的样式
    // the style of contained in <s></s>
    smallStyle:{
        font : ``,
        color:'#000',
        lineheight: 100,
    },

    // 常规字体的样式
    // the style of normal font
    normalStyle:{
        font : ``,
        color:'#000',
        lineheight: 100,
    },

    // 大字样式；
    // the style of contained in <b></b>
    largeStyle:{
        font : '',
        color:'#000',
        lineheight: 100,
    },

    // 位置系数，相对于画布；
    // the position of text on canvas;
    pos:{
    	 // 相对于画布的坐标点，原点为左上点;
    	 // 支持多种值：
    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
        x:0,
        y:0,
    },
};
```
#### 5、 `draw(fn)`:

绘制函数，`add`/`watermark`/`text` 方法都需要在末尾调用该方法进行绘制,且该函数包含导出功能，回调中可直接得到结果图的 `base64` ;

params:

```js
// 由于异步的缘故，因此只有在该回调中，才能取到 base64 和 各项配置系数；
mc.draw(b64 =>{

})
```


### 暴露属性

##### 1、`mc.canvas`: 画布使用的canvas type:HTMLCanvasElement;

##### 2、`mc.ctx`: 画布；

##### 3、`mc.textData` :  文字数据 type:object；
