// TODO implement bufferGeometry
// TODO implement objectPool system to manage busy/gree and visible\invisible bullets

var rocket = new rocketParticles2();
function rocketParticles2(){

    var mainScene,
        projectileLifetime = 1000,
        projectileSpeed = 5,
        rotationFactor = 0.05,
        projectileRadius = 3,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [],
        geometry,
        geometryAttributes = {},
        particleSystem,
        particleSize = 32,
        particleColor = Designer.colors.triad[2],
        amount = 100,
        resizeAddition = 100,
        acceptMask = bitMapper.generateMask('ship'),
        typeMask = bitMapper.generateMask('projectile');

    /* object pool here */
    var pool = [],
        free = [],
        released = [],
        readyObjects = 0;

    var flameVertexShader = [
        'uniform float lifetime;' ,
        'uniform float scale;' ,
        'attribute float size;' ,
        'attribute float rotation;' ,
        'attribute vec3 customColor;' ,
        'attribute float time;' ,
        'varying vec3 vColor;' ,
        'varying float alpha;' ,
        'varying float rotationAngle;' ,
        'void main(){' ,
        'rotationAngle = -rotation;',
        'alpha = (lifetime-time) / lifetime;',
        'vColor = customColor;' ,
        'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );' ,
        'gl_PointSize = size * (scale / length(mvPosition.xyz));' ,
        'gl_Position = projectionMatrix * mvPosition; ',
        '}'].join('\n');

    var flameFragmentShader = [
        'uniform vec3 color;' ,
        'uniform sampler2D texture;' ,
        'varying vec3 vColor;' ,
        'varying float rotationAngle;' ,
        'varying float alpha;' ,
        'void main() {' ,
        '//if (alpha < 0.0) {discard;};',
        'float a2 = alpha*alpha;',
        'float a3 = a2*alpha;',
        'vec3 col = vColor;' ,
        'float mid = 0.5;',
        'gl_FragColor = vec4( col, 1.0 );' ,
        'vec2 rotated = vec2(cos(rotationAngle) * (gl_PointCoord.x - mid) + sin(rotationAngle) * (gl_PointCoord.y - mid) + mid, cos(rotationAngle) * (gl_PointCoord.y - mid) - sin(rotationAngle) * (gl_PointCoord.x - mid) + mid);',
        'gl_FragColor = gl_FragColor * texture2D( texture, rotated ); ' ,
        '//gl_FragColor = gl_FragColor; ' ,
        '}'].join('\n');


    var attributes = {

        size: {	type: 'f', value: null },
        customColor: { type: 'c', value: null },
        time :     { type: "f", value: null },
        rotation : { type : 'f', value : null },
        target : { type : 'v2', value : null }

    };

    var uniforms = {

        color:     { type: "c", value: new THREE.Color( 0xffffff ) },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/particles/rocket_2.png" ) },
        lifetime : { type: "f", value: projectileLifetime },
        scale : { type: "f", value: engy.renderer.domElement.height/2 }

    };

    var shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: 		uniforms,
        attributes:     attributes,
        vertexShader:   flameVertexShader,
        fragmentShader: flameFragmentShader,

        blending: 		THREE.AdditiveBlending,
        depthTest: 		false,
        transparent:	true

    });

    materials.push(shaderMaterial);

    function fillPool(){
        for (var i = 0; i < amount; i++) {
            addPoolItem(i);
        }
    }

    function addPoolItem(i){
        var obj = {
            id : i,
            x : 0,
            y : 0,
            radius : projectileRadius,
            speedFactor : 1,
            speedX : 0,
            speedY : 0,
            rotation : 0,
            lifetime : projectileLifetime,
            collide : null,
            source : null,
            colliderAccept : acceptMask,
            colliderType : typeMask
        };
        pool.push(obj);
        free.push(i);
        readyObjects++;
    }

    function resetObjectProps(obj){
        obj.x = 0;
        obj.y = 0;
        obj.collide = false;
        obj.speedX = 0;
        obj.speedY = 0;
        obj.speedFactor = 1;
        obj.lifetime = projectileLifetime;
    }

    function setReleasedAsFree(){
        var tmp = free;
        free = released;
        released = tmp;
        readyObjects = free.length;
    }

    function getObject(){
        if (!readyObjects){
//            console.log('! no ready objects');
            if (released.length){
//                console.log('! set released as free');
                setReleasedAsFree();
            } else {
                console.log('! need to extend pool');
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

    function fillGeometry(size){
        geometry = new THREE.BufferGeometry();
        var vecPosition;
        geometry.addAttribute( 'position', Float32Array, size, 3 );
        geometry.addAttribute( 'customColor', Float32Array, size, 3 );
        geometry.addAttribute( 'size', Float32Array, size, 1 );
        geometry.addAttribute( 'time', Float32Array, size, 1 );
        geometry.addAttribute( 'rotation', Float32Array, size, 1 );

        geometryAttributes.size = geometry.attributes.size.array;
        geometryAttributes.position = geometry.attributes.position.array;
        geometryAttributes.time = geometry.attributes.time.array;
        geometryAttributes.rotation = geometry.attributes.rotation.array;
        geometryAttributes.color = geometry.attributes.customColor.array;
        window.geo = geometry;

        for (var i = 0; i < size; i++) {
            vecPosition = i * 3;
            geometryAttributes.size[ i ] = particleSize;

            geometryAttributes.position[ vecPosition + 0 ] = 0;
            geometryAttributes.position[ vecPosition + 1 ] = 0;
            geometryAttributes.position[ vecPosition + 2 ] = 0;

            geometryAttributes.time[i] = projectileLifetime + 1;
            geometryAttributes.rotation[i] = 0;

            geometryAttributes.color[ vecPosition + 0 ] = particleColor.r;
            geometryAttributes.color[ vecPosition + 1 ] = particleColor.g;
            geometryAttributes.color[ vecPosition + 2 ] = particleColor.b;
        }

        geometry.attributes.time.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.rotation.needsUpdate = true;
        geometry.attributes.customColor.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
    }

    function createSystem(){
        fillGeometry(amount);
        fillPool();
        particleSystem = new THREE.ParticleSystem(geometry, materials[0]);
        window.ps = particleSystem;
    }

    function attachToScene(scene){
        console.info('rocket attached to scene', scene);
        mainScene = scene;
        mainScene.add(particleSystem);
    }

    function update(time){
        var currentProjectile,
            tmp, sin, cos, diffX, diffY, targetAngle,
            attrIndex, vecPosition3;
        for (var i in activeProjectiles){
            currentProjectile = pool[activeProjectiles[i]];
            currentProjectile.lifetime-=time;

            attrIndex = currentProjectile.id;
            vecPosition3 = attrIndex * 3;

            if (currentProjectile.collide == currentProjectile.source){
                currentProjectile.collide = null;
            }
            if (currentProjectile.lifetime>0 && !currentProjectile.collide) {

                if (projectileLifetime - currentProjectile.lifetime > 20 && currentProjectile.target && currentProjectile.target.alive){
                    shaderFlame.fireByParams('rocket' , currentProjectile.x, currentProjectile.y, projectileRadius, currentProjectile.source.rotationAngle,0,0);
                    sin = Math.sin(currentProjectile.rotation);
                    cos = Math.cos(currentProjectile.rotation);
                    diffX = currentProjectile.target.x - currentProjectile.x;
                    diffY = currentProjectile.target.y - currentProjectile.y;
                    targetAngle = Math.atan2(diffY * cos - diffX * sin, diffX * cos + diffY * sin);
                    currentProjectile.rotation += targetAngle / Math.abs(targetAngle) * time * rotationFactor;
                    currentProjectile.speedFactor = 1 + (Math.abs(targetAngle) < 0.5 ? 1 - Math.abs(targetAngle) : 0);
                }
                currentProjectile.speedX = Math.cos(currentProjectile.rotation) * projectileSpeed * time;
                currentProjectile.speedY = Math.sin(currentProjectile.rotation) * projectileSpeed * time;
                currentProjectile.x += currentProjectile.speedX * time * currentProjectile.speedFactor;
                currentProjectile.y += currentProjectile.speedY * time * currentProjectile.speedFactor;
            } else {
                if (activeProjectiles[i]) {
                    releaseObject(currentProjectile);
                    delete activeProjectiles[i];
                }
            }
            geometryAttributes.position[vecPosition3] = currentProjectile.x;
            geometryAttributes.position[vecPosition3 + 1] = currentProjectile.y;
            geometryAttributes.time[attrIndex] = currentProjectile.time;
            geometryAttributes.rotation[attrIndex] = currentProjectile.rotation;
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.time.needsUpdate = true;
        geometry.attributes.rotation.needsUpdate = true;
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fireByParams(shooter, x, y, shipRadius, angle, vX, vY, target){
        audioController.playSound('rocket',x,y);
        var proj = getObject();
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var selfSpeedX = cos*projectileSpeed,
            selfSpeedY = sin*projectileSpeed;
        proj.speedX = selfSpeedX + vX;
        proj.speedY = selfSpeedY + vY;
        proj.x = x + proj.speedX;
        proj.y = y + proj.speedY;
        proj.source = shooter;
        proj.rotation = angle;
        proj.target = target;
        proj.lifetime = projectileLifetime;

        activeProjectiles[proj.id] = proj.id;
        return proj;
    }

    function fire(ship){
        audioController.playSound('rocket', ship.x, ship.y);
        var proj = getObject();
        var cos = Math.cos(ship.rotationAngle), sin = Math.sin(ship.rotationAngle);
        var selfSpeedX = cos*projectileSpeed,
            selfSpeedY = sin*projectileSpeed;
        proj.speedX = selfSpeedX + ship.currentSpeedX;
        proj.speedY = selfSpeedY + ship.currentSpeedY;
        proj.x = ship.x + proj.speedX;
        proj.y = ship.y + proj.speedY;
        proj.source = ship;
        proj.rotation = ship.rotationAngle;
        proj.target = ship.target;
        proj.lifetime = projectileLifetime;

        activeProjectiles[proj.id] = proj.id;
        return proj;
    }

    createSystem();

    this.fireByParams = fireByParams;
    this.fire = fire;
    this.attachToScene = attachToScene;
    this.stop = stop;
    this.update = update;
    this.projectilesArray = pool;
    return this;

}
