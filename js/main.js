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
//        distance = Math.random() * 1000 + 300,
        distance = 100,
        amount = 10,
        dummy;
    for (a = 0; a < 6.28; a += 6.28/amount){
//        distance = 200 + Math.cos(a*3) * 100;
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
    var counter = Bullet.projectilesArray.length;
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

function animate() {
    var lastFrame = new Date(),
        currentFtame = 0,
        delta = 0;

    var cb = function(){
        requestAnimationFrame(cb);
        logic();
        engy.renderer.render( engy.scene, engy.camera );
//        engy.renderer.clear();
//        engy.composer.render();
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