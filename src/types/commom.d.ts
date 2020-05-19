declare var ENV: 'node' | 'web'

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