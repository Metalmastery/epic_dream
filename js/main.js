var scene, renderer,
    camera;

if ( !init() ){
    animate();
}

function init(){

    Explosion.attachToScene(engy.scene);
    Bullet.attachToScene(engy.scene);
//    Flame.attachToScene(engy.scene);
    shaderFlame.attachToScene(engy.scene);
    indicator.attachToScene(engy.scene);

    var ship = new Ship(0, 0, 'ship', null);
//    indicator.add(ship);
    engy.followCamera(ship);
    ship.start();

    engy.addToMainLoop(Bullet);
    engy.addToMainLoop(shaderFlame);
    engy.addToMainLoop(ship);
//    engy.addToMainLoop(indicator);
    engy.collider.add(ship);

//    ambient();

//    floor();

    helper();

    enableCollider();

    document.addEventListener('keyup', function(e){
        if (e.keyCode == 69){
            createEnemy(ship);
        }
    });

//    createEnemies(ship);
    createTwoFaction(ship);
//    createFleet(ship);
}

function createFleet(ship){

    var fleet = new Fleet(500,500,ship);

    for (var i = 0; i < 3; i++) {
        var dummy = new Ship(fleet.x + Math.random()*200, fleet.x + Math.random()*200, 'follow', ship);
        dummy.start();
        fleet.add(dummy);
        engy.collider.add(dummy);
        engy.addToMainLoop(dummy);

    }

    engy.addToMainLoop(fleet);

}

function createEnemies(ship){
    var a = 0,
//        distance = Math.random() * 1000 + 300,
        distance = 500,
        amount = 100,
        dummy;
    for (a = 0; a < 6.28; a += 6.28/amount){
//        distance = 200 + Math.cos(a*3) * 100;
        dummy = new Ship(distance * Math.cos(a), distance * Math.sin(a), 'follow', ship);
        dummy.start();
        engy.collider.add(dummy);
        engy.addToMainLoop(dummy);
    }
}

function createTwoFaction(ship){
    var a = 0,
        distance = 300,
        amount = 1,
        dummy1,
        dummy2;
    for (a = 0; a < 3.14; a += 3.14 / amount){

        dummy1 = new Ship(Math.cos(a) * distance/2, Math.sin(a) * distance/2, 'follow2', ship);
        dummy2 = new Ship(Math.cos(a+3.14) * distance, Math.sin(a+3.14) * distance, 'follow', ship);
        dummy1.target = dummy2;
        dummy2.target = dummy1;
        dummy1.start();
        dummy2.start();
        engy.collider.add(dummy1);
        engy.addToMainLoop(dummy1);
        engy.collider.add(dummy2);
        engy.addToMainLoop(dummy2);
    }
}

function createEnemy(ship){
    var a = Math.random() * Math.PI * 2,
        distance = Math.random() * 500 + 300,
        dummy = new Ship(ship.x + distance * Math.cos(a), ship.y + distance * Math.sin(a), 'follow', ship);
    dummy.start();
    engy.collider.add(dummy);
    engy.addToMainLoop(dummy);
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