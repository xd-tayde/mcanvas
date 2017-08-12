# Mcanvas.js  [中文版文档](./README_ZH.md)

 **[Example](http://f2er.meitu.com/gxd/mcanvas/example/index.html)**

 **[Git](https://github.com/xd-tayde/mcanvas)**

## Introduction

Mcanvas is a plugin that can easily compose the image, text, watermark and export a image of base64 finally. It provides some simple api that based on canvas, in order to make your work more efficiently and conveniently.

## Installation

- You can download the latest version from the [GitHub](https://github.com/xd-tayde/mcanvas/blob/master/dist/mcanvas.min.js) 
- use a npm [CDN](https://unpkg.com/mcanvas@1.1.3/dist/mcanvas.min.js).
- Or you can install via npm:

```js
npm install chart.js --save
```

## Basic Usage

```js
// create the canvas by width and height;
let mc = new MC(width,height);

// prepare background-image
mc.background({
    image:'',
    left:0,
    top:0,
    color:'#000000',
    type:'origin',
})

// prepare the image material, add into queue;
.add('images/nose.png',{
    width:183,
    pos:{
        x:250,
        y:369,
        scale:0.84,
        rotate:1,
    },
})

// add text;
.text('normal<br><s>smallsmall</s>',{
    width:'300px',
    align:'center',
    pos:{
        x:0,
        y:0,
	  },
})

// prepare watermark;
.watermark(img ,{
    width:'40%',
    pos:'rightBottom',
})

// draw all material that prepared before, and get the base64-image
.draw( b64 =>{
	 console.log(b64);
});
```

## API

### create instance

#### `new MCanvas(width,height)` || `MCanvas(width,height)`:

create the canvas by width and height;

params:

	// the width of origin canvas;
	width : type : Number; 
			 Default : 500; 
			 required;

	// the height of origin canvas;
	height: type : Number; 
			Default : width; 
			optional;

### function

#### 1、 `mc.background(bg)`:

prepare background-image；

bg: optional ，default: init-bg；

> if you use `mc.background(bg)` before , then you can use `mc.background()` to reset to the init background. otherwise,
> init background-image without params if you use `mc.background(bg)` before, it can reset to the init background;

params:

```js
bg : {
	// background-image,
	// type: url/HTMLImageElement/HTMLCanvasElement
    image:'' ,

    // type: origin / crop / contain
    	// origin : the width and height of canvas will be same as the image naturalWidth and naturalHeight, the init width and height will be invalid;
    	// crop : the image will covered with the canvas, can control crop by left and top;
    	// contain : the same as background-size:contain; can control postion by left and top;
    type:'origin',

    // the distance of leftTop corner of canvas;
    left:0,
    top:0,

    // the background-color of canvas;
    color:'#000000',
}
```

> TIPS：`background()` can use without `draw()`;

#### 2、`add(image,options)`/`add([{image:'',options:{}},{image:'',options:{}}])`:

prepare the source to draw on canvas;

params:

```js
// source，type: url/HTMLImageElement/HTMLCanvasElement
image : '',

options : {

	// example: width: 100 / '100%' / '100px';
    width:'100%',

    // crop params;
    crop:{
    	 // the distance to leftTop corner of source-image
        x:0,
        y:0,

        // example:100/'100%'/'100px'；
		 // the width and height will to be croped;
        width:'100%',
        height:'100%',
    },

    // position of source image;
    pos:{
    	 // example：
    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
        x:0,
        y:0,

        // scale based on center point of source；
        scale:1,

        rotate:0,
    },
}

```
#### 3、`watermark(image,options)`:

prepare the watermark;

params:

```js
// type: url/HTMLImageElement/HTMLCanvasElement
image : '',

options:{
	// there must use percentage on canvas；
		// type : string
		// Default : '40%';
	width:'100%',

	// position
		// leftTop/leftBottom/rightTop/rightBottom;
		// type : string
		// Default : 'rightBottom';
	pos : 'leftTop',

	// the margin to border of canvas;
		// type : Number
		// Default : 20;
	margin :
}
```


#### 4、`text(context,options)`:

prepare the text;and you can use `<b>/<s>/<br>`;

params:

```js
// context，there provide 3 style of large/normal/small;
	// <b></b> : largeStyle  |  <s>小字</s> : smallStyle |  <br>
context : '<b>big</b>normal<br><s>small</s>',

options:{
	 // the width of text line;
	 // example :  width: 100 / '100%' / '100px';
    width : 300,

    // align of text line; 
    // 'left'/'center'/'right';
    align : 'left',
    
    // the default normal font-size is 5% of the width of canvas;
    // smallStyle is 0.9 on normal;
    // largeStyle is 1.2 on normal;
    // default font-family is helvetica neue,hiragino sans gb,Microsoft YaHei,arial,tahoma,sans-serif;
    // default color is black;
    // lineheight is 1.1 on largeStyle;

	 // and you can set the style;
    // the style of contained in <s></s>
    smallStyle:{
        font : ``,
        color:'#000',
        lineheight: 100,
    },

    // the style of normal font
    normalStyle:{
        font : ``,
        color:'#000',
        lineheight: 100,
    },

    // the style of contained in <b></b>
    largeStyle:{
        font : '',
        color:'#000',
        lineheight: 100,
    },

    // the position of text on canvas;
    pos:{
    	 // example：
    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
        x:0,
        y:0,
    },
};
```
#### 5、 `draw(fn)`:

final function ，`add`/`watermark`/`text` must use the `draw()` on the end, and it will export a base64 image that you can use in callback;

params:

```js
mc.draw(b64 =>{

})
```

## License

[MIT](https://opensource.org/licenses/MIT)
