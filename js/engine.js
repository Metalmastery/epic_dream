var engy = (function(){

    var mainLoopObjects = [],
        counter = 0,
        scene,
        camera,
        collider,
        renderer,
        watched = {x : 0, y : 0};

    function followCamera(obj){
        if (obj && 'x' in obj && 'y' in obj){
            watched = obj;
        }
    }

    function init(){

        renderer = new THREE.WebGLRenderer({
            antialias: true,
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

        gridHelper();
    }

    function gridHelper(){
        var size = 10000;
        var step = 100;
        var gridHelper = new THREE.GridHelper( size, step );

        gridHelper.position = new THREE.Vector3( 0, 0, 0 );
        gridHelper.rotation = new THREE.Euler( 1.57, 0, 0 );

        scene.add( gridHelper );
    }

    function enableCollider(){
        collider = new Collider({top : -1000, left : -1000, right : 1000, bottom : 1000 }, 4);
    }

    function addToMainLoop(obj){
        if ('update' in obj) {
            mainLoopObjects.push(obj);
        }
//        console.log('geometry' in obj);
        if ('geometry' in obj) {
            scene.add(obj.geometry);
        }
    }

    function removeFromMainLoop(obj){
        var position = mainLoopObjects.indexOf(obj);
        if (! position < 0){
            mainLoopObjects[position] = mainLoopObjects.pop();
        }
    }

    function destroy(obj){
        removeFromMainLoop(obj);
        collider.remove(obj);
        scene.remove(obj.geometry);
    }

    function update(params){
        counter = mainLoopObjects.length;
        for (var i = 0; i < counter; i++){
//            console.log(mainLoopObjects[i]);
            mainLoopObjects[i].update(params);
        }
        camera.position.x = watched.x;
        camera.position.y = watched.y;
    }

    init();
    enableCollider();

    return {
        addToMainLoop : addToMainLoop,
        removeFromMainLoop : removeFromMainLoop,
        update : update,
        collider : collider,
        objects : mainLoopObjects,
        destroy : destroy,
        init : init,
        scene : scene,
        camera : camera,
        renderer : renderer,
        followCamera : followCamera
    }

})();