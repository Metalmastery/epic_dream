var scene, renderer,
    camera;

if ( !init() ){
    animate();
}

function init(){

    return true;

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true
    });
    renderer.setClearColor(0, 1);

    renderer.setSize(window.innerWidth, window.innerHeight);
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

    createStars(scene, 0xccffee);
    nebula(scene, 0xccffee);

    window.ship = ship;
}

function animate() {

    requestAnimationFrame(animate);

    render();

}

function render() {
    renderer.render( scene, camera );
}

/** TODO test swiping/scrolling mousemove VS animationFrame */