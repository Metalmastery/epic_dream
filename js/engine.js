var engy = (function(){

    var mainLoopObjects = [],
        counter = 0,
        scene,
        camera,
        collider,
        renderer,
        watched = {x : 0, y : 0},
        removeQuery = [],
        gameSpeed = 1,
        // TODO use next vars for slow-down and speed-up
        gameSpeedChangeSteps = 0,
        gameSpeedChangePerStep = 0;

    function init(){

        document.addEventListener('keyup',function(e){
            switch (e.keyCode){
                case 109 : gameSpeed -= 0.1;
                    break;
                case 107 : gameSpeed += 0.1;
                    break;
                case 90 : setGameSpeedImmediately(0);
                    break
                case 88 : setGameSpeedImmediately(1);
                    break
            }
            console.log('==> GAME SPEED', gameSpeed);
        });

        renderer = new THREE.WebGLRenderer({
            antialias: true,
//        preserveDrawingBuffer: true,
            alpha : true
        });
        renderer.setClearColor(0, 1);

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setFaceCulling('front', 'cw');
        document.getElementById('container').appendChild(renderer.domElement);

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0, 1000, 5500);

        var light = new THREE.AmbientLight( 0x070715 ); // soft white light
        scene.add( light );
//
        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-1, 1,0.5).normalize();
        scene.add(directionalLight);

        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set(0, 0, 1200);
        scene.add(camera);
        setBackground();
        // TODO implement parallax background
//        setBackground();
//        gridHelper();
    }

    function attachCamera(obj){
        if (obj && 'x' in obj && 'y' in obj){
            watched = obj;
        }
    }

    function setGameSpeedImmediately(speed){
        if (typeof speed == 'number'){
            gameSpeed = speed;
        }
    }

    function setGameSpeedGradually(speed){
        gameSpeedChangeSteps = 50;
        gameSpeedChangePerStep = (speed - gameSpeed) / gameSpeedChangeSteps;
        // TODO change the speed of the game in a given time
    }


    function setBackground(){
        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/galaxy_starfield.png' );
//        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/checkerboard.jpg' );
        floorTexture.repeat.set( 50,50 );
//        floorTexture.offset.set( 3, 2 );
//        floorTexture.needsUpdate = true;
        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
        var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
        var floorGeometry = new THREE.PlaneGeometry(10000, 10000, 10, 10);
        var floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.position.z = -100;
        scene.add(floor);
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
        collider = new Collider({top : -1000, left : -1000, right : 1000, bottom : 1000 }, 5);
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
        removeQuery.push(obj);
    }

    function remove(obj){
        var position = mainLoopObjects.indexOf(obj);
        if (position >= 0){
            if (position == mainLoopObjects.length-1){
                mainLoopObjects.pop();
            } else {
                mainLoopObjects[position] = mainLoopObjects.pop();
            }
        }
    }

    function destroy(obj){
//        console.log('destroy', obj);
        collider.remove(obj);
        scene.remove(obj.geometry);
        removeFromMainLoop(obj);
    }

    function update(params){
        if (removeQuery.length) {
            for (var i = 0; i < removeQuery.length; i++){
                remove(removeQuery[i]);
            }
            removeQuery = [];
        }
        if (gameSpeedChangeSteps){
            gameSpeedChangeSteps--;
            gameSpeed+=gameSpeedChangePerStep;
        }
        counter = mainLoopObjects.length;
        for (var i = 0; i < counter; i++){
//            console.log(mainLoopObjects[i]);
            mainLoopObjects[i].update(params*gameSpeed);
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
        followCamera : attachCamera,
        setGameSpeedImmediately : setGameSpeedImmediately,
        setGameSpeedGradually : setGameSpeedGradually
    }

})();