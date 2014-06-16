
var shaderFlame = new bufferParticles(Designer.colors.triad[2]);
function bufferParticles(color){

    var mainScene,
        projectileLifetime = 50,
        projectileSpeed = 0.5,
        activeProjectiles = {},
        currentAnimationFrame = null,
        materials = [],
        geometry,
        particleSystem,
        particleSize = 32,
        amount = 5000,
        nextIndex = 0;

    var colors = {
        'jet' : Designer.colors.triad[2],
        'jet2' : Designer.colors.split[1],
//        'base' : Designer.colors.triad[1],
        'bullet' : Designer.colors.complementary,
        'base' : Designer.colors.analog[0]
    };

    var flameTypes = {
        jet : {
            color : Designer.colors.triad[2],
            size : 32
        },
        jet2 : {
            color : Designer.colors.split[1],
            size : 32
        },
        rocket : {
            color : Designer.colors.complementary,
            size : 25
        },
        bullet : {
            color : Designer.colors.analog[1],
            size : 32
        },
        base : {
            color : Designer.colors.analog[0],
            size : 32
        }
    };

    var flameVertexShader = [
        'uniform float lifetime;' ,
        'uniform float scale;' ,
        'attribute float size;' ,
        'attribute vec3 customColor;' ,
        'attribute vec3 velocity;' ,
        'attribute float time;' ,
        'varying vec3 vColor;' ,
        'varying float alpha;' ,
        'void main(){' ,
        'alpha = (lifetime-time) / lifetime;',
        'vColor = customColor;' ,
        'vec4 mvPosition = modelViewMatrix * vec4( position + velocity*time, 1.0 );' ,
        'gl_PointSize = (size * 0.75  + size * 0.25 * alpha) * (scale / length(mvPosition.xyz));' ,
        '//gl_PointSize = size * ( 300.0 / length( mvPosition.xyz ) );' ,
        'gl_Position = projectionMatrix * mvPosition; ',
        '}'].join('\n');

    var flameFragmentShader = [
        'uniform vec3 color;' ,
        'uniform sampler2D texture;' ,
        'varying vec3 vColor;' ,
        'varying float alpha;' ,
        'void main() {' ,
        'if (alpha < 0.0) {discard;};',
        'float a2 = alpha*alpha;',
        'float a3 = a2*alpha;',
        '//gl_FragColor = vec4( color * vColor, alpha/2.0 );' ,
        'vec3 col = vColor;' ,
        'gl_FragColor = vec4( col + vec3(a3, a3, a3), a2 );' ,
        '//gl_FragColor = vec4( col + vec3(alpha/2.0, alpha/2.0, alpha/2.0), a2 );' ,
        'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord ); ' ,
        '}'].join('\n');


    var attributes = {

        size: {	type: 'f', value: null },
        customColor: { type: 'c', value: null },
        velocity : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) },
        time :     { type: "f", value: null }

    };

    var uniforms = {

        color:     { type: "c", value: new THREE.Color( 0xffffff ) },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/particles/spark_3.png" ) },
//        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/explosion_particle.png" ) },
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
//    geometry.attributes.size.dynamic = true;
//    geometry.attributes.position.dynamic = true;
    geometry.attributes.customColor.dynamic = true;
    geometry.attributes.time.dynamic = true;

    var values_size = geometry.attributes.size.array,
        positions = geometry.attributes.position.array,
        valuesTime = geometry.attributes.time.array,
        valuesVelocity = geometry.attributes.velocity.array,
        values_color = geometry.attributes.customColor.array;

    fillGeometry();

    function fillGeometry(){
        console.log('fill geometry', amount);
        for (var i = 0; i < amount; i++){
            values_size[ i ] = particleSize;

            positions[ i * 3 + 0 ] = 0;
            positions[ i * 3 + 1 ] = 0;
            positions[ i * 3 + 2 ] = 0;

            valuesTime[i] = 0;

            values_color[ i * 3 + 0 ] = color.r;
            values_color[ i * 3 + 1 ] = color.g;
            values_color[ i * 3 + 2 ] = color.b;
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
        for (var i = 0; i < amount; i++){
//            values_size[ i ] = particleSize;

//            positions[ i * 3 + 0 ] = 0;
//            positions[ i * 3 + 1 ] = 0;
//            positions[ i * 3 + 2 ] = 0;

//            values_color[ i * 3 + 0 ] = color.r;
//            values_color[ i * 3 + 1 ] = color.g;
//            values_color[ i * 3 + 2 ] = color.b;

            valuesTime[i] += time;
        }
        geometry.attributes.time.needsUpdate = true;
        geometry.attributes.customColor.needsUpdate = true;
    }

    function stop(){
//        cancelRequestAnimationFrame(currentAnimationFrame);
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function fire(shooter){
        var angle = shooter.rotationAngle,
            radius = shooter.radius || 0;
//        angle += 3.07 + Math.random()*0.14;
        angle += 3.14;
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

        if (nextIndex >= amount) {
            nextIndex = 0;
        } else {
            nextIndex++;
        }
    }

    function fireByParams(type, x, y, shipRadius, angle, vX, vY, cos, sin){
        var radius = shipRadius || 0,
//            angle = angle + 3.07 + Math.random()*0.14,
//            angle = angle + 3.14,
            vecPosition = nextIndex * 3,
            type = type ? flameTypes[type] : flameTypes.jet,
            col = type.color,
            size = type.size;
//        vX = 0;
//        vY = 0;
        if (angle){
            cos = Math.cos(angle);
            sin = Math.sin(angle);
        } else {
            cos = - cos;
            sin = - sin;
        }
//        console.log(cos, sin);
        var selfSpeedX = cos*projectileSpeed + vX,
            selfSpeedY = sin*projectileSpeed + vY,

            positionY = y + sin * radius + vY,
            positionX = x + cos * radius + vX;

        valuesVelocity[vecPosition] = selfSpeedX;
        valuesVelocity[vecPosition + 1] = selfSpeedY;

        values_color[vecPosition] = col.r;
        values_color[vecPosition + 1] = col.g;
        values_color[vecPosition + 2] = col.b;

//        values_color[vecPosition] = Math.random();
//        values_color[vecPosition + 1] = Math.random();
//        values_color[vecPosition + 2] = Math.random();

        positions[vecPosition] = positionX;
        positions[vecPosition + 1] = positionY;

        valuesTime[nextIndex] = 0;
        values_size[nextIndex] = size;

        geometry.attributes.velocity.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;

        if (nextIndex >= amount) {
            nextIndex = 0;
        } else {
            nextIndex++;
        }
    }

    function fireExplosion(ship){
        var angle,
            vecPosition,
            type = flameTypes['jet2'],
            col = type.color,
            speed = 5,
            size = type.size;
        for (var i = 0; i < 50; i++){
            vecPosition = nextIndex * 3;
            angle = Math.random()*6.28;
            speed = Math.random()*4;
            var cos = Math.cos(angle), sin = Math.sin(angle),
                selfSpeedX = cos*speed + ship.currentSpeedX,
                selfSpeedY = sin*speed + ship.currentSpeedY,

                positionY = ship.y,
                positionX = ship.x;

            valuesVelocity[vecPosition] = selfSpeedX;
            valuesVelocity[vecPosition + 1] = selfSpeedY;

            values_color[vecPosition] = col.r;
            values_color[vecPosition + 1] = col.g;
            values_color[vecPosition + 2] = col.b;

            positions[vecPosition] = positionX;
            positions[vecPosition + 1] = positionY;

            valuesTime[nextIndex] = 0;
            values_size[nextIndex] = size;

            if (nextIndex >= amount) {
                nextIndex = 0;
            } else {
                nextIndex++;
            }
        }
        geometry.attributes.velocity.needsUpdate = true;
        geometry.attributes.size.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;

    }


    createSystem();

    this.fire = fire;
    this.fireExplosion = fireExplosion;
    this.fireByParams = fireByParams;
    this.attachToScene = attachToScene;
    this.stop = stop;
    this.update = update;
    return this;

}
