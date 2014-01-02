var Explosion = (function(){
    var pool = [],
        position = 0,
        poolSize = 100,
        explosionSize = 100,
        pi2 = Math.PI * 2,
        mainScene = null;

    for (var i = 0; i < poolSize; i++) {
        var particles = new THREE.Geometry(),
            material, explosion;

        for (var j = 0; j<explosionSize; j++){
            var a1, a2, x, y, z;
            a1 = Math.random() * pi2;
            a2 = Math.random() * pi2;

            x = Math.random() * Math.cos(a1);
            y = Math.random() * Math.sin(a1);
            z = Math.random() * Math.sin(a2);

            particles.vertices.push(new THREE.Vector3(x,y,z));
        }
        material = new THREE.ParticleSystemMaterial({size: 10, color: 0xff0000});
        explosion = new THREE.ParticleSystem(particles, material);
        explosion.material.transparent = true;
        pool.push(explosion);
    }

    function run(scene){
        var item = pool[position], length = 10;
        scene.add(item);
        function callback(){
            item.material.opacity -= 0.02;
            if (item.material.opacity > 0) {
                length+=5;
                item.scale.setLength(length);
                requestAnimationFrame(callback);
            } else {
                scene.remove(item);
            }
        }
        requestAnimationFrame(callback);
    }

    return {
        detonate : function(coord){
            position++;
            if (position >= pool.length){
                position = 0;
            }
            pool[position].position.x = coord.x;
            pool[position].position.y = coord.y;
            pool[position].material.opacity = 1;
            pool[position].rotation.z = Math.random() * pi2;
            pool[position].scale.setLength(1);

            run(mainScene);
        },
        attachToScene : function(scene){
            mainScene = scene;
        }
    }

})();

