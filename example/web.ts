import { MCanvas, MImage } from '../src/index'
import ear from './images/ear.png'
import watermark from './images/watermark.jpg'
import imgTest from './images/1.jpg'
import './main.scss'

// (async () => {
//     const mc = new MImage('http://mtapplet.meitudata.com/596c72073971d86b5128.jpg')
//     const b64 = await mc.crop({
//         width: 300,
//         height: 300,
//         x: 0,
//         y: 0,
//     }).filter('blur').compress({
//         width: 100,
//         height: 100,
//     }).draw()
//     $('.js-result').attr('src', b64)
// })()

let $sure = $('.js-sure')
let $params = $('.js-params')
let $dialog = $('.js-dialog')
let $result = $('.js-result')
let $cancel = $('.js-cancel')
let $clear = $('.js-clear')

let data = {
    addImageOps : {
        image: ear,
        options: {
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
        },
    },
    addWmOps : {
        image: watermark,
        options: {
            width: '40%',
            pos: 'rightBottom',
        },
    },
    addRectOps: {
        x: 0,
        y: 'bottom:0',
        width: '100%',
        height: 300,
        radius: 30,
        strokeWidth : 5,
        strokeColor: '#996699',
        fillColor: 'rgba(0,0,0,.5)',
    },
    addCircleOps: {
        x: 'center',
        y: 'center',
        r: 100,
        strokeWidth : 5,
        strokeColor: '#996699',
        fillColor: 'rgba(0,0,0,.5)',
    },
    addTextOps : {
        // text:'<b>A</b>BBBBB<s>MCanvas.js</s>',
        text: '<b>Large/Stroke</b><br>Normal/Gradient<br><s>Small/Shadow</s>',
        options: {
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
        },
    },
    crop: {
        x: 'center',
        y: 'center',
        width: 300,
        height: 300,
        radius: 150,
    }
}
let mc = new MCanvas({
    width: 1000,
    height: 1500,
    // backgroundColor: 'black',
})
mc.background('http://mtapplet.meitudata.com/596c72073971d86b5128.jpg', {
// mc.background('http://mtapplet.meitudata.com/59e8765b6492c541.jpg',{
    type: 'origin',
    left: '50%',
    top: '50%',
})

const mi = new MImage('http://mtapplet.meitudata.com/596c72073971d86b5128.jpg')

let timer
$('.Button').on('touchstart', function(this: any) {
    $(this).addClass('taped')
    timer = setTimeout(() => {
        $(this).removeClass('taped')
    }, 2000)
})
$('.Button').on('touchend', function(this: any) {
    $(this).removeClass('taped')
    clearTimeout(timer)
})

$cancel.on('click', () => {
    $dialog.hide()
})

$clear.on('click', () => {
    // mc.clear();
    mc.background().clear().draw(b64 => {
        $result.attr('src', b64)
    })
})

$('.js-addImage').on('click', () => {
    showDialog(`image`, data.addImageOps)
})

$('.js-addWm').on('click', () => {
    showDialog(`watermark`, data.addWmOps)
})

$('.js-addText').on('click', () => {
    showDialog(`text`, data.addTextOps)
})

$('.js-addRect').on('click', () => {
    mcDraw(data.addRectOps, 'rect')
})

$('.js-addCircle').on('click', () => {
    mcDraw(data.addCircleOps, 'circle')
})

$sure.on('click', function(this: any) {
    let ops = $(this).data('ops')
    let type = $(this).data('type')

    mcDraw(ops, type)
})

function mcDraw(ops, type) {
    let img
    switch (type) {
        case `image`:
            img = new Image()
            img.crossOrigin = '*'
            img.onload = async () => {
                const b64 = await mc.add(img, ops.options).draw({
                    type: 'jpg',
                    quality: .9,
                })
                $result.attr('src', b64)
                $dialog.hide()
            }
            img.src = ops.image
            break
        case `watermark`:
            mc.watermark(ops.image, ops.options).draw(b64 => {
                $result.attr('src', b64)
                $dialog.hide()
            })
            break
        case `text`:
            mc.text(ops.text, ops.options).draw(b64 => {
                $result.attr('src', b64)
                $dialog.hide()
            })
            break
        case `rect`:
            mc.rect(ops).draw(b64 => {
                $result.attr('src', b64)
                $dialog.hide()
            })
            break
        case `circle`:
            mc.circle(ops).draw(b64 => {
                $result.attr('src', b64)
                $dialog.hide()
            })
            break
        case `crop`:
            mi.crop(ops).draw({
                type: 'png',
                success(b64) {
                    $('.js-cropResult').css('background-image', `url(${b64})`)
                    $dialog.hide()
                }
            })
            break
        default:
    }

}

function showDialog(type, ops) {
    let tab = `&nbsp;&nbsp;&nbsp;&nbsp;`
    let html
    switch (type) {
        case 'image':
            html = `<li>options: {</li>
                    <li>${tab + tab}width:<input data-type='width' class='js-input input' type='text' value='${ops.options.width}'></li>
                    <li>${tab + tab}pos: {</li>
                    <li>${tab + tab + tab + tab}x:<input data-type='x' class='js-input input' type='text' value='${ops.options.pos.x}'></li>
                    <li>${tab + tab + tab + tab}y:<input data-type='y' class='js-input input' type='text' value='${ops.options.pos.y}'></li>
                    <li>${tab + tab + tab + tab}scale:<input data-type='scale' class='js-input input' type='text' value='${ops.options.pos.scale}'></li>
                    <li>${tab + tab + tab + tab}rotate:<input data-type='rotate' class='js-input input' type='text' value='${ops.options.pos.rotate}'></li>
                    <li>${tab + tab}}</li>
                    <li>}</li>`
            break
        case 'watermark':
            html = `<li>options: {</li>
                    <li>${tab + tab}width:<input data-type='width' class='js-input input' type='text' value='${ops.options.width}'></li>
                    <li>${tab + tab}pos:
                        <select data-type='pos' class='js-select select'>
                            <option>rightBottom</option>
                            <option>rightTop</option>
                            <option>leftBottom</option>
                            <option>leftTop</option>
                        </select>
                    <li>}</li>`
            break
        case 'text':
            html = `<li>text: <span style="font-size:12px;">''&lt;b&gt;Large/Stroke&lt;/b&gt;Normal/Gradient&lt;s&gt;Small/Shadow&lt;/s&gt;''</span></li>
                    <li>options:{</li>
                    <li>${tab + tab}width:<input data-type='width' class='js-input input' type='text' value='${ops.options.width}'></li>
                    <li>${tab + tab}align:
                        <select data-type='align' class='js-select select'>
                            <option>left</option>
                            <option>center</option>
                            <option>right</option>
                        </select>
                    </li>
                    <li>${tab + tab}pos:{
                    <li>${tab + tab + tab + tab}x:<input data-type='x' class='js-input input' type='text' value='${ops.options.pos.x}'></li>
                    <li>${tab + tab + tab + tab}y:<input data-type='y' class='js-input input' type='text' value='${ops.options.pos.y}'></li>
                    <li>${tab + tab}}</li>
                    <li>}</li>`
            break
        case 'crop': 
            html = `<li>options: {</li>
                <li>${tab + tab}width: <input data-class="crop" data-type='width' class='js-input input' type='text' value='${ops.width}'></li>
                <li>${tab + tab}height: <input data-class="crop" data-type='height' class='js-input input' type='text' value='${ops.height}'></li>
                <li>${tab + tab}x:<input data-class="crop" data-type='x' class='js-input input' type='text' value='${ops.x}'></li>
                <li>${tab + tab}y:<input data-class="crop" data-type='y' class='js-input input' type='text' value='${ops.y}'></li>
                <li>${tab + tab}radius:<input data-class="crop" data-type='radius' class='js-input input' type='text' value='${ops.radius}'></li>
                <li>}</li>`
            break
        default:
    }
    $params.html(html)
    $sure.data('ops', JSON.stringify(ops)).data('type', type)
    $dialog.show()
}

$(window).on('input', '.js-input', function(this: any) {
    let $this = $(this)
    let v = $this.val()
    let type = $this.data('type')
    let ops = $sure.data('ops')
    const cls = $this.data('class')

    if (cls === 'crop') {
        switch (type) {
            case 'width':
                ops.width = v
                break
            case 'height':
                ops.height = v
                break
            case 'x':
                ops.x = v
                break
            case 'y':
                ops.y = v
                break
            case 'radius':
                ops.radius = v
                break
            default:
                break
        }
    } else {
        switch (type) {
            case 'width':
                ops.options.width = v
                break
            case 'x':
                ops.options.pos.x = v
                break
            case 'y':
                ops.options.pos.y = v
                break
            case 'scale':
                ops.options.pos.scale = v
                break
            case 'rotate':
                ops.options.pos.rotate = v
                break
            case 'align':
                ops.options.align = v
                break
            default:
        }
    }
    
    $sure.data('ops', JSON.stringify(ops))
})

$(window).on('focus', '.js-input', function(this: any) {
    $(this).addClass('focus')
})
$(window).on('blur', '.js-input', function(this: any) {
    $(this).removeClass('focus')
})

$(window).on('change', '.js-select', function(this: any) {
    let ops = $sure.data('ops')
    let type = $(this).data('type')
    ops.options[type] = $(this).val()
    $sure.data('ops', JSON.stringify(ops))
})

$('.js-cropImage').on('click', () => {
    showDialog(`crop`, data.crop)
})

$('.js-filter').on('click', function(this: any) {
    const $btn = $(this)
    const $par = $btn.parent()
    const type = $btn.data('type')
    mi.filter(type).draw(b64 => {
        $par.css('background-image', `url(${b64})`)
    })
})

