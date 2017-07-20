import MCanvas from '../src/index';

let mc = new MCanvas(1000);

// mc.initBg().await();
let img = new Image();
img.onload = ()=>{
    mc.background({
        image:'http://mtapplet.meitudata.com/596c72073971d86b5128.jpg',
        left:0,
        top:0,
        color:'#000000',
        type:'origin',
    }).add('images/ear.png',{
        width:482,
        pos:{
            x:150,
            y:58,
            scale:1,
            rotate:1,
        },
    }).add('images/neck.png',{
        width:277,
        pos:{
            x:213,
            y:557,
            scale:1,
            rotate:1,
        },
    }).add('images/nose.png',{
        width:183,
        pos:{
            x:250,
            y:369,
            scale:0.84,
            rotate:1,
        },
    }).text('郭晓东',{
        width:100,

    }).watermark(img ,{
        width:'40%',
        pos:'rightBottom',
    }).draw( b64 =>{
        $('.js-result').attr('src',b64);
    });
};
img.src = 'images/watermark.jpg';
