var Explosion = (function(){
    var pool = [],
        position = 0,
        poolSize = 100,
        explosionSize = 50,
        pi2 = Math.PI * 2,
        mainScene = null,
        baseColor = 0xcc9944,
//        baseColor = 0xff6644,
        particleSize = 110;

    for (var i = 0; i < poolSize; i++) {
        var particles = new THREE.Geometry(),
            explosion, material;

        for (var j = 0; j<explosionSize; j++){
            var a1, a2, x, y, z;
            a1 = Math.random() * pi2;
            a2 = Math.random() * pi2;

            x = Math.random() * Math.cos(a1);
            y = Math.random() * Math.sin(a1);
            z = Math.random() * Math.sin(a2);

            particles.vertices.push(new THREE.Vector3(x,y,z));
        }

        //        material = new THREE.ParticleSystemMaterial({size: 10, color: 0xff0000});
        material = new THREE.ParticleBasicMaterial({
            color: baseColor,
            size: particleSize,
            map: THREE.ImageUtils.loadTexture(
                "img/explosion_particle.png"
            ),
            blending: THREE.AdditiveBlending,
            depthWrite : false,
            transparent: true
        });
        explosion = new THREE.ParticleSystem(particles, material);
//        explosion.material.transparent = true;
//        explosion.sortParticles = true;
        pool.push(explosion);
    }

    function resetItem(obj){
        obj.material.opacity = 1;
        obj.material.size = particleSize;
        obj.material.color.setHex(baseColor);
        obj.scale.setLength(3);
    }

    function run(scene){
        var item = pool[position], length = 10;
        scene.add(item);
        function callback(){
            item.material.opacity -= 0.05;
            if (item.material.opacity > 0) {
                length *=1.12;
                item.material.size -= 5;
//                item.rotation.z += 0.05;
//                item.material.color.offsetHSL(0,0.05,0);
                item.material.color.offsetHSL(0,0.09,0);
                item.scale.setLength(length);
                requestAnimationFrame(callback);
            } else {
                scene.remove(item);
                resetItem(item);
            }
        }
        requestAnimationFrame(callback);
    }

    return {
        detonate : function(obj){
            audioController.playSound('explosion', obj.x, obj.y);
            shaderFlame.fireExplosion(obj);
        },
        detonateOld : function(ship){
            audioController.playSound('explosion', ship.x, ship.y);
            position++;
            if (position >= pool.length){
                position = 0;
            }
            pool[position].position.x = ship.x;
            pool[position].position.y = ship.y;
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

