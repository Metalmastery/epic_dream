

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

function Pool(constructor, poolSize){
    if (typeof constructor != 'function' || !poolSize){
        throw new Error('can\'t create pool, not enough arguments');
    }

    var pool = [],
        free = [],
        busy = [],
        released = [],
        readyObjects = 0;

//    var self = this;
//    self.pool = pool;
//    self.free = free;
//    self.busy = busy;
//    self.released = released;
//    self.readyObjects = readyObjects;


    for (var i = 0; i < poolSize; i++) {
        fillPool(i);
    }

    function fillPool(i){
//        console.log('fillPool');
        var obj = new constructor();
        obj.id = i;
        pool.push(obj);
        free.push(i);
        readyObjects++;
    }

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

function testPool(){
    this.values = [];
    for (var i = 0; i < 10; i++) {
        this.values.push(Math.random()*100>>0);
    }
    return this;
}

var pool = new Pool(testPool, 2);