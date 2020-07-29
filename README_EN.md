# Document

## Create Instance

#### `new MCanvas(options)`:

create the canvas;

usage: 

```js
const mc = new MCanvas(options: {
    width?: number,
    height?: number,
    backgroundColor?: string,
})
```

## API

#### 1、 `mc.background(image, options)`:

prepare background-image；

> if you use `mc.background(bg)` before , then you can use `mc.background()` to reset to the init background.

usage:

```js
mc.background(
    image: string | HTMLImageElement | HTMLCanvasElement, 
    options?: {
    
        // type: origin / crop / contain
            // origin : the width and height of canvas will be same as the image naturalWidth and naturalHeight, the init width and height will be invalid;
            // crop : the image will covered with the canvas, can control crop by left and top;
            // contain : the same as background-size:contain; can control postion by left and top;
			
		type?: 'origin' | 'crop' | 'contain' ,

        // the distance of leftTop corner of canvas;
        // 100 / '100%' / '100px'	
        // can use 0% / 50% / 100% to crop by left / center / right;
		
		left?: number | string,
		top?: number | string,

		// the background-color of canvas;
		color?: string,
	}
)
```

#### 2、`add(image, options)`:

prepare the source to draw on canvas;

usage:

```js
mc.add(
	image: string | HTMLImageElement | HTMLCanvasElement,
	options: {

        // eg. width: 100 / '100%' / '100px';
	    width?: number | string,
	
	    crop?: {
	    	// the distance to leftTop corner of source-image
	        x?: number | string,
	        y?: number | string,
	
	        // example: 100/'100%'/'100px'；
		    // the width, height and radius of the the croped area;
	        width?: number | string,
	        height?: number | string,
	        radius?: number | string
	    },
	
	    // position of source image;
	    pos?: {
	    	 // eg. x: 250 / '250px' / '100%' / 'left:250' / 'center',
	        x?: number | string,
	        y?: number | string,
	
	        // scale based on center point of source；
	        scale?: number | string,

	        rotate?: number | string,
	    },
	}
)
```

#### 3、`watermark(image,options)`:

prepare the watermark;

```js
mc.watermark(
	image: url/HTMLImageElement/HTMLCanvasElement,
	
	options: {
		// there must use percentage on canvas；
		    // Default : '40%';
		width?: string,
	
		// position
		    // Default : 'rightBottom';
		pos?: 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom',
	
		// the margin to border of canvas;
    		// Default : 20;
		margin?: number,
	}
)
```

#### 4、`text(context,options)`:

prepare the text and you can use `<b>/<s>/<br>`;

```js
mc.text(
    // context，there provide 3 style of large/normal/small;
        // <b></b> : largeStyle  |  <s>small</s> : smallStyle |  <br>
	context: '<b>大字大字大字</b>常规字体<br>换行<s>小字小字小字</s>',
	options: {
        // the width of text line;
        // example :  width: 100 / '100%' / '100px';
	    width?: string | number,
	
	    // align of text line;
	    align?: 'left' | 'center' | 'right',
	
        // and you can set the style of text use smallStyle / normalStyle / largeStyle;
        
        // for example
        // the style of contained in <s></s>
	    normalStyle?: {
	
	    	// font style same as css font
	        font?: string,
	
	        // font color
	        color?: string,
	
	        lineheight?: number,
	
	        type?: 'fill' | 'stroke',
	
	        // the width of text's stroke;
			lineWidth?: number,
			
			// word break when changes line, default: true;
			wordBreak?: boolean,
	
	        shadow?: {
	            color?: string,
	            blur?: number,
	            offsetX?: number,
	            offsetY?: number,
	        },
	
	        gradient?: {
		        type?: 1 | 2,  // 1: horizontal 2: vertical
		        colorStop?: string[] // eg. ['red','blue'],
		    },
	    },
	
	    // the position of text on canvas;
	    pos?: {
	        x?: string | number,
	        y?: string | number,
	        rotate?: string | number,
	    },
	},
)
```

#### 5、`mc.rect(ops)`

draw a rectangle；

```js
mc.rect(
	options: {
		// x: 250 / '250px' / '100%' / 'left:250' / 'center',
		x?: string | number,
		y?: string | number,
	
		width?: string | number,
		height?: string | number,
	
		strokeWidth?: number,
		strokeColor?: string,
	
		fillColor?: string,
	}
)
```

#### 6、`mc.circle(ops)`

draw a circle;

```js
mc.circle(
	options: {
		x?: string | number,
		y?: string | number,
	
		radius?: string | number ,
	
		strokeWidth?: string | number,
		strokeColor?: string,
	
		fillColor?: string,
	}
)
```

#### 7、 `draw(fn)`:

final function ，`add`/`watermark`/`text` must use the `draw()` on the end, and it will export a base64 image，now has supported Promise.

- `Promise`

```js
const base64 = await mc.draw(options)

// or
mc.draw(options).then(console.log)
```

- `Callback`

```js
// 由于异步的缘故，使用回调，获取 base64；
mc.draw(
	options: {
        // the type of export image;
		// default: jpg;
			// if you want to have transparent background, you should choose png
	    type?: 'png' | 'jpg',
	
        //  the quality of export image : 0~1；
            //  it's invalid to png type;
            // default: .9;
	    quality?: number,
	
	    success?: (b64: string) => void,
	    error?: (err: any) => void	
	}
)
```

## MImage: 图片处理

MImage is a small image handle tool, contains compress、crop and filter.

```js
import { MImage } from 'mcanvas'

const mi = new MImage('imageUrl')
```

### 1. mi.filter(type, data?)

- `blur`

```js
// blurValue: 1 ~ 10
mi.filter('blur', blurValue: number = 6)
```

- `flip`

```js
// dire
	// hor: horizontal
	// ver: vertical
mi.filter('flip', dire: 'hor' | 'ver' = 'hor')
```

- `gray`

```js
mi.filter('gray')
```

- `mosaic`

```js
mi.filter('mosaic', blockSize: number = 10)
```

- `oil`

```js
// range: 1 ~ 5
// levels: 1 ~ 256
mi.filter('oil', range: number = 2, levels: number = 32)
```

### 2. mi.crop(options)

```js
mi.crop(
	options: {
        x?: number | string 
        y?: number | string
        
        width?: number | string
        height?: number | string
        
        radius?: number | string
    } 
)
```

### 3. mi.compress(options)

```js
mi.compress(
	options: {
		quality?: number,
		
        width?: number,
        height?: number,
    }
)
```

### 4. mi.draw(options)

export image, the usage is same as the mcanvas.draw().