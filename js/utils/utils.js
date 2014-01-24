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
})()
