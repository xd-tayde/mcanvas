declare namespace TImage {
    type ftype = 'blur' | 'flip' | 'gray' | 'mosaic' | 'oil'
    interface cropOptions {
        x?: number | string 
        y?: number | string
        width?: number | string
        height?: number | string
        radius?: number | string
    } 
    
}