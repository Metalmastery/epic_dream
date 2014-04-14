var scene, renderer,
    camera;

    if ( !init() ){
        animate();
    }




function init(){

    Explosion.attachToScene(engy.scene);
    bullet.attachToScene(engy.scene);
//    Flame.attachToScene(engy.scene);
    shaderFlame.attachToScene(engy.scene);
    rocket.attachToScene(engy.scene);
    indicator.attachToScene(engy.scene);

    var ship = new Ship(0, 0, 'ship', null);
//    indicator.add(ship);
    engy.attachCamera(ship);
    audioController.attachListener(ship);
    ship.start();

    engy.addToMainLoop(bullet);
    engy.addToMainLoop(shaderFlame);
    engy.addToMainLoop(rocket);
    engy.addToMainLoop(ship);
//    engy.addToMainLoop(indicator);
    engy.collider.add(ship);

    window.ship = ship;

//    ambient();

//    floor();

    helper();

    enableCollider();

    document.addEventListener('keyup', function(e){
        if (e.keyCode == 69){
            createEnemy(ship);
        }
    });

    createEnemies(ship);
//    createDuel(ship);
//    createTwoFaction(ship);
//    createFleet(ship);
}

function createFleet(ship){

    var fleet = new Fleet(300,300,null),
        playerFleet = new Fleet(0,0,null),
        dist = 300,
        amount1 = 5,
        amount2 = 4;

    for (var i = 0; i < amount1; i++) {
        var dummy = new Ship(dist, dist - 2*Math.random()*dist, 'follow', null);
        dummy.start();
        fleet.add(dummy);
        engy.collider.add(dummy);
        engy.addToMainLoop(dummy);

    }

    for (var i = 0; i < amount2; i++) {
        var helper = new Ship(-dist, dist - 2*Math.random()*dist, 'follow', null);
        helper.durability = helper.totalDurability = 4;
        helper.start();
        playerFleet.add(helper);
        engy.collider.add(helper);
        engy.addToMainLoop(helper);

    }

    playerFleet.add(ship);

    engy.addToMainLoop(fleet);
    engy.addToMainLoop(playerFleet);

}

function createDuel(ship){
    var dummy1 = new Ship(200, 200, 'test', null);
//        dummy = new Ship(distance, distance, 'follow', null);
    dummy1.start();
    engy.collider.add(dummy1);
    engy.addToMainLoop(dummy1);

    var dummy2 = new Ship(-200, 200, 'test', null);
//    dummy2.avoidMode = false;
//    dummy2.avoidanceDistance = 0;
    dummy2.start();
    engy.collider.add(dummy2);
    engy.addToMainLoop(dummy2);

    setTimeout(function(){
        dummy1.target = dummy2;
        dummy2.target = dummy1;
        dummy1.applyBehavior = dummy1.reachPoint;
        dummy2.applyBehavior = dummy2.reachPoint;
    }, 500);

    window.dummy = dummy2;

//    engy.attachCamera(dummy1);

}

function createEnemies(ship){
    var a = 0,
//        distance = Math.random() * 1000 + 300,
        distance = 200,
        amount = 1;

    for (a = 0; a < 6.28; a += 6.28/amount){
        (function(){
            var dummy = new Ship(200, 0, 'test', null);
            dummy.start();
            engy.collider.add(dummy);
            engy.addToMainLoop(dummy);
            setTimeout(function(){
            window.dummy = dummy;

            dummy.target = ship;
//            dummy.lastBehavior = dummy.immobile;
            dummy.lastBehavior = dummy.reachPoint;

            }, 2000);
            engy.attachCamera(dummy);
//        ship.target = dummy;
        })();

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
    var counter = bullet.projectilesArray.length;
    while (--counter) {
        engy.collider.add(bullet.projectilesArray[counter].position);
    }
    var counter = rocket.projectilesArray.length;
    while (--counter) {
        engy.collider.add(rocket.projectilesArray[counter]);
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

    function cb(){
        requestAnimationFrame(cb);
        //logic(); // inline
        currentFtame = new Date();
        delta = (currentFtame - lastFrame) / 16;
        engy.update(delta);
        engy.collider.testCollisions();
        lastFrame = currentFtame;
        engy.renderer.render( engy.scene, engy.camera );
    }

    requestAnimationFrame(cb);
}

/** TODO test swiping/scrolling mousemove VS animationFrame */