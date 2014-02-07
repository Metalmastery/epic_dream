

function noPool(constructor, poolSize){
    if (typeof constructor != 'function' || !poolSize){
        throw new Error('can\'t create pool, not enough arguments');
    }

    return {
        getObject : function(){
            return new constructor();
        }
    }
}

function Pool(options){
    if (typeof options.constructor != 'function' || !options.poolSize || typeof options.resetObjectProps != 'function'){
        throw new Error('can\'t create pool, not enough arguments');
    }

    var pool = [],
        free = [],
        busy = [],
        released = [],
        readyObjects = 0,
        blankFunction = function(){};

    var constructor = options.constructor || blankFunction,
        resetObjectProps = options.resetObjectProps || blankFunction;

    function fillPool(){
        for (var i = 0; i < poolSize; i++) {
            addPoolItem(i);
        }
    }

    function addPoolItem(i){
//        console.log('fillPool');
        var obj = new constructor();
        obj.id = i;
        pool.push(obj);
        free.push(i);

        readyObjects++;
    }

//    function resetObjectProps(){
//
//    }

    function setReleasedAsFree(){
//        console.log('setReleasedAsFree');
        var tmp = free;
        free = released;
        released = tmp;
        readyObjects = free.length;
    }

    return {
        getObject : function(){
            if (!readyObjects){
//                console.log('! no ready objects');
                if (released.length){
                    setReleasedAsFree();
                } else {
                    fillPool(pool.length);
                }
            }
            readyObjects --;
            return pool[free.pop()];
        },
        releaseObject : function(obj){
            released.push(obj.id);
        }
    }
}

