# 极简图片合成/裁剪插件--mcanvas.js

### [demo](http://f2er.meitu.com/gxd/mcanvas/example/index.html) [详细文档](./README.md)


> Tips: 请使用移动端模式；

在业务中，经常遇到各种合成图片的需求，如贴纸的合成，添加文字注释，添加水印等，因为这些业务经常需要进行各种位置，状态等参数的计算，写起来并不是那么方便。该插件就是为了解决这部分难点，封装底层 `API` 及各种计算，提供出使用更为简单的 `API`，减少项目上的重复工作，提高效率；

希望大家喜欢，有什么问题及时提issue，随时和我联系哈。~~



使用方式：

```js
MC(width,height)
.background({
    image:'',
    left:0,
    top:0,
    color:'#000000',
    type:'origin',
})
.add('images/nose.png',{
    width:183,
    pos:{
        x:250,
        y:369,
        scale:0.84,
        rotate:1,
    },
})
.text('啦啦啦<br><s>啊啊啊</s>',{
	width:'300px',
	align:'center',
	pos:{
	    x:0,
	    y:0,
	},
})
.watermark(img ,{
    width:'40%',
    pos:'rightBottom',
})
.draw( b64 =>{
	 console.log(b64);
});
```
