import { is } from './is'

type Next = (data: any) => any
interface IConfig {
    before?: (data: any) => any,
    after?: (data: any) => any,
}
export class Queue {
    // 绘制函数队列；
    private before: (data: any) => any
    private after: (data: any) => any
    private end: Next
    private isFirst: boolean = true
    private queue: ((next: Next, data: any) => void)[] = []
    constructor(config?: IConfig) {
        const { before = data => data, after = data => data } = config || {}
        this.before = before
        this.after = after
    }
    public push(fn: (next: Next, data: any) => void) {
        if (is.fn(fn)) this.queue.push(fn)
    }
    public perform(end: Next, initData?: any) {
        this.end = end
        this._next(initData)
    }
    private _next = (data: any) => {
        if (!this.isFirst) data = this.after(data)
        if (this.queue.length > 0) {
            const fn = this.queue.shift()
            if (fn) {
                data = this.before(data)
                fn(this._next, data)
                this.isFirst = false
            }
        } else {
            this.end(data)
            this.queue = []
        }
    }
}