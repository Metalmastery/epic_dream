
var Flame = new particles2(Designer.colors.split[1]);
//var enemyFlame = new particles2(Designer.colors.split[2]);
function particles2(color){

    var mainScene,
        projectileLifetime = 100,
        projectileSpeed = 0.2,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [],
        geometry,
        particleSystem,
        amount = 2000,
        resizeAddition = 100;

//    var baseColor = (new THREE.Color()).setHSL(0.2, 1, 0.7),
//    var baseColor = (new THREE.Color()).setHSL(0.7, 1, 0.7),
//    var baseColor = Designer.colors.base.clone().offsetHSL(0, 0, 0.2),
    var baseColor = color.clone().offsetHSL(0, 0, 0.2),
        hsl = baseColor.getHSL();

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
            lifetime : projectileLifetime * Math.random()
        };
        pool.push(obj);
        free.push(i);
        readyObjects++;
    }

    function resetObjectProps(obj){
        obj.position.x = 0;
        obj.position.y = 0;
        obj.position.collide = false;
        obj.speedX = 0;
        obj.speedY = 0;
        obj.lifetime = projectileLifetime * Math.random();
        obj.position.color.set(baseColor);
    }

    function setReleasedAsFree(){
//        console.log('setReleasedAsFree');
        var tmp = free;
        free = released;
        released = tmp;
        readyObjects = free.length;
        console.log(readyObjects);
    }

    function getObject(){
//        console.log(readyObjects);
        if (!readyObjects){
            console.log('! no ready objects', released.length);
            if (released.length){
                console.log('! set released as free');
                setReleasedAsFree();
            } else {
//                console.log('! extend pool');
//                addPoolItem(pool.length);
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

    materials.push(new THREE.ParticleBasicMaterial({
        vertexColors : THREE.VertexColors,
        size: 25,
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
//            geometry.vertices.push(new THREE.Vector3(0,0,0));
//            geometry.colors[i] = (new THREE.Color(0xff0000));
            geometry.colors.push((new THREE.Color()).set(baseColor));
            geometry.vertices.push({
                x : 0,
                y : 0,
                z : 0,
                color : geometry.colors[geometry.colors.length - 1],
                radius : 5,
                source : null,
                colliderAccept : bitMapper.generateMask(['ship', 'bot']),
                colliderType : bitMapper.generateMask('projectile')
            });

        }
    }

    function createSystem(){
        geometry = new THREE.Geometry();
        geometry.dynamic = true;
        fillGeometry(amount);
        fillPool();
        particleSystem = new THREE.ParticleSystem(geometry, materials[0]);
        window.flames = particleSystem;
    }

    function attachToScene(scene){
        mainScene = scene;
        mainScene.add(particleSystem);
    }

    function update(time){
        var currentProjectile;
        for (var i in activeProjectiles){
            currentProjectile = pool[activeProjectiles[i]];
            currentProjectile.lifetime-=time;
            currentProjectile.position.color.offsetHSL(-0.01, 0, -0.02);

            if (currentProjectile.lifetime>0) {
                currentProjectile.position.x += currentProjectile.speedX * time;
                currentProjectile.position.y += currentProjectile.speedY * time;
//                console.log(currentProjectile.position.color);
            } else {
                if (activeProjectiles[i]) {
                    releaseObject(currentProjectile);
                    delete activeProjectiles[i];
                }
            }
        }
        geometry.verticesNeedUpdate = true;
        geometry.colorsNeedUpdate = true;
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fire(shooter, angle){
        var proj = getObject();
        angle += 3.07 + Math.random()*0.14;
//        console.log(proj, shooter.geometry.position, bulletSystemGeometry);
//        var cos = Math.cos(angle), sin = Math.sin(angle);
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var selfSpeedX = cos*projectileSpeed,
            selfSpeedY = sin*projectileSpeed;
        proj.speedX = selfSpeedX + shooter.currentSpeedX;
        proj.speedY = selfSpeedY + shooter.currentSpeedY;
        proj.position.y = shooter.geometry.position.y + sin * 7 + shooter.currentSpeedY;
        proj.position.x = shooter.geometry.position.x + cos * 7 + shooter.currentSpeedX;

        activeProjectiles[proj.id] = proj.id;
        return proj;
    }

    createSystem();

    this.fire = fire;
    this.attachToScene = attachToScene;
    this.stop = stop;
    this.update = update;
    this.projectilesArray = pool;
    return this;

}
