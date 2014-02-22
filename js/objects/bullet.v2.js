// TODO implement bufferGeometry
// TODO implement objectPool system to manage busy/gree and visible\invisible bullets

var Bullet = new particles();
function particles(){

    var mainScene,
        projectileLifetime = 200,
        projectileSpeed = 10,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [],
        geometry,
        particleSystem,
        amount = 1500,
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
        obj.position.collide = false;
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
        console.log(readyObjects);
    }

    function getObject(){
//        console.log(readyObjects);
        if (!readyObjects){
                console.log('! no ready objects');
            if (released.length){
                console.log('! set released as free');
                setReleasedAsFree();
            } else {
                console.log('! extend pool');
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

//    materials.push(new THREE.ParticleBasicMaterial({color : 0xffffff, size : 20}));
    materials.push(new THREE.ParticleBasicMaterial({
//        color: 0x33bbcc,
        color: Designer.colors.complementary.clone().offsetHSL(0,0,0.5-Designer.colors.complementary.getHSL().l),
        size: 35,
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
            geometry.vertices.push({
                x : 0,
                y : 0,
                z : 0,
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
//        particleSystem.geometry
//        mainScene.add(particleSystem);
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
            if (currentProjectile.position.collide == currentProjectile.position.source){
                currentProjectile.position.collide = null;
            }
            if (currentProjectile.lifetime>0 && !currentProjectile.position.collide) {
                currentProjectile.position.x += currentProjectile.speedX * time;
                currentProjectile.position.y += currentProjectile.speedY * time;
                shaderFlame.fireByParams(currentProjectile.position.source.weapon ,currentProjectile.position.x, currentProjectile.position.y, 0, currentProjectile.lifetime >> 0,0,0);
            } else {
                if (activeProjectiles[i]) {
                    releaseObject(currentProjectile);
                    delete activeProjectiles[i];
                }
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
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var selfSpeedX = cos*projectileSpeed,
            selfSpeedY = sin*projectileSpeed;
        proj.speedX = selfSpeedX + shooter.currentSpeedX;
        proj.speedY = selfSpeedY + shooter.currentSpeedY;
        proj.position.x = shooter.geometry.position.x + proj.speedX;
        proj.position.y = shooter.geometry.position.y + proj.speedY;
        proj.position.source = shooter;

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
