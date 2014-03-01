//TODO implement rocket weapon

//var rocket = new rocketParticles();
function rocketParticles(){

    var mainScene,
        projectileLifetime = 350,
//        projectileSpeed = 0.05,
        projectileSpeed = 5,
        rotationSpeed = 10,
        currentAnimationFrame = null,
        materials = [],
        colliderObjects = [],
        colliderRadius = 5,
        geometry,
        particleSystem,
        particleSize = 32,
        amount = 50,
        nextIndex = 0;

    var colors = {
        'jet' : Designer.colors.triad[2]
    };

    var flameVertexShader = [
        'uniform float lifetime;' ,
        'uniform float scale;' ,
        'attribute float size;' ,
        'attribute vec2 rotation;' ,
        'attribute vec3 customColor;' ,
        'attribute float time;' ,
        'varying vec3 vColor;' ,
        'varying float alpha;' ,
        'varying float rotationAngle;' ,
        'void main(){' ,
            'rotationAngle = -rotation.x;',
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
            'if (alpha < 0.0) {discard;};',
            'float a2 = alpha*alpha;',
            'float a3 = a2*alpha;',
            'vec3 col = vColor;' ,
            'float mid = 0.5;',
            'gl_FragColor = vec4( col, 1.0 );' ,
            'vec2 rotated = vec2(cos(rotationAngle) * (gl_PointCoord.x - mid) + sin(rotationAngle) * (gl_PointCoord.y - mid) + mid, cos(rotationAngle) * (gl_PointCoord.y - mid) - sin(rotationAngle) * (gl_PointCoord.x - mid) + mid);',
            'gl_FragColor = gl_FragColor * texture2D( texture, rotated ); ' ,
        '}'].join('\n');


    var attributes = {

        size: {	type: 'f', value: null },
        customColor: { type: 'c', value: null },
        velocity : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
        time :     { type: "f", value: null },
        rotation : { type : 'v2', value : null },
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

    console.log(shaderMaterial);

    materials.push(shaderMaterial);

    geometry = new THREE.BufferGeometry();
    window.geometry = geometry;
    particleSystem = new THREE.ParticleSystem( geometry, materials[0] );

    geometry.addAttribute( 'position', Float32Array, amount, 3 );
    geometry.addAttribute( 'customColor', Float32Array, amount, 3 );
    geometry.addAttribute( 'velocity', Float32Array, amount, 3 );
    geometry.addAttribute( 'size', Float32Array, amount, 1 );
    geometry.addAttribute( 'time', Float32Array, amount, 1 );
    geometry.addAttribute( 'rotation', Float32Array, amount, 2 );
    geometry.addAttribute( 'target', Float32Array, amount, 2 );
//    geometry.attributes.size.dynamic = true;
//    geometry.attributes.position.dynamic = true;
    geometry.attributes.customColor.dynamic = true;
    geometry.attributes.time.dynamic = true;

    var values_size = geometry.attributes.size.array,
        positions = geometry.attributes.position.array,
        valuesTime = geometry.attributes.time.array,
        valuesVelocity = geometry.attributes.velocity.array,
        valuesRotation = geometry.attributes.rotation.array,
        valuesTarget = geometry.attributes.target.array,
        values_color = geometry.attributes.customColor.array;

    fillGeometry();

    function fillGeometry(){
        console.log('fill geometry', amount);
        var color = colors['jet'],
            vecPosition,
//            acceptMask = bitMapper.generateMask(['ship', 'projectile']),
            acceptMask = bitMapper.generateMask(['ship']),
            typeMask = bitMapper.generateMask('rocket');
        for (var i = 0; i < amount; i++){
            vecPosition = i * 3;
            values_size[ i ] = particleSize;

            positions[ vecPosition + 0 ] = 0;
            positions[ vecPosition + 1 ] = 0;
            positions[ vecPosition + 2 ] = 0;

            valuesTime[i] = projectileLifetime + 1;
            valuesRotation[i] = 0;

            values_color[ vecPosition + 0 ] = color.r;
            values_color[ vecPosition + 1 ] = color.g;
            values_color[ vecPosition + 2 ] = color.b;

            colliderObjects.push({
                x :  positions[ vecPosition + 0 ],
                y :  positions[ vecPosition + 1 ],
                radius : colliderRadius,
                collide : null,
                colliderAccept : acceptMask,
                colliderType : typeMask,
                source : null
            });
        }
    }

    function createSystem(){

        window.flames2 = particleSystem;
    }

    function attachToScene(scene){
        mainScene = scene;
        mainScene.add(particleSystem);
    }

    function update(time){
        var vecPosition3, vecPosition2;

        for (var i = 0; i < amount; i++){
            if (valuesTime[i] > projectileLifetime){
                continue;
            }

            vecPosition3 = i * 3;
            vecPosition2 = i * 2;
            valuesTime[i] += time;
            positions[ vecPosition3 + 0 ] += valuesVelocity[ vecPosition3 + 0 ];
            positions[ vecPosition3 + 1 ] += valuesVelocity[ vecPosition3 + 1 ];
            colliderObjects[i].x = positions[ vecPosition3 + 0 ];
            colliderObjects[i].y = positions[ vecPosition3 + 1 ];
            var targetX = valuesTarget[ vecPosition2 ],
                targetY = valuesTarget[ vecPosition2 + 1];
            if (colliderObjects[i].collide && (colliderObjects[i].collide != colliderObjects[i].source)/* || Math.pow(positions[ vecPosition3 + 0 ] - targetX, 2) + Math.pow(positions[ vecPosition3 + 1 ] - targetY, 2) < 900*/){
                console.warn(colliderObjects[i].collide && colliderObjects[i].collide != colliderObjects[i].source, colliderObjects[i]);
                Explosion.detonate({x : positions[ vecPosition3 + 0 ], y : positions[ vecPosition3 + 1 ]});
                valuesTime[i] = projectileLifetime + 1;
                resetValues(i);
            }

            if (valuesTime[i] < 20){
                continue;
            }

            var sin = Math.sin(valuesRotation[vecPosition2]),
                cos = Math.cos(valuesRotation[vecPosition2]),
                x = positions[ vecPosition3 + 0 ] - valuesVelocity [vecPosition3],
                y = positions[ vecPosition3 + 1 ] - valuesVelocity [vecPosition3 + 1];


            valuesRotation [vecPosition2 + 1] = Math.atan2(-(x - targetX)*sin + cos*(y - targetY), -(y - targetY)*sin - cos*(x - targetX))

//            if (valuesRotation [vecPosition2 + 1] < 0) {
                valuesRotation [vecPosition2] -= valuesRotation [vecPosition2 + 1] / (Math.abs(valuesRotation [vecPosition2 + 1] + 0.0000001)*rotationSpeed);
//            } else {
//                valuesRotation [vecPosition2] += valuesRotation [vecPosition2 + 1] / (Math.abs(valuesRotation [vecPosition2 + 1] + 0.0000001)*rotationSpeed);
//            }


            valuesVelocity [vecPosition3] = projectileSpeed * cos;
            valuesVelocity [vecPosition3 + 1] = projectileSpeed * sin;
            shaderFlame.fireByParams('jet',x,y,5,valuesRotation[vecPosition2],0,0);
        }
        geometry.attributes.time.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.rotation.needsUpdate = true;
        geometry.attributes.velocity.needsUpdate = true;
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fire(shooter){
        var angle = shooter.rotationAngle,
            radius = shooter.radius || 0;
        angle += 3.07 + Math.random()*0.14;
        var vecPosition = nextIndex * 3;
        var cos = Math.cos(angle), sin = Math.sin(angle);
        var selfSpeedX = cos*projectileSpeed,
            selfSpeedY = sin*projectileSpeed,
            speedX = selfSpeedX + shooter.currentSpeedX,

            speedY = selfSpeedY + shooter.currentSpeedY,

            positionY = shooter.geometry.position.y + sin * radius + shooter.currentSpeedY,
            positionX = shooter.geometry.position.x + cos * radius + shooter.currentSpeedX;

//        console.log(speedX, speedY);

        valuesVelocity[vecPosition] = speedX;
        valuesVelocity[vecPosition + 1] = speedY;
//
//        valuesVelocity[vecPosition] = selfSpeedX;
//        valuesVelocity[vecPosition + 1] = selfSpeedY;

        positions[vecPosition] = positionX;
        positions[vecPosition + 1] = positionY;

        valuesTime[nextIndex] = 0;

        geometry.attributes.velocity.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.rotation.needsUpdate = true;

        if (nextIndex >= amount) {
            nextIndex = 0;
        } else {
            nextIndex++;
        }
    }

    function fireByParams(shooter, x, y, shipRadius, angle, vX, vY, targetX, targetY){
        console.log(arguments, colliderObjects[nextIndex], nextIndex);
        var radius = shipRadius || 0,
            vecPosition = nextIndex * 3,
            type = 'jet',
            col = colors[type];

        targetX = targetX || x;
        targetY = targetY || y;

        var cos = Math.cos(angle), sin = Math.sin(angle),
            targetAngle = Math.atan2(-(x - targetX)*sin + cos*(y - targetY), -(y - targetY)*sin - cos*(x - targetX));

        var selfSpeedX = cos*projectileSpeed + vX,
            selfSpeedY = sin*projectileSpeed + vY,

            positionY = y + sin * radius + vY,
            positionX = x + cos * radius + vX;

        colliderObjects[nextIndex].source = shooter;
        colliderObjects[nextIndex].collide = null;

        valuesVelocity[vecPosition] = selfSpeedX;
        valuesVelocity[vecPosition + 1] = selfSpeedY;

        values_color[vecPosition] = col.r;
        values_color[vecPosition + 1] = col.g;
        values_color[vecPosition + 2] = col.b;

        valuesRotation[nextIndex*2] = angle;
        valuesRotation[nextIndex*2 + 1] = targetAngle;

        valuesTarget[nextIndex*2] = targetX;
        valuesTarget[nextIndex*2+1] = targetY;

        positions[vecPosition] = positionX;
        positions[vecPosition + 1] = positionY;

        valuesTime[nextIndex] = 0;

        geometry.attributes.velocity.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.rotation.needsUpdate = true;
        geometry.attributes.time.needsUpdate = true;
        geometry.attributes.target.needsUpdate = true;

        if (nextIndex > amount-2) {
            nextIndex = 0;
        } else {
            nextIndex++;
        }
    }

    createSystem();

    this.fire = fire;
    this.fireByParams = fireByParams;
    this.attachToScene = attachToScene;
    this.stop = stop;
    this.update = update;
    this.objects = colliderObjects;
    return this;

}
