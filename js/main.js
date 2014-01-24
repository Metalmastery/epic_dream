var scene, renderer,
    camera;

if ( !init() ){
    animate();
}

function init(){

    Explosion.attachToScene(engy.scene);
    Bullet.attachToScene(engy.scene);

    var ship = new Ship(0, 0, 'ship', null);
    engy.followCamera(ship);
    ship.start();

    engy.addToMainLoop(Bullet);
    engy.addToMainLoop(ship);
    engy.collider.add(ship);

//    ambient();

//    floor();

    helper();

    enableCollider();
    createEnemies(ship);
}

function createEnemies(ship){
    var a = 0,
        distance = 500,
        amount = 5,
        dummy;
    for (a = 0; a < 6.28; a += 6.28/amount + Math.random() - 0.5){
        dummy = new Ship(distance * Math.cos(a), distance * Math.sin(a), 'follow', ship);
        dummy.start();
        engy.collider.add(dummy);
        engy.addToMainLoop(dummy);
    }
}

function bloom(){
    // TODO bloom pass
    // TODO FXAA
}

function enableCollider(){
    var counter = 500;
    while (--counter) {
        engy.collider.add(Bullet.projectilesArray[counter].position);
    }
}

function helper(){
    var size = 1000;
    var step = 100;
    var gridHelper = new THREE.GridHelper( size, step );

    gridHelper.position = new THREE.Vector3( 0, 0, 0 );
    gridHelper.rotation = new THREE.Euler( 1.57, 0, 0 );

//    scene.add( gridHelper );
}

function ambient(){
    createStars(scene, 0xccffee);
    nebula(scene, 0xccffee);
}

function floor(){
//    var floorTexture = new THREE.ImageUtils.loadTexture( 'img/checkerboard.jpg' );
    var floorTexture = new THREE.ImageUtils.loadTexture( 'img/black_100_100.png' );
    floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set( 100, 100 );
    var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
    var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
    var floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.position.y = -0.5;
    floor.position.z = -5;
    floor.scale.x = 1000;
    floor.scale.y = 1000;
//    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
}

function animate() {
    var lastFrame = new Date(),
        currentFtame = 0,
        delta = 0;

    var cb = function(){
        requestAnimationFrame(cb);
        logic();
        engy.renderer.render( engy.scene, engy.camera );
    };

    var logic = function(){
        currentFtame = new Date();
        delta = (currentFtame - lastFrame) / 16;
        engy.update(delta);
        engy.collider.testCollisions();
        lastFrame = currentFtame;
    };

    requestAnimationFrame(cb);
}

/** TODO test swiping/scrolling mousemove VS animationFrame */