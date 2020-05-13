declare namespace MCanvas {
    type numstr = number | string
    type image = string | HTMLImageElement | HTMLCanvasElement
    interface options {
        width?: number,
        height?: number,
        backgroundColor?: string,
    }
    interface data {
        textId: number,
        text : any,
        bgConfig: null | backgroundOptions,
    }
    interface backgroundOptions {
        type: 'crop' | 'contain' | 'origin',
        image?: any,
        color?: string,
        left?: numstr,
        top?: numstr,
    }
    type queue = Array<() => void>
    interface position {
        x?: numstr,
        y?: numstr,
        scale?: number,
        rotate?: number,
    }
    interface crop {
        x?: numstr,
        y?: numstr,
        width?: numstr
        height?: numstr
    }
    interface addOptions {
        width?: numstr,
        crop?: crop,
        pos?: position
    }
    interface addData {
        image: string | HTMLImageElement | HTMLCanvasElement,
        options: addOptions,
    }

    interface watermarkOptions {
        width?: string | number
        pos?: 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom'
        margin?: number
    }
    interface textStyle {
        font?: string,
        color?: string,
        lineheight?: number,
        type?: 'fill' | 'stroke',
        lineWidth?: number,
        shadow?: {
            color?: string | null,
            blur?: number,
            offsetX?: number,
            offsetY: number,
        },
        gradient?:{
	        type?: 1 | 2,
	        colorStop?: string[],
	    },
    }
    interface textOptions {
        width?: number | string,
        align?: 'left' | 'center' | 'right',
        normalStyle?: textStyle,
        smallStyle?: textStyle,
        largeStyle?: textStyle,
        pos?: {
            x?: numstr,
            y?: numstr,
            rotate?: number,
        }
    }
    interface drawOptions {
        type?: 'png' | 'jpg' | 'jpeg' | 'webp',
        quality?: number,
        success?: (b64: string) => void
        error?: (err: any) => void
    }
    interface rectOptions {
        x?: numstr,
        y?: numstr,
        width?: numstr,
        height?: numstr,
        strokeWidth?: number,
        strokeColor?: string,
        fillColor?: string,
    }
    interface circleOptions {
        x?: numstr,
        y?: numstr,
        r?: numstr,
        strokeWidth?: number,
        strokeColor?: string,
        fillColor?: string,
    }
}