var engy = (function(){

    var mainLoopObjects = [],
        counter = 0,
        scene,
        camera,
        audio,
        collider,
        renderer,
        watched = {x : 0, y : 0},
        removeQuery = [],
        gameSpeed = 1,
        // TODO use next vars for slow-down and speed-up
        gameSpeedChangeSteps = 0,
        gameSpeedChangePerStep = 0,
        bindings = {
            109 : function (e){
                if (e.altKey){
                    camera.position.z += 50;
                } else {
                    gameSpeed -= 0.1;
                }
            },
            107 : function(e){
                if (e.altKey){
                    camera.position.z -= 50;
                } else {
                    gameSpeed += 0.1;
                }
            },
            90 : toggleGamePause

        };

    function init(){

        // TODO global color scheme for each game based on color triad (for example)

        document.addEventListener('keyup',function(e){
//            console.log(e.keyCode);
            if (e.keyCode in bindings){
                bindings[e.keyCode].apply(window, [e]);
            }
        });

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: true,
            alpha : true,
            precision: 'lowp'
//            devicePixelRation : 1
        });
        renderer.setClearColor(0, 1);

//        renderer.setScissor( 0, 0, 100, 100 ) ;
//        renderer.enableScissorTest(true);

        renderer.setSize(window.innerWidth, window.innerHeight);
//        renderer.setFaceCulling('front', 'cw');
        document.getElementById('container').appendChild(renderer.domElement);

        console.log(renderer);

        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x0, 1000, 5500);

        var ambientColor = new THREE.Color(0x707075);
        ambientColor.offsetHSL(0,0,-0.3);
        var light = new THREE.AmbientLight( ambientColor ); // soft white light
        scene.add( light );
//
        var directionalLight = new THREE.DirectionalLight(0xdddfff, 1);
        directionalLight.position.set(-0.5, 0.7,0.25).normalize();
        directionalLight.intensity = 4;
        scene.add(directionalLight);

        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 1, 10000 );
        camera.position.set(0, 0, 1200);
        scene.add(camera);
//        setBackground();
        // TODO implement parallax background
//        setBackground();
//        gridHelper();
//        initAudio();
        createNebula();

    }

    function initAudio(){
        audio = new Audio();
        audio.src = 'sound/music/rez_kenet_-_unreeeal_superhero_3.mp3';
        audio.play();
        audio.loop = true;
        window.au = audio;
    }

    function createEnemy(ship){
        var a = Math.random() * Math.PI * 2,
//            distance = Math.random() * 100 + 300,
            distance = 300,
            dummy = new Ship(distance * Math.cos(a), distance * Math.sin(a), 'follow2', ship);
            dummy.start();
            collider.add(dummy);
            addToMainLoop(dummy);
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

    function toggleGamePause(){
        gameSpeed = + (!gameSpeed);
    }

    function setGameSpeedGradually(speed){
        gameSpeedChangeSteps = 50;
        gameSpeedChangePerStep = (speed - gameSpeed) / gameSpeedChangeSteps;
        // TODO change the speed of the game in a given time
    }

    function setBackground(){
//        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/noise_4.png' );
        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/noise_5.png' );
//        var floorTexture = new THREE.ImageUtils.loadTexture( 'img/worley3.png' );
        floorTexture.repeat.set( 10,10 );
//        floorTexture.wrapS =THREE.RepeatWrapping;
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;
//        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;

        var floorGeometry = new THREE.PlaneGeometry(102400, 102400, 1, 1);
        var offset = Math.random(),
            range = 0.1 * Math.random() + 0.1;
        console.log(Designer.colors.triad);
//        var color = Designer.colors.base.offsetHSL(0, 0, -Designer.colors.base.getHSL().l/2),
//            hsl = color.getHSL();
        for (var i in floorGeometry.vertices){
            var color = Designer.colors.analog[Math.random()*2>>0].clone().offsetHSL(Math.random()*0.1-0.05, -0.5, Math.random()*0.6 - 0.4);
            floorGeometry.colors[i] = color;
        }
        var mapper = ['a', 'b', 'c'];
        for (var i in floorGeometry.faces){
            for (var j = 0; j < 3; j++) {
//                floorGeometry.faces[i].vertexColors[j] = floorGeometry.colors[floorGeometry.faces[i][mapper[j]]];

            }
        }

        var floorMaterial = new THREE.MeshBasicMaterial( { fog : false, vertexColors : THREE.VertexColors,map: floorTexture, side: THREE.DoubleSide, color : new THREE.Color(0x777777) } );
        var floorMaterial2 = new THREE.MeshBasicMaterial( { vertexColors : THREE.VertexColors,map: floorTexture, side: THREE.DoubleSide, transparent : true, opacity : 0.3 } );
//        var floorMaterial2 = new THREE.MeshBasicMaterial( { /*color : 0x112455,*/ map: floorTexture, side: THREE.DoubleSide, transparent : true, opacity : 0.5 } );



        var floor = new THREE.Mesh(floorGeometry, floorMaterial2);
        floor.position.z = -1600;
        floor.rotation.z = -2;
//        scene.add(floor);

        window.floor = floor;

        var floor2 = new THREE.Mesh(floorGeometry, floorMaterial);
        floor2.position.z = -1700;
        floor2.rotation.z = -1;
//        floor.material.color.offsetHSL(0,0,-0.1);
//        floor2.material.color.offsetHSL(0,0,-0.1);
        scene.add(floor2);
    }

    function createNebula(){
        var star = new Image();
        star.onload = function(){
            nebula(star);
        }
        star.src = 'img/particles/star_4.png';
    }

    function nebula(star){
        console.time('nebula');
        var simplex = new SimplexNoise(),
            canvas = document.createElement('canvas'),
            overlay = document.createElement('canvas');

        canvas.height = 1024;
        canvas.width = 1024;
        overlay.height = canvas.height;
        overlay.width = canvas.width;

        var image = new Image(),
            ctx = canvas.getContext('2d'),
            overlayCtx = overlay.getContext('2d'),
            imgdata = ctx.getImageData(0, 0, canvas.width, canvas.height),
            data = imgdata.data,
            t = 0,
            starIntensity = 100,
            starSize = 32;

        overlayCtx.fillStyle = '0x000000';
        overlayCtx.fillRect(0,0,overlay.width, overlay.height);

        var f1 = canvas.height / 4,
            f2 = canvas.height / 16,
            f3 = canvas.height / 64,
            f4 = canvas.height / 128,
            w = canvas.width,
            h = canvas.height;

        var intensity, rnd, rnd2,
            baseHSL = Designer.colors.base.getHSL().h,
            color = new THREE.Color(),
            hsl;
        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                var r = simplex.noise3D(x / f1, y / f1, t) * 0.7 + 0.3;
                var g = simplex.noise3D(x / f2, y / f2, t);
                var b = simplex.noise3D(x / f3, y / f3, t);
                var d = simplex.noise3D(x / f4, y / f4, t);

                rnd = Math.random();
                rnd2 = Math.random();
                intensity = (r + g/4 + b/16 + d/32);

                var c1 = Math.pow(intensity,3),
                    c2 = intensity,
                    c3 = Math.pow(intensity,4);

//                color.setRGB(c1, c2, c3);
                color.setRGB(c2, c3, c1);
//                color.setRGB(c3, c1, c2);

//                color.offsetHSL(baseHSL - color.getHSL().h, color.getHSL().s < 0 ? -color.getHSL().s : -1, 0/*1 - color.getHSL().l*/);
                color.offsetHSL(0, color.getHSL().s < 0 ? -color.getHSL().s : -1, 0/*1 - color.getHSL().l*/);
//                color.offsetHSL(baseHSL - color.getHSL().h, -( color.getHSL().s*color.getHSL().s), -0.1);
//                color.offsetHSL(0, color.getHSL().s < 0.3 ? -color.getHSL().s : -0.2, -0.1);
//                color.offsetHSL(0, -color.getHSL().s/2, -0.1);
//                color.offsetHSL(0, -color.getHSL().s, 0);
                hsl = color.getHSL();
                if (rnd2 > 0.99) {
                    overlayCtx.rotate(Math.random());
//                    starSize = 0 + 48 * hsl.l*(1-Math.abs(hsl.s));
                    starSize = 0 + 48 * hsl.l;
                    overlayCtx.drawImage(star, x, y, starSize, starSize);
                }
                data[(x + y * w) * 4 + 0] = color.r * 255;
                data[(x + y * w) * 4 + 1] = color.g * 255;
                data[(x + y * w) * 4 + 2] = color.g * 255;
                data[(x + y * w) * 4 + 3] = 255;
            }
        }
//        ctx.putImageData(imgdata, 0, 0);

        var starField = overlayCtx.getImageData(0, 0, w, h).data,
            pos;

//        overlayCtx.globalCompositeOperation='lighter';

        for (var x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                pos = (x + y * w) * 4;
                data[pos + 0] += starField[pos + 0];
                data[pos + 1] += starField[pos + 1];
                data[pos + 2] += starField[pos + 2];
                data[pos + 3] += starField[pos + 3];
            }
        }

        ctx.putImageData(imgdata, 0, 0);

        var floorTexture = new THREE.ImageUtils.loadTexture( canvas.toDataURL() );
        floorTexture.repeat.set( 10,10 );
        floorTexture.wrapS = floorTexture.wrapT = THREE.MirroredRepeatWrapping;

        var floorGeometry = new THREE.PlaneGeometry(w * 100, h * 100, 50, 50);
        var offset = Math.random(),
            range = 0.1 * Math.random() + 0.1;
        console.log(Designer.colors.triad);
        var color;
//        var color = Designer.colors.base.offsetHSL(0, 0, -Designer.colors.base.getHSL().l/2),
//            hsl = color.getHSL();
        for (var i in floorGeometry.vertices){
            color = Designer.colors.analog[Math.random()*2>>0].clone().offsetHSL(Math.random()*0.1-0.05, 0, 0.2);
            floorGeometry.colors[i] = color;
        }
        var mapper = ['a', 'b', 'c'];
        for (var i in floorGeometry.faces){
            for (var j = 0; j < 3; j++) {
                floorGeometry.faces[i].vertexColors[j] = floorGeometry.colors[floorGeometry.faces[i][mapper[j]]];
            }
        }

        var floorMaterial = new THREE.MeshBasicMaterial( { fog : false, vertexColors : THREE.VertexColors,map: floorTexture, side: THREE.DoubleSide } );

        var floor2 = new THREE.Mesh(floorGeometry, floorMaterial);
        floor2.position.z = -5000;
        floor2.position.x = -500;
        floor2.position.y = -500;
        floor2.rotation.z = -1;
        scene.add(floor2);

        window.nebMat = floorMaterial;
        console.timeEnd('nebula');
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

        if ('durability' in obj) {
            indicator.add(obj);
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
        indicator.remove(obj);
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
        indicator.update();
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