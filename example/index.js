import MCanvas from '../src/index';

let $sure = $('.js-sure');
let $params = $('.js-params');
let $dialog = $('.js-dialog');
let $result = $('.js-result');
let $cancel = $('.js-cancel');
let $clear = $('.js-clear');

let data = {
    addImageOps : {
        image:'./images/ear.png',
        // image:'https://mtapplet.meitudata.com/59c8c479521876738.jpg',
        options:{
            width:482,
            pos:{
                x:150,
                y:58,
                scale:1,
                rotate:1,
            },
        },
    },
    addWmOps : {
        image:'images/watermark.jpg',
        options:{
            width:'40%',
            pos:'rightBottom',
        },
    },
    addRectOps:{
        x: 0,
        y: 'bottom:0',
        width: '100%',
        height: 300,
        strokeWidth : 5,
        strokeColor: '#996699',
        fillColor: 'rgba(0,0,0,.5)',
    },
    addCircleOps:{
        x: 'center',
        y: 'center',
        r: 100,
        strokeWidth : 5,
        strokeColor: '#996699',
        fillColor: 'rgba(0,0,0,.5)',
    },
    addTextOps : {
        // text:'<b>A</b>BBBBB<s>MCanvas.js</s>',
        text:'<b>Large/Stroke</b><br>Normal/Gradient<br><s>Small/Shadow</s>',
        options:{
            width:'600',
            align:'center',
            largeStyle:{
                color:'red',
                font: '90px Microsoft YaHei,sans-serif',
                type: 'stroke',
                lineWidth: 2,
                lineHeight : 90,
            },
            normalStyle:{
                color:'blue',
                font:'70px Microsoft YaHei,sans-serif',
                lineHeight : 70,
                // shadow:{
                //     color: 'red',
                //     blur: 4,
                //     offsetX: 2,
                //     offsetY: 2,
                // },
                gradient:{
                    type: 2,  // 1: 横向渐变； 2: 纵向渐变；
                    colorStop: ['red','blue'],
                },
            },
            smallStyle:{
                color:'yellow',
                font:'50px Microsoft YaHei,sans-serif',
                lineHeight : 50,
                shadow:{
                    color: 'red',
                    blur: 10,
                    offsetX: 5,
                    offsetY: 5,
                },
            },
            pos:{
                x:'center',
                y:'bottom:400',
                rotate: 0,
            },
        },
    },
};

let mc = new MCanvas({
    width: 1000,
    height: 1500,
    // backgroundColor: 'black',
});
mc.background('http://mtapplet.meitudata.com/596c72073971d86b5128.jpg',{
// mc.background('http://mtapplet.meitudata.com/59e8765b6492c541.jpg',{
    type:'origin',
    left:'50%',
    top:'50%',
});

let timer;
$('.Button').on('touchstart',function(){
    $(this).addClass('taped');
    timer = setTimeout(()=>{
        $(this).removeClass('taped');
    },2000);
});
$('.Button').on('touchend',function(){
    $(this).removeClass('taped');
    clearTimeout(timer);
});

$cancel.on('click',()=>{
    $dialog.hide();
});

$clear.on('click',()=>{
    // mc.clear();
    mc.background().clear().draw(b64=>{
        $result.attr('src',b64);
    });
});

$('.js-addImage').on('click',()=>{
    let type = `image`;
    showDialog(type,data.addImageOps);
});

$('.js-addWm').on('click',()=>{
    let type = `watermark`;
    showDialog(type,data.addWmOps);
});

$('.js-addText').on('click',()=>{
    let type = `text`;
    showDialog(type,data.addTextOps);
});

$('.js-addRect').on('click',()=>{
    mcDraw(data.addRectOps, 'rect');
});

$('.js-addCircle').on('click',()=>{
    mcDraw(data.addCircleOps, 'circle');
});

$sure.on('click',function(){
    let ops = $(this).data('ops');
    let type = $(this).data('type');
    mcDraw(ops,type);
});

function mcDraw(ops,type){
    let img;
    switch (type) {
        case `image`:
            img = new Image();
            img.crossOrigin = '*';
            img.onload = function(){
                mc.add(img,ops.options).draw({
                    type:'jpg',
                    quality:.9,
                    success(b64){
                        $result.attr('src',b64);
                        $dialog.hide();
                    },
                    error(err){
                        console.log('error', err);
                    },
                });
            };
            img.src = ops.image;
            break;
        case `watermark`:
            mc.watermark(ops.image,ops.options).draw(b64=>{
                $result.attr('src',b64);
                $dialog.hide();
            });
            break;
        case `text`:
            mc.text(ops.text,ops.options).draw(b64=>{
                $result.attr('src',b64);
                $dialog.hide();
            });
            break;
        case `rect`:
            mc.rect(ops).draw(b64=>{
                $result.attr('src',b64);
                $dialog.hide();
            });
            break;
        case `circle`:
            mc.circle(ops).draw(b64=>{
                $result.attr('src',b64);
                $dialog.hide();
            });
            break;
        default:
    }

}

function showDialog(type,ops){
    let tab = `&nbsp;&nbsp;&nbsp;&nbsp;`;
    let html;
    switch (type) {
        case 'image':
            html = `<li>image:'${ops.image}'</li>
                    <li>options:{</li>
                    <li>${tab}width:<input data-type='width' class='js-input input' type='text' value='${ops.options.width}'></li>
                    <li>${tab}pos:{</li>
                    <li>${tab+tab}x:<input data-type='x' class='js-input input' type='text' value='${ops.options.pos.x}'></li>
                    <li>${tab+tab}y:<input data-type='y' class='js-input input' type='text' value='${ops.options.pos.y}'></li>
                    <li>${tab+tab}scale:<input data-type='scale' class='js-input input' type='text' value='${ops.options.pos.scale}'></li>
                    <li>${tab+tab}rotate:<input data-type='rotate' class='js-input input' type='text' value='${ops.options.pos.rotate}'></li>
                    <li>${tab}}</li>
                    <li>}</li>`;
            break;
        case 'watermark':
            html = `<li>image:'${ops.image}'</li>
                    <li>options:{</li>
                    <li>${tab}width:<input data-type='width' class='js-input input' type='text' value='${ops.options.width}'></li>
                    <li>${tab}pos:
                        <select data-type='pos' class='js-select select'>
                            <option>rightBottom</option>
                            <option>rightTop</option>
                            <option>leftBottom</option>
                            <option>leftTop</option>
                        </select>
                    <li>}</li>`;
            break;
        case 'text':
            html = `<li>text:<span style="font-size:12px;">''&lt;b&gt;Large/Stroke&lt;/b&gt;Normal/Gradient&lt;s&gt;Small/Shadow&lt;/s&gt;''</span></li>
                    <li>options:{</li>
                    <li>${tab}width:<input data-type='width' class='js-input input' type='text' value='${ops.options.width}'></li>
                    <li>${tab}align:
                        <select data-type='align' class='js-select select'>
                            <option>left</option>
                            <option>center</option>
                            <option>right</option>
                        </select>
                    </li>
                    <li>${tab}pos:{
                    <li>${tab+tab}x:<input data-type='x' class='js-input input' type='text' value='${ops.options.pos.x}'></li>
                    <li>${tab+tab}y:<input data-type='y' class='js-input input' type='text' value='${ops.options.pos.y}'></li>
                    <li>${tab}}</li>
                    <li>}</li>`;
            break;
        default:
    }
    $params.html(html);
    $sure.data('ops',JSON.stringify(ops)).data('type',type);
    $dialog.show();
}

$(window).on('input','.js-input',function(){
    let $this = $(this);
    let v = $this.val();
    let type = $this.data('type');
    let ops = $sure.data('ops');
    switch (type) {
        case 'width':
            ops.options.width = v;
            break;
        case 'x':
            ops.options.pos.x = v;
            break;
        case 'y':
            ops.options.pos.y = v;
            break;
        case 'scale':
            ops.options.pos.scale = v;
            break;
        case 'rotate':
            ops.options.pos.rotate = v;
            break;
        case 'align':
            ops.options.align = v;
            break;
        default:
    }
    $sure.data('ops',JSON.stringify(ops));
});

$(window).on('focus','.js-input',function(){
    $(this).addClass('focus');
});
$(window).on('blur','.js-input',function(){
    $(this).removeClass('focus');
});

$(window).on('change','.js-select',function(){
    let ops = $sure.data('ops');
    let type = $(this).data('type');
    ops.options[type] = $(this).val();
    $sure.data('ops',JSON.stringify(ops));
});

// let mc1 = new MCanvas({
//     width: 750,
//     height: 1143,
// });
// mc1.background('images/share-bg.jpg', {
//     width: '100%',
//     type: 'origin',
// }).add('http://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTLvbgsiba9Ruka9ryibevLia9c6RBhtOOztTgPQeSLdPwfaGIKHMxRNiam6VyuNictTib4fYRD1CNJZia2gQ/132', {
//     width: 171,
//     pos: {
//         x: 280,
//         y: 329,
//     },
// }).add('images/mask.png', {
//     width: 216,
//     pos: {
//         x: 238,
//         y: 323,
//     },
// }).text('班主任指着XX对全班说：你们要记住他，毕业之后就没有机会遇到这么优秀的人了！', {
//     width: 442,
//     align: 'left',
//     normalStyle: {
//         color: '#000',
//         font: '30px Microsoft YaHei,sans-serif',
//         lineHeight : 40,
//     },
//     pos: {
//         x: 'center',
//         y: 766,
//     },
// }).text('内秀30%', {
//     width: 145,
//     align: 'left',
//     normalStyle: {
//         color: '#000',
//         font: '24px Microsoft YaHei,sans-serif',
//     },
//     pos: {
//         x: 110,
//         y: 323,
//     },
// }).text('未知属性3%', {
//     width: 180,
//     align: 'left',
//     normalStyle: {
//         color: '#000',
//         font: '24px Microsoft YaHei,sans-serif',
//     },
//     pos: {
//         x: 460,
//         y: 264,
//     },
// }).text('外秀67%', {
//     width: 180,
//     align: 'left',
//     normalStyle: {
//         color: '#000',
//         font: '24px Microsoft YaHei,sans-serif',
//     },
//     pos: {
//         x: 490,
//         y: 470,
//     },
// }).text('黄明照', {
//     width: 400,
//     align: 'center',
//     normalStyle: {
//         color: '#000',
//         font: '42px Microsoft YaHei,sans-serif',
//     },
//     pos: {
//         x: 160,
//         y: 522,
//     },
// }).text('德才兼秀', {
//     width: 316,
//     align: 'center',
//     normalStyle: {
//         color: '#fff',
//         font: '42px Microsoft YaHei,sans-serif',
//     },
//     pos: {
//         x: 212,
//         y: 658,
//     },
// }).draw({
//     type: 'jpg',
//     quality: .9,
//     success(b64) {
//         $result.attr('src', b64);
//         console.log(mc1);
//     },
// });

// let img = new Image();
// img.onload = ()=>{
    // mc.background({
    //     image:'http://mtapplet.meitudata.com/596c72073971d86b5128.jpg',
    //     left:0,
    //     top:0,
    //     color:'#000000',
    //     type:'origin',
    // }).add([{
    //     image:'images/ear.png',
    //     options:{
    //         width:482,
    //         pos:{
    //             x:150,
    //             y:58,
    //             scale:1,
    //             rotate:1,
    //         },
    //     },
    // },{
    //     image:'images/neck.png',
    //     options:{
    //         width:277,
    //         pos:{
    //             x:213,
    //             y:557,
    //             scale:1,
    //             rotate:1,
    //         },
    //     },
    // }]).add('images/nose.png',{
    //     width:183,
    //     pos:{
    //         x:250,
    //         y:369,
    //         scale:0.84,
    //         rotate:1,
    //     },
    // }).text('郭晓东<br><s>啊啊啊</s>我<br>我我<br><b>哦哦哦</b><s>啦啦啦</s>',{
    //     width:'300px',
    //     align:'center',
    //     pos:{
    //         x:0,
    //         y:0,
    //     },
    // }).watermark(img ,{
    //     width:'40%',
    //     pos:'rightBottom',
    // }).draw( b64 =>{
    //     $('.js-result').attr('src',b64);
    // });
// };
// img.src = 'images/watermark.jpg';
