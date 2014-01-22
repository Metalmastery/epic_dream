var scene, renderer,
    camera;

if ( !init() ){
    animate();
}

function init(){

//    return true;

    renderer = new THREE.WebGLRenderer({
//        antialias: true,
//        preserveDrawingBuffer: true,
        alpha : true
    });
    renderer.setClearColor(0, 1);

    renderer.setSize(window.innerWidth, window.innerHeight - 50);
    renderer.setFaceCulling('front', 'cw');
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0, 100, 5500);

    camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 0, 1000);
    scene.add(camera);

    Explosion.attachToScene(scene);
    Bullet.attachToScene(scene);

    var ship = new Ship(null, 0, 0, 'ship', null);
    scene.add( ship.geometry );
    ship.start();

    var dummy = new Ship(null, 200, 200, 'follow', ship);
    scene.add( dummy.geometry );
    dummy.start();

//    ambient();

//    floor();
    helper();

    window.ship = ship;
    window.dummy = dummy;
    enableCollider();
}

function bloom(){
    // TODO bloom pass
    // TODO FXAA
}

function enableCollider(){
    window.collider = new Collider({top : -1000, left : -1000, right : 1000, bottom : 1000 }, 4);
    var counter = 500;
    while (--counter) {
        window.collider.add(Bullet.projectilesArray[counter].position);
    }
    window.collider.add(ship);
    window.collider.add(dummy);
}

function helper(){
    var size = 1000;
    var step = 100;
    var gridHelper = new THREE.GridHelper( size, step );

    gridHelper.position = new THREE.Vector3( 0, 0, 0 );
    gridHelper.rotation = new THREE.Euler( 1.57, 0, 0 );

    scene.add( gridHelper );
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
        renderer.render( scene, camera );
    };

    var logic = function(){
        currentFtame = new Date();
        delta = (currentFtame - lastFrame) / 16;
        ship.update(delta);
        dummy.update(delta);
        Bullet.update(delta);
//        useCollider();
        window.collider.testCollisions();
        lastFrame = currentFtame;
    };

//    setInterval(logic, 1000/60);

    requestAnimationFrame(cb);
}

/** TODO test swiping/scrolling mousemove VS animationFrame */