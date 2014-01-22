// TODO implement bufferGeometry
// TODO implement objectPool system to manage busy/gree and visible\invisible bullets

var Bullet = (function(){

    var mainScene,
        projectileLifetime = 200,
        projectileSpeed = 20,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [],
        geometry,
        particleSystem,
        amount = 500,
        resizeAddition = 100;

    /* object pool here */
    var pool = [],
        free = [],
        released = [],
        readyObjects = 0;
    function fillPool(){
        for (var i = 0; i < amount; i++) {
            addPoolItem(i);
        }
    }

    function addPoolItem(i){
        var obj = {
            id : i,
            position : geometry.vertices[i],
            speedX : 0,
            speedY : 0,
            lifetime : projectileLifetime
        };
        pool.push(obj);
        free.push(i);
        readyObjects++;
    }

    function resetObjectProps(obj){
        obj.position.x = 0;
        obj.position.y = 0;
        obj.speedX = 0;
        obj.speedY = 0;
        obj.lifetime = projectileLifetime;
    }

    function setReleasedAsFree(){
//        console.log('setReleasedAsFree');
        var tmp = free;
        free = released;
        released = tmp;
        readyObjects = free.length;
    }

    function getObject(){
        if (!readyObjects){
                console.log('! no ready objects');
            if (released.length){
                console.log('! set released as free');
                setReleasedAsFree();
            } else {
                console.log('! extend pool');
                addPoolItem(pool.length);
            }
        }
        readyObjects --;
        return pool[free.pop()];
    }

    function releaseObject(obj){
        released.push(obj.id);
        resetObjectProps(obj);
    }
    /* pool end */

//    materials.push(new THREE.ParticleBasicMaterial({color : 0xffffff, size : 20}));
    materials.push(new THREE.ParticleBasicMaterial({
        color: 0x33bbcc,
        size: 50,
        map: THREE.ImageUtils.loadTexture(
            "img/particle.png"
        ),
        blending: THREE.AdditiveBlending,
        depthWrite : false,
        transparent: true
    }));

    geometry = new THREE.Geometry();

    function fillGeometry(size){
        var i = size;
        while (i--){
            geometry.vertices.push(new THREE.Vector3(0,0,0));
        }
    }

    function createSystem(){
        geometry = new THREE.Geometry();
        geometry.dynamic = true;
        fillGeometry(amount);
        fillPool();
        particleSystem = new THREE.ParticleSystem(geometry, materials[0]);
//        particleSystem.geometry
//        mainScene.add(particleSystem);
    }

    function attachToScene(scene){
        mainScene = scene;
        mainScene.add(particleSystem);
    }

    function update(time){
        for (var i in activeProjectiles){
//            console.log(activeProjectiles[i]);
            if (pool[activeProjectiles[i]].lifetime--) {
                pool[activeProjectiles[i]].position.x += pool[activeProjectiles[i]].speedX * time;
                pool[activeProjectiles[i]].position.y += pool[activeProjectiles[i]].speedY * time;
            } else {
                releaseObject(pool[activeProjectiles[i]]);
                delete activeProjectiles[activeProjectiles[i].id];
            }
        }
        particleSystem.geometry.verticesNeedUpdate = true;
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fire(shooter, angle){
        var proj = getObject();
//        console.log(proj, shooter.geometry.position, bulletSystemGeometry);

        proj.position.x = shooter.geometry.position.x + Math.cos(angle)*10;
        proj.position.y = shooter.geometry.position.y + Math.sin(angle)*10;
        proj.speedX = Math.cos(angle)*projectileSpeed + shooter.currentSpeedX;
        proj.speedY = Math.sin(angle)*projectileSpeed + shooter.currentSpeedY;

        activeProjectiles[proj.id] = proj.id;
//            lifetime : projectileLifetime,
//            speedX : Math.cos(angle)*projectileSpeed + shooter.currentSpeedX,
//            speedY : Math.sin(angle)*projectileSpeed + shooter.currentSpeedY,
//            projectile : proj
//        };
        return proj;
    }

    createSystem();

//    return {
//        fire : fire,
////        fireTarget : fireTarget,
//        attachToScene : attachToScene,
////        start : start,
//        stop : stop,
//        update : update,
//        projectilesArray : pool
//    }


    this.fire = fire;
    this.attachToScene = attachToScene;
    this.stop = stop;
    this.update = update;
    this.projectilesArray = pool;
    return this;

})();