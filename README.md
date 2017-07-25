# 图片合成插件 MCanvas.js

> [demo](http://f2er.meitu.com/gxd/mcanvas/example/index.html)
> 
> [git地址](https://gitlab.meitu.com/npm/meitu-mcanvas);

## 项目简介：

在业务中，经常遇到各种合成图片的需求，如贴纸的合成，合成文字，添加水印等，因为这些业务经常需要进行各种位置，状态等参数的计算，写起来并不是那么方便。该插件就是为了解决这部分难点，封装底层api及各种计算，提供出使用更为简单的API，减少项目上的重复工作，提高效率；

## 更新内容：

## 使用方式：

由于图片的合成是异步且严格遵循顺序的，因此将使用的形式设计成了链式的方式，这种方式更为语义化且符合逻辑；首先需要一系列的素材准备，将要绘制的素材 `add` 进队列中，最后再调用 `draw()` 进行绘制及导出；

```js

	// 创建画布，初始化 canvas；
	
	let mc = new MC(width,height);
	
	// backgournd : 准备底图；提供多种模式
	
	mc.background({
        image:'',
        left:0,
        top:0,
        color:'#000000',
        type:'origin',})
      
      // add 添加图片素材基础函数；
      
      .add('images/nose.png',{
        width:183,
        pos:{
            x:250,
            y:369,
            scale:0.84,
            rotate:1,
        },})
        
      // text 添加文字数据基础函数；
 
       .text('郭晓东<br><s>啊啊啊</s>',{
        width:'300px',
        align:'center',
        pos:{
            x:0,
            y:0,
        },})
       
       // watermark 添加水印函数，基于 add 函数封装；
        
     	.watermark(img ,{
        width:'40%',
        pos:'rightBottom',})
        
       // draw 最终绘制函数，用于最终的绘制；
        
       .draw( b64 =>{
       
        	console.log(b64);
        	
    	});

```

### API文档：

### 创建实例：

#### `new MCanvas(width,height)`;

创建画布，初始化 `Canvas` ;

params:

	width : 画布初始宽度;
		type : Number; Default : 500; required;
	height: 画布初始高度;
		type : Number; Default : width; optional;
	
### 方法：
	
#### 1、 `mc.background(bg)`;

绘制画布的底图；

bg 为可选参数，如果不填，则使用 默认参数；

每次绘制背景后，都会将参数储存为 默认值，因此可以通过不传值调用该函数来恢复背景图初始化；

params:
	
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
   		
TIPS：该方法可独立使用，无需通过 `draw()`;

#### 2、`add(image,options)`/`add([{image:'',options:{}},{image:'',options:{}}])`;
   
通用的添加图层函数，可使用上面两种调用方式，添加多张或者单张素材；

params:
	
		// 素材图，type: url/HTMLImageElement/HTMLCanvasElement
		image : ''
		
		// 配置参数：
		options : {
		
		// 素材的宽度值，相对于画布；
		// 支持3种值  width: 100 / '100%' / '100px';
	    width:'100%',
	    
	    // 裁剪系数，相对于素材图；
	    crop:{
	    
	    	 // 相对于素材图的坐标点，原点为左上点；
	        x:0,
	        y:0,
	        
	        // 需要裁剪的宽高，同样支持 100/'100%'/'100px' 3种值；
	        // 内部有做最大值的判断；
	        width:'100%',
	        height:'100%',
	    },
	    
	    // 位置系数，相对于画布；
	    pos:{
	    	
	    	 // 相对于画布的坐标点，原点为左上点;
	    	 // 支持多种值：
	    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
	        x:0,
	        y:0,
	        
	        // 素材放大值，会叠加 width 值，进行进一步基于中心点放大；
	        scale:1,
	        
	        // 素材旋转角度；
	        rotate:0,
	    },
	};

#### 3、`watermark(image,options)`:

添加水印函数，基于 `add()` 封装，使用更便携方便；

params:
	
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
	
	
#### 4、`text(context,options)`:

添加文字函数；

params:
	
	// 文字内容，支持配置三种字体样式，big/normal/small;
	// 通过标签的形式进行配置；
	// <b></b> : 大字  |  <s>小字</s> : 小字 |  <br>：换行
	
	context : '<b>大字大字大字</b>常规字体<br>换行<s>小字小字小字</s>',
	
	options:{
	
		 // 定义文字每行的宽度值，相对于画布；
		 // 支持3种值  width: 100 / '100%' / '100px';
        width : 300,
        
        // 每一行文字的 align 值
        // 'left'/'center'/'right';
        align : 'left',
        
        // 为了自适应，默认常规字体大小为 画布 宽度值的 5%;
        // 小字为常规字体的 0.9倍；
        // 大字为常规字体的 1.2倍；
        // 字体样式默认为 `helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif`;
        // 字体颜色默认为 黑色；
        
        // 可通过以下参数进行配置；
        // 小字的样式
        smallStyle:{
            font : ``,
            color:'#000',
            lineheight: 100,
        },
        
        // 常规字体的样式
        normalStyle:{
            font : ``,
            color:'#000',
            lineheight: 100,
        },
        
        // 大字样式；
        bigStyle:{
            font : '',
            color:'#000',
            lineheight: 100,
        },
        
        // 位置系数，相对于画布；
        pos:{
        
        	 // 相对于画布的坐标点，原点为左上点;
	    	 // 支持多种值：
	    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
            x:0,
            y:0,
        },
    };
    
#### 5、 `draw(fn)`:

绘制函数，`add`/`watermark`/`text` 方法都需要再后面调用该方法进行绘制,且该函数包含导出功能，回调中可直接得到结果图的 `base64` ;

params:
	
	// 由于异步的缘故，因此只有在该回调中，才能取到 base64 和 各项配置系数；
	fn: (base64)=>{};


### 暴露属性

#### 1、`mc.canvas`: 画布使用的canvas type:HTMLCanvasElement;

#### 2、`mc.ctx`: 画布；

#### 3、`mc.textData` :  文字数据 type:object；

#### 4、`mc.bgConfig` : 背景图参数 type:object;


	
   		




	