var beam = new Beam();
function Beam (){

    var projector = new THREE.Projector(),
        rayCaster = new THREE.Raycaster(),
        ray = new THREE.Vector3(),
        geometry = new THREE.BufferGeometry(),
        material = new THREE.LineBasicMaterial({ vertexColors: true }),
        amount = 10,
        color = Designer.colors.base,
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
    engy.scene.add( mesh );

    function fire(shooter){
        var angle = shooter.rotationAngle,
            sin = Math.sin(angle),
            cos = Math.cos(angle);

        ray.set(cos, sin, 0);

        rayCaster.set( new THREE.Vector3(shooter.x + 30 * cos, shooter.y + sin * 30, 0), ray );

        var intersects = rayCaster.intersectObjects( engy.scene.children, false );

        var i = 0;
        if (intersects.length) {
            var obj = intersects[i];
                shaderFlame.fireByParams('jet', obj.point.x, obj.point.y, 0, 0, cos, sin);
            positions[i * 3] = shooter.x;
            positions[i * 3 + 1] = shooter.y;
            positions[i * 3 + 3] = obj.point.x;
            positions[i * 3 + 4] = obj.point.y;
        } else {
            positions[i * 3] = shooter.x;
            positions[i * 3 + 1] = shooter.y;
            positions[i * 3 + 3] = shooter.x + cos * 1500;
            positions[i * 3 + 4] = shooter.y + sin * 1500;
        }

        geometry.attributes.position.needsUpdate = true;


        console.log(intersects);

    }

    this.fire = fire;

}