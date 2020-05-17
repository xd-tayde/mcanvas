type checkObject<T> = T extends string | number | undefined | null | Function | never ? never : T
declare type DeepRequired<T> = {
    [P in keyof T]-?: checkObject<T[P]> extends never ? T[P] : DeepRequired<T[P]>;
}

declare namespace TCommon {
    type numstr = number | string
    type image = string | HTMLImageElement | HTMLCanvasElement
    interface drawOptions {
        type?: 'png' | 'jpg' | 'jpeg',
        quality?: number,
        exportType?: 'base64' | 'canvas',
        success?: (b64: string | HTMLCanvasElement) => void
        error?: (err: any) => void
    }
}

declare namespace TComposer {
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
        left?: TCommon.numstr,
        top?: TCommon.numstr,
    }
    type queue = Array<() => void>
    interface position {
        x?: TCommon.numstr,
        y?: TCommon.numstr,
        scale?: number,
        rotate?: number,
    }
    interface crop {
        x?: TCommon.numstr,
        y?: TCommon.numstr,
        width?: TCommon.numstr,
        height?: TCommon.numstr,
        radius?: TCommon.numstr,
    }
    interface addOptions {
        width?: TCommon.numstr,
        crop?: crop,
        pos?: position
    }
    interface addData {
        image: TCommon.image,
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
            x?: TCommon.numstr,
            y?: TCommon.numstr,
            rotate?: number,
        }
    }

    interface rectOptions {
        x?: TCommon.numstr,
        y?: TCommon.numstr,
        width?: TCommon.numstr,
        height?: TCommon.numstr,
        radius?: number,
        strokeWidth?: number,
        strokeColor?: string,
        fillColor?: string,
    }
    interface circleOptions {
        x?: TCommon.numstr,
        y?: TCommon.numstr,
        r?: TCommon.numstr,
        strokeWidth?: number,
        strokeColor?: string,
        fillColor?: string,
    }
}

declare namespace TCrop {
    interface options {
        x?: number | string 
        y?: number | string
        width?: number | string
        height?: number | string
        radius?: number | string
    }
}

declare namespace TFilter {
    interface options {
        type: 'blur' 
        value: number
    }
}