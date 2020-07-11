declare namespace TCanvas {
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
        lineHeight?: number,
        type?: 'fill' | 'stroke',
        lineWidth?: number,
        wordBreak?: boolean,
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
        radius?: TCommon.numstr,
        strokeWidth?: number,
        strokeColor?: string,
        fillColor?: string,
    }
}