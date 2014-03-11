var beam = new Beam();
function Beam (){

    var projector = new THREE.Projector(),
        rayCaster = new THREE.Raycaster(),
        ray = new THREE.Vector3(),
        geometry = new THREE.BufferGeometry(),
        material = new THREE.LineBasicMaterial({ vertexColors: true }),
        amount = 50,
        nextIndex = 0,
        color = Designer.colors.split[1],
        mesh;

    geometry.addAttribute( 'position', Float32Array, amount, 3 );
    geometry.addAttribute( 'color', Float32Array, amount, 3 );

    var positions = geometry.attributes.position.array;
    var colors = geometry.attributes.color.array;

    window.rc = rayCaster;

    for ( var i = 0; i < amount; i ++ ) {

        var x = 0;
        var y = 0;
        var z = 0;

        // positions

        positions[ i * 3 ] = x;
        positions[ i * 3 + 1 ] = y;
        positions[ i * 3 + 2 ] = z;

        // colors

        colors[ i * 3 ] = color.r;
        colors[ i * 3 + 1 ] = color.g;
        colors[ i * 3 + 2 ] = color.b;

    }

    geometry.computeBoundingSphere();

    mesh = new THREE.Line( geometry, material, THREE.LinePieces );

    function update(time){
        for ( var i = 0; i < amount; i ++ ) {

            positions[ i * 3 ] = 0;
            positions[ i * 3 + 1 ] = 0;
            positions[ i * 3 + 2 ] = 0;

        }
        geometry.attributes.position.needsUpdate = true;
    }

    function fire(shooter){
        audioController.playSound('beam', shooter.x, shooter.y);
        var angle = shooter.rotationAngle,
            sin = Math.sin(angle),
            cos = Math.cos(angle);

        ray.set(cos, sin, 0);

        rayCaster.set( new THREE.Vector3(shooter.x + 30 * cos, shooter.y + sin * 30, 0), ray );

        var intersects = rayCaster.intersectObjects( engy.scene.children, false );

        var i = nextIndex;
        if (intersects.length) {
            var obj = intersects[0];
                shaderFlame.fireByParams('bullet', obj.point.x, obj.point.y, 0, 0, cos, sin);
            positions[i * 3] = shooter.x;
            positions[i * 3 + 1] = shooter.y;
            positions[i * 3 + 3] = obj.point.x;
            positions[i * 3 + 4] = obj.point.y;
            if (obj.object.ship){
                obj.object.ship.durability--;
            }
        } else {
            positions[i * 3] = shooter.x;
            positions[i * 3 + 1] = shooter.y;
            positions[i * 3 + 3] = shooter.x + cos * 1500;
            positions[i * 3 + 4] = shooter.y + sin * 1500;
        }

        geometry.attributes.position.needsUpdate = true;

        nextIndex+=2;
        if (nextIndex >= amount){
            nextIndex = 0;
        }
    }

    this.fire = fire;
    this.mesh = mesh;
    this.update = update;

    engy.scene.add( mesh );
    engy.addToMainLoop(this);

}