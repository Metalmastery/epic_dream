var indicator = new bufferLineParticles();
function bufferLineParticles(){

    var mainScene,
        objects = [],
        currentAnimationFrame = null,
        materials = [],
        geometry,
        particleSystem,
        amount = 100;

    var colors = {
        back : new THREE.Color(0x555555),
        front : new THREE.Color(0xff0000)
    };

    var indicatorVertexShader = [
//        'attribute float size;' ,
//        'attribute float totalDurability;' ,
//        'attribute float remainDurability;' ,
        'attribute vec3 params;' , //x - size, y - total, z - remain
        'varying float percentage;' ,
        'void main(){' ,
            'percentage = params.z / params.y;',
            'gl_PointSize = params.x;' ,
            'vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );' ,
            'gl_Position = projectionMatrix * mvPosition; ',
        '}'].join('\n');

    var indicatorFragmentShader = [
        'uniform vec3 backColor;' ,
        'uniform vec3 frontColor;' ,
        'uniform sampler2D texture;' ,
        'varying float percentage;',
        'void main() {' ,
            'vec3 col = backColor;' ,
            'if (gl_PointCoord.x < percentage){col = frontColor;}',
            'gl_FragColor = vec4( col, 1.0 );' ,
            'gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord ); ' ,
        '}'].join('\n');


    var attributes = {

        size: {	type: 'f', value: null },
        params : { type: "v3", value: new THREE.Vector3( 0, 0, 0 ) }

    };

    var uniforms = {

        backColor:     { type: "c", value: colors.back },
        frontColor:     { type: "c", value: colors.front },
        texture:   { type: "t", value: THREE.ImageUtils.loadTexture( "img/particles/indicator.png" ) }

    };

    var shaderMaterial = new THREE.ShaderMaterial( {

        uniforms: 		uniforms,
        attributes:     attributes,
        vertexShader:   indicatorVertexShader,
        fragmentShader: indicatorFragmentShader,

        blending: 		THREE.AdditiveBlending,
        depthTest: 		true,
        transparent:	true

    });

    materials.push(shaderMaterial);

    geometry = new THREE.BufferGeometry();
    window.geometry = geometry;
    particleSystem = new THREE.ParticleSystem( geometry, materials[0] );

    geometry.addAttribute( 'position', Float32Array, amount, 3 );
    geometry.addAttribute( 'params', Float32Array, amount, 3 );
    geometry.attributes.params.dynamic = true;

    var values_params = geometry.attributes.params.array,
        positions = geometry.attributes.position.array;

    fillGeometry();

    function fillGeometry(){
        var vecPosition;
        console.log('fill geometry', amount);
        for (var i = 0; i < amount; i++){
            vecPosition = i*3;
            positions[ vecPosition + 0 ] = 0;
            positions[ vecPosition + 1 ] = 0;
            positions[ vecPosition + 2 ] = 0;

            values_params[ vecPosition + 0 ] = 1;
            values_params[ vecPosition + 1 ] = 1;
            values_params[ vecPosition + 2 ] = 1;
        }
    }

    function createSystem(){

        window.indicator = particleSystem;
    }

    function attachToScene(scene){
        mainScene = scene;
        mainScene.add(particleSystem);
    }

    function update(){
        var vecPosition;
        for (var i = 0; i < objects.length; i++){
            vecPosition = i*3;

            positions[ vecPosition + 0 ] = objects[i].x;
            positions[ vecPosition + 1 ] = objects[i].y + objects[i].radius*2;
            positions[ vecPosition + 2 ] = 10;

            values_params[ vecPosition + 0 ] = objects[i].radius * 2;
            values_params[ vecPosition + 1 ] = objects[i].totalDurability;
            values_params[ vecPosition + 2 ] = objects[i].durability;

        }
        geometry.attributes.params.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
    }

    function hideAfterRemove(index){
        var vecPosition = index * 3;

        positions[ vecPosition + 0 ] = 0;
        positions[ vecPosition + 1 ] = 0;
        positions[ vecPosition + 2 ] = 0;

        values_params[ vecPosition + 0 ] = 1;
        values_params[ vecPosition + 1 ] = 1;
        values_params[ vecPosition + 2 ] = 1;

        geometry.attributes.params.needsUpdate = true;
        geometry.attributes.position.needsUpdate = true;
    }

    function stop(){
        webkitCancelRequestAnimationFrame(currentAnimationFrame);
    }

    function add(obj){
        objects.push(obj);
    }

    function remove(obj){
        var position = objects.indexOf(obj);
        if (position >= 0){
            objects.splice(position, 1);
            hideAfterRemove(objects.length);
        }
    }

    createSystem();

    this.add = add;
    this.remove = remove;
    this.attachToScene = attachToScene;
    this.stop = stop;
    this.update = update;
    return this;

}

