# Document

## Create Instance

#### `new MCanvas(options)` || `MCanvas(options)`:

create the canvas;

params:

- {Object} options
	- {Number} width;
	- {Number} height;
	- {Color} backgroundColor;

用法: 

```js
MCanvas({
	width : 500, 
	height: 500,
	backgroundColor: '#fff',
})
```

## API

#### 1、 `mc.background(image,options)`:

prepare background-image；

options: optional ，default: init-bg；

> if you use `mc.background(bg)` before , then you can use `mc.background()` to reset to the init background.

usage:

```js

// background-image,
// type: url/HTMLImageElement/HTMLCanvasElement
mc.background(image,{

    // type: origin / crop / contain
    	// origin : the width and height of canvas will be same as the image naturalWidth and naturalHeight, the init width and height will be invalid;
    	// crop : the image will covered with the canvas, can control crop by left and top;
    	// contain : the same as background-size:contain; can control postion by left and top;
    type:'origin',

    // the distance of leftTop corner of canvas;
    // 100 / '100%' / '100px'	
    // can use 0% / 50% / 100% to crop by left / center / right;
    left:'50%',
    top:0,

    // the background-color of canvas;
    color:'#000000',
})
```

#### 2、`add(image,options)`/`add([{image:'',options:{}},{image:'',options:{}}])`:

prepare the source to draw on canvas;

usage:

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
	// <b></b> : largeStyle  |  <s>small</s> : smallStyle |  <br>
	
context : '<b>big</b>normal<br><s>small</s>',

options:{
	 // the width of text line;
	 // example :  width: 100 / '100%' / '100px';
    width : 300,

    // align of text line;
    // 'left'/'center'/'right';
    align : 'left',

	 // and you can set the style of text use smallStyle / normalStyle / largeStyle;
	 
	 // for example
	 // the style of contained in <s></s>
    smallStyle:{
    // font style same as css font, such as font-family/font-size...
        font : ``,
        
        // font color
        color:'#000',
        
        lineheight: 100,
        
         // type of text
        type: 'fill' | 'stroke',
        
        // the width of text's stroke;
        lineWidth: 1,
        
        // shadow of text
        shadow:{
            color: null,
            blur: 0,
            offsetX: 0,
            offsetY: 0,
        },
        
        // gradient of text
        gradient:{
	        type: 2,  // [1,2]
	        colorStop: ['red','blue'],
	     },
    },

    // the position of text on canvas;
    pos:{
    	 // example：
    	 // x: 250 / '250px' / '100%' / 'left:250' / 'center',
        x:0,
        y:0,
        rotate: 0,
    },
};
```

#### 5、`mc.rect(ops)`

draw a rectangle；

```js
ops: {
	// x: 250 / '250px' / '100%' / 'left:250' / 'center',
	x: 0,
	y: 0,
	
	width: '100%',
	height: '100%',
	
	strokeWidth : 1,

	strokeColor: '#fff',
	
	fillColor: '#fff',
}
```

#### 6、`mc.circle(ops)`

draw a circle;

```js
ops: {
	// x: 250 / '250px' / '100%' / 'left:250' / 'center',
	x: 0,
	y: 0,
	
	// radius : 100 / '100%' / '100px'
	r: 100,
	
	strokeWidth : 1,
	
	strokeColor: '#fff',

	fillColor: '#fff',
}
```

#### 7、 `draw(fn)`:

final function ，`add`/`watermark`/`text` must use the `draw()` on the end, and it will export a base64 image that you can use in callback;

params:

```js
mc.draw({
    // the type of export image :  png/jpg/jpeg/webp;
    // default : png;
    type: 'png',

    //  the quality of export image : 0~1；
	//  it's invalid to png type;
    // default: .9;
    quality: 1,
    
    success(b64){
        console.log(b64);
    }
    
    error(err){
    	console.log(err);
    }
})
```
