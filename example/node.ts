import { MImage, MCanvas } from '@Src/index'
const path = require('path');

(async () => {
    // const imgSrc = path.resolve(__dirname, './images/1.jpg')
    // const mc = new MImage(imgSrc)
    // const b64 = await mc.crop({
    //     x: 100,
    //     y: 100,
    //     width: 300,
    //     height: 300,
    //     radius: 0,
    // }).filter('blur').draw()
    // console.log(b64)

    const ear = path.resolve(__dirname, './images/ear.png')
    const water = path.resolve(__dirname, './images/watermark.jpg')
    const mc = new MCanvas()
    mc.background('http://mtapplet.meitudata.com/596c72073971d86b5128.jpg', {
        type: 'origin',
    })
    mc.add(ear, {
        width: 482,
        // crop: {
        //     x: 192,
        //     y: 84,
        //     width: 365,
        //     height: 365,
        //     radius: '50%',
        // },
        pos: {
            x: 150,
            y: 50,
            scale: 1,
            rotate: 0,
        },
    })
    mc.watermark(water, {
        width: '40%',
        pos: 'rightBottom',
    })
    mc.rect({
        x: 0,
        y: 'bottom:0',
        width: '100%',
        height: 300,
        radius: 30,
        strokeWidth : 5,
        strokeColor: '#996699',
        fillColor: 'rgba(0,0,0,.5)',
    })
    mc.circle({
        x: 'center',
        y: 'center',
        radius: 100,
        strokeWidth : 5,
        strokeColor: '#996699',
        fillColor: 'rgba(0,0,0,.5)',
    })
    mc.text('<b>Large/Stroke</b><br>Normal/Gradient<br><s>Small/Shadow</s>', {
        width: '600',
        align: 'center',
        largeStyle: {
            color: 'red',
            font: '90px Microsoft YaHei,sans-serif',
            type: 'stroke',
            lineWidth: 2,
            lineHeight : 90,
        },
        normalStyle: {
            color: 'blue',
            font: '70px Microsoft YaHei,sans-serif',
            lineHeight : 70,
            // shadow:{
            //     color: 'red',
            //     blur: 4,
            //     offsetX: 2,
            //     offsetY: 2,
            // },
            gradient: {
                type: 2,  // 1: 横向渐变； 2: 纵向渐变；
                colorStop: ['red', 'blue'],
            },
        },
        smallStyle: {
            color: 'yellow',
            font: '50px Microsoft YaHei,sans-serif',
            lineHeight : 50,
            shadow: {
                color: 'red',
                blur: 10,
                offsetX: 5,
                offsetY: 5,
            },
        },
        pos: {
            x: 'center',
            y: 'bottom',
            rotate: 0,
        },
    })
    const b64 = await mc.draw()
    console.log(b64)
})()