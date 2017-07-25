export default {
    extend(obj1, obj2) {
        for (let k in obj2) {
            if (obj2.hasOwnProperty(k)) {
                if (typeof obj2[k] == 'object') {
                    if (typeof obj1[k] !== 'object' || obj1[k] === null) {
                        obj1[k] = {};
                    }
                    this.extend(obj1[k], obj2[k]);
                } else {
                    obj1[k] = obj2[k];
                }
            }
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
        };
        img.onerror = () => {
            error('img load error');
        };
        img.src = image;
    },
    isArr(arr) {
        return Object.prototype.toString.call(arr) === '[object Array]';
    },
    getImage(image,cbk){
        if(typeof image == 'string'){
                this.loadImage(image, img => {
                    cbk(img);
                },err=>{
                    console.log(err);
                });
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
};
