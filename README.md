# Mcanvas.js

 **[Example](http://f2er.meitu.com/gxd/mcanvas/example/index.html)**

 **[Git](https://github.com/xd-tayde/mcanvas)**

## Document

[English](https://github.com/xd-tayde/mcanvas/blob/master/README_EN.md) | [中文版](https://github.com/xd-tayde/mcanvas/blob/master/README_ZH.md)

## Introduction

Mcanvas is a plugin that can easily compose the image, text, watermark and export a image of base64 finally. It provides some simple api that based on canvas, in order to make your work more efficiently and conveniently.

## Installation

- You can download the latest version from the [GitHub](https://github.com/xd-tayde/mcanvas/blob/master/dist/mcanvas.min.js)
- use a npm [CDN](https://unpkg.com/mcanvas/dist/mcanvas.min.js).
- Or you can install via npm:

```js
npm install mcanvas --save
```

## Basic Usage

```js
// create the canvas by width and height;
let mc = new MC({
	width,
	height,
	backgroundColor,
});

// prepare background-image
mc.background(image,{
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

## License

[MIT](https://opensource.org/licenses/MIT)
