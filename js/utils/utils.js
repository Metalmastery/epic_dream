function screenShot(){
    var url = document.getElementsByTagName('canvas')[0].toDataURL();
    window.open(url, '_blank');
}

function effects(){
    Explosion.detonate({x : Math.random()*500 + geom.x - 250, y : Math.random()*500 + geom.y - 250}); cameraControls.shake();
}

var cameraControls = {
    closeup : function(amount){
        var zPosition = camera.position.z,
            shift = 0,
            abs = Math.abs(amount),
            sign = amount / abs;
        function cb(){
            if (shift < abs) {
                camera.position.z = zPosition + shift*sign;
                shift+=5;
                requestAnimationFrame(cb);
            }
        }
        requestAnimationFrame(cb);
    },
    shake: function(){
        var position = JSON.parse(JSON.stringify(camera.position)),
            duration = 5;
        function cb(){
            if (duration){
                duration--;
                camera.position.x += Math.random()*100-50;
                camera.position.y += Math.random()*100-50;
                camera.position.z += Math.random()*100-50;
                camera.rotation.z = Math.random()*0.5-0.25;
                requestAnimationFrame(cb);
            } else {
                camera.position.x = position.x;
                camera.position.y = position.y;
                camera.position.z = position.z;
                camera.rotation.z = 0;
            }
        }
        requestAnimationFrame(cb);
    }

}

var csl = (function(){
    var c = document.getElementById('console');
    return function(args){
        c.textContent = args;
    }
})();

var bitMapper = (function(){
    /** up to 31 types of objects */
    var map = {
        'solid' : 0,
        'virtual' : 1,
        'ship' : 2,
        'projectile' : 3,
        'bot' : 4,
        'player' : 5
    }, inverseMap = [];

    for (var i in map){
        inverseMap.push(i);
    }

    function generateMask(param){
        var result = 0;
        if (param instanceof Array){
            for (var i = 0; i < param.length; i++){
                if (param[i] in map){
                    result |= 1 << map[param[i]];
                }
            }
        } else {
            if (param in map){
                result |= 1 << map[param];
            }
        }
        return result;
    }

    function getTypeByMask(object){
        var mask = object.colliderType;
        return inverseMap[Math.log(mask) / Math.LN2];
    }

    function is(type, object){
        return (object.colliderType >> map[type]) & 1
    }

    return {
        generateMask : generateMask,
        getTypeByMask : getTypeByMask,
        is : is
    }


})();
