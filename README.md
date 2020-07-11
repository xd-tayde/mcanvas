# mcanvas

New version 2.0.0 is coming. It contains some new features:

- Support new function:
    - image merge；
    - image compress；
    - image crop;
    - image filter;
- Support usage in node.js；
- .draw() support usage by promise;
- Rewrite in typescript;

 **[Example](http://guoxiaodong.net/)**

 **[Git](https://github.com/xd-tayde/mcanvas)**

## Document

[English](https://github.com/xd-tayde/mcanvas/blob/master/README_EN.md) | [中文版](https://github.com/xd-tayde/mcanvas/blob/master/README_ZH.md)

## Introduction

mcanvas is a image handler plugin that can easily merge, crop, compress, filter the image and export a image of base64 finally. It provides some simple api that based on canvas, in order to make your work more efficiently and conveniently.

## Installation

- You can download the latest version from the [GitHub](https://github.com/xd-tayde/mcanvas/blob/master/dist)
- use a npm CDN [Web](https://unpkg.com/mcanvas/dist/mcanvas.web.js) and use `window.MCanvas`

- Or you can install via npm:

```js
npm install mcanvas --save

import { MCanvas } from 'mcanvas'
```

## Basic Usage

- `MCanvas`

```js
// create the canvas by width and height;
import { MCanvas } from 'mcanvas'

const mc = new MCanvas({
	width,
	height,
	backgroundColor,
});

// prepare background-image
mc.background(image, {
    left: 0,
    top: 0,
    color: '#000000',
    type: 'origin',
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
.draw(b64 =>{
    console.log(b64);
});
```
- `MImage`

```js
// image handler
    // inclue crop / compress / common filter
import { MImage } from 'mcanvas'

const mi = new MImage('http://mtapplet.meitudata.com/596c72073971d86b5128.jpg')

mi.filter('blur')
// crop to area by 300 * 300 and center in origin image
.crop({
    x: 'center',
    y: 'center',
    width: 300,
    height: 300,
    radius: 10,
})
// compress into a image that width is 200px and quality is 0.9
.compress({
    width: 200,
    quality: .9,
})
// get the base64-image
.draw(b64 => {
    console.log(b64)
})
```

## License

[MIT](https://opensource.org/licenses/MIT)
