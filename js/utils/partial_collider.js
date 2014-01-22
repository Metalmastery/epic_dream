var Collider = function(bounds, depth){
    var registeredObjects = {},
        registeredObjectsCount = 0,
        depth = depth || 3,
        bounds = bounds,
        normalizedBounds = normalizeBounds(bounds);

//    window.cellWidth = normalizedBounds.width >> depth;
//    window.cellWidth = normalizedBounds.height >> depth;

    var getId = (function(){
        var baseId = 0;
        return function _setUnique(){
            return baseId++;
        }
    })();

    function normalizeBounds(bounds){
        return {
            offsetX : -bounds.left,
            offsetY : -bounds.top,
            width : bounds.right - bounds.left,
            height : bounds.bottom - bounds.top,
            halfWidth : (bounds.right - bounds.left) / 2,
            halfHeight : (bounds.bottom - bounds.top) / 2,
            depth : depth,
            cellWidth : (bounds.right - bounds.left) >> depth,
            cellHeight : (bounds.bottom - bounds.top) >> depth
        };
    }

    function getPositionHash(obj){
        var normalizedX = obj.x + normalizedBounds.offsetX,
            normalizedY = obj.y + normalizedBounds.offsetY,
            cellWidth = normalizedBounds.halfWidth,
            cellHeight = normalizedBounds.halfHeight,
            hash = {x : 1, y : 1, absolute : null};

        console.log(normalizedX, normalizedY);
        for (var i = 0; i < depth; i++) {
            hash.x = hash << 1 | (normalizedX / (cellWidth >> i) >> 0);
            hash.y = hash << 1 | (normalizedY / (cellHeight >> i) >> 0);
        }
        hash.absolute = hash.x << depth | hash.y;
        return hash.absolute;
    }

    function getPositionHash2(obj){
        var normalizedX = obj.x + normalizedBounds.offsetX,
            normalizedY = obj.y + normalizedBounds.offsetY,
            cellWidth = normalizedBounds.width,
            cellHeight = normalizedBounds.height,
            x = normalizedX / (cellWidth >> depth),
            y = normalizedY / (cellHeight >> depth),
            hash = [];

//        console.log(x,y);

        hash = (x >> 0) + (y << depth);

//        if (normalizedX-obj.radius ) {}

        return hash;
    }

    function getPositionHash3(obj){
        var normalizedX = obj.x + normalizedBounds.offsetX,
            normalizedY = obj.y + normalizedBounds.offsetY,
            x = normalizedX / (normalizedBounds.cellWidth),
            y = normalizedY / (normalizedBounds.cellHeight),
//            proportionalWidth = (obj.radius) / normalizedBounds.cellWidth,
            proportionalWidth = (10) / normalizedBounds.cellWidth,
//            proportionalHeight = (obj.radius) / normalizedBounds.cellHeight,
            proportionalHeight = (10) / normalizedBounds.cellHeight,
            hash;

        var xPositionInCell = (x >> 0) + 0.5 - x;
        var yPositionInCell = (y >> 0) + 0.5 - y;

        hash = [(x >> 0) + (y << depth)];

        if (Math.abs(xPositionInCell) + proportionalWidth > 0.5) {
            xPositionInCell > 0 ? hash.push((x - 1 >> 0) + (y << depth)) : hash.push((x + 1 >> 0) + (y << depth))
        }

        if (Math.abs(yPositionInCell) + proportionalHeight > 0.5) {
            yPositionInCell > 0 ? hash.push((x >> 0) + (y - 1 << depth)) : hash.push((x >> 0) + (y + 1 << depth))
        }

        return hash;
    }

    function add(obj){
        if (! 'colliderCallback' in obj){
//            obj['colliderCallback'] = function(){};

            // TODO add blank function to object or discard register in collider
        }
        if (! ('colliderId' in obj)){
            obj['colliderId'] = getId();
        }
        if (! ('collide' in obj)){
            obj['collide'] = false;
        }
        if (! ('radius' in obj)){
            obj['radius'] = 10;
        }
        registeredObjects[obj.colliderId] = obj;
        registeredObjectsCount ++;
    }

    function remove(obj){
        delete registeredObjects[obj.colliderId];
        registeredObjectsCount--;
    }

    function testCollisions(){
        var partition = {},
            partitionKeys,
            partitionLength,
            key,
            hash,
            length,
            obj1, obj2;
        // build hash table for objects
        for (var i in registeredObjects) {
            if (registeredObjects[i].x != 0 && registeredObjects[i].y != 0) {
                hash = getPositionHash3(registeredObjects[i]);
                for (var j = 0; j < hash.length; j++) {
                    if (hash[j] in partition) {
                        partition[hash[j]].push(i);
                    } else {
                        partition[hash[j]] = [i];
                    }
                }
            }
        }
        partitionKeys = Object.keys(partition);
        partitionLength = partitionKeys.length;
//        console.log(partition);
        // check every cell's objects for collision
        for (var k =0; k < partitionLength; k++){
            key = partitionKeys[k];
            length = partition[key].length;
            if (length > 1){
                for (var l = 0; l < length; l++) {
                    for (var m = l+1; m < length; m++) {
                        obj1 = registeredObjects[partition[key][l]];
                        obj2 = registeredObjects[partition[key][m]];
//                        console.log(partition[key], l, m);
//                        console.log(obj1, obj2);
                        if (Math.pow(obj1.x - obj2.x, 2) + Math.pow(obj1.y - obj2.y, 2) < Math.pow(obj1.radius + obj2.radius, 2)){
                            obj1.collide = true;
                            obj2.collide = true;
                            // TODO remove hardcode & organize collision callback
                        }
                    }
                }
            }
        }

    }

    return {
        add : add,
        remove : remove,
        getId : getId,
        getHash : getPositionHash,
        getHash2 : getPositionHash2,
        getHash3 : getPositionHash3,
        bounds : normalizedBounds,
        objects : registeredObjects,
        testCollisions : testCollisions
    };
};

function prepareTest(amount, bounds){
    var someArray = [];
    if (!window.someArray || window.someArray.length != amount){
        console.log('create array');
        for (var i = 0; i<amount; i++){
            someArray.push({
                x : Math.random() * (bounds.right - bounds.left) + bounds.left,
                y : Math.random() * (bounds.bottom - bounds.top) + bounds.top,
                radius : Math.random()*5+1 >> 0,
                collide : false
            })
        }
        window.someArray = someArray;
    } else {
        someArray = window.someArray;
    }
    return someArray;
}

function testCollider(bounds, depth, amount){
    console.group(arguments);
    var collider = new Collider(bounds, depth),
        partition = {},
        amount = amount || 100,
        hash;

    window.collider = collider;

    var someArray = prepareTest(amount, bounds);

    console.time('build hash');
    var counter = amount;
    while (--counter) {
//        hash = collider.getHash3(someArray[counter], depth);
        hash = collider.getHash3(someArray[counter], depth);
        for (var i = 0; i < hash.length; i++) {
            if (hash[i] in partition) {
                partition[hash[i]].push(someArray[counter]);
            } else {
                partition[hash[i]] = [someArray[counter]];
            }
        }
//        console.log(hash.toString(2));
    }
    console.timeEnd('build hash');

    var collisions = 0;

    console.time('detect collision');

    for (var i in partition){
        if (partition[i].length > 1){
            for (var j = 0; j < partition[i].length; j++) {
                for (var k = j+1; k < partition[i].length; k++) {
                    if (Math.pow(partition[i][j].x - partition[i][k].x, 2) + Math.pow(partition[i][j].y - partition[i][k].y, 2) < Math.pow(partition[i][j].radius + partition[i][k].radius, 2)){
                        collisions++;
//                        if (partition[i][j].collide || partition[i][k].collide){
//                            console.log('already in collision');
//                        }
                        partition[i][j].collide = true;
                        partition[i][k].collide = true;
                    }
                }
            }
        }
    }

    console.timeEnd('detect collision');
    console.log({partition : partition, partsWithObjects : Object.keys(partition).length});
    console.log('collisionsFound', collisions);
    console.groupEnd();
    drawTest(collider.bounds, partition);
    return partition;
}

function drawTest(bounds, objects){
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
//        scale = Math.min(window.innerHeight, window.innerWidth) / Math.max(bounds.width, bounds.height),
        scale = 3,
        mask = 0,
        cell = {x : 0, y : 0, width : 0, height : 0};

    var windowSize = Math.min(window.innerHeight, window.innerWidth);

    canvas.width = bounds.width * scale;
    canvas.height = bounds.height * scale;

    for (var i = 0; i < bounds.depth; i++) {
        mask += 1 << i;
    }

    console.log('draw at scale', scale);

    document.body.appendChild(canvas);

    for (var i in objects){
        cell.width = bounds.width >> bounds.depth;
        cell.height = bounds.height >> bounds.depth;
        cell.y = (+i >>  bounds.depth) * cell.height;
        cell.x = (+i &  mask) * cell.width;
        ctx.strokeStyle = '#000000';
        if (objects[i].length > 1){
            ctx.fillStyle = 'rgb(255,240,240)';
        } else {
            ctx.fillStyle = '#ffffff';
        }
        ctx.beginPath();
        ctx.rect(cell.x * scale, cell.y * scale, cell.width * scale, cell.height*scale);
        ctx.fill();
        ctx.stroke();
//        console.log(i, (+i).toString(2));
        for (var j in objects[i]){
            if (objects[i][j].collide){
                ctx.strokeStyle = '#00ff00';
            } else {
                ctx.strokeStyle = '#000000';
            }
            ctx.beginPath();
            ctx.arc((objects[i][j].x + bounds.offsetX)*scale, (objects[i][j].y + bounds.offsetY)*scale, objects[i][j].radius*scale, 0, 6.28, false);
            ctx.stroke();
        }
    }


}

//window.collider = new Collider({top : -1000, bottom : 1000, left : -1000, right: 1000}, 4);