export default {
    extend(obj1, obj2) {
        let type = this.isType(obj2);
        if(type == 'object'){
            this.forin(obj2, (k,v) => {
                let vType = this.isType(v);
                if (vType !== 'object' && vType !== 'array') {
                    obj1[k] = v;
                } else {
                    if (this.isType(obj1[k]) !== vType || obj1[k] === null) {
                        obj1[k] = vType == 'object' ? {} : [];
                    }
                    this.extend(obj1[k], v);
                }
            });
        }else if(type == 'array'){
            for (let i = 0; i < obj2.length; i++) {
                obj1[i] = obj2[i];
            }
        }else{
            obj1 = obj2;
        }
        return obj1;
    },
    loadImage(image, loaded, error) {
        let img = new Image();
        if(image.indexOf('http') == 0){
            img.crossOrigin = '*';
        }
        img.onload = () => {
            loaded(img);
            setTimeout(()=>{
                img = null;
            },1000);
        };
        img.onerror = () => {
            error('img load error');
        };
        img.src = image;
    },
    isObject(tar){
        return this.isObjFunc(tar, 'Object');
    },
    isBoolean(tar){
        return this.isObjFunc(tar, 'Boolean');
    },
    isArr(tar){
        return this.isObjFunc(tar, 'Array');
    },
    getImage(image,cbk, error){
        if(typeof image == 'string'){
                this.loadImage(image, img => {
                    cbk(img);
                },error);
        }else if(typeof image == 'object'){
            cbk(image);
        }else{
            console.log('add image error');
            return;
        }
    },
    forin(obj,cbk){
        for(let k in obj){
            if(obj.hasOwnProperty(k)){
                cbk(k,obj[k]);
            }
        }
    },
    isIos8(){
        let UA = window.navigator.userAgent.toLowerCase();
        let IOS = /(iPhone|iPad|iPod|iOS)/gi.test(UA);
        let IPAD = /(iPad)/gi.test(UA);
        if(IOS){
            return IPAD ? UA.match(/cpu os (\d*)/)[1] < 9 : UA.match(/iphone os (\d*)/)[1] < 9;
        }else{
            return false;
        }
    },
    deepCopy(obj){
        return JSON.parse(JSON.stringify(obj));
    },
    isObjFunc(tar, name) {
        return Object.prototype.toString.call(tar) === '[object ' + name + ']';
    },
    isType(tar){
        return Object.prototype.toString.call(tar).split(' ')[1].replace(']','').toLowerCase();
    },
};
