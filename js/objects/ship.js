var bounds = {
    width : window.innerWidth,
    height : window.innerHeight
};

function Ship() {
    "use strict";

    this.init.apply(this, arguments);
    //console.log(this);
    return this;
}

Ship.prototype.init = function(startX, startY, behavior, behaviorOptions) {
    "use strict";
    // TODO implement ship construction from options object
    this.geometry = null;
    this.x = startX ? startX : 0;
    this.y = startY ? startY : 0;

    // TODO implement damage, durability indication
    // TODO can compute the size of the indication box with boundingSphere
    this.durability = Math.random()*100 + 50;

    this.lastFrame = new Date();
    this.speedFactor = 0.01;
    this.rotationSpeedFactor = 1000;
    this.rotationAngle = this.currentSpeedY = this.currentSpeedX = this.rotationSpeed = 0;
//    this.shipColor = (16777215 * Math.random() >> 0);
    this.shipColor = new THREE.Color();
    this.shipColor.setHSL(Math.random(),1,0.5);

	this.behavior = behavior;

    this.pressedKeys = {};

    var self = this;

    switch (behavior) {
        // TODO implement filler-functions for every behaviour
        case 'ship':
            this.speedFactor =10;

            this.applyBehavior = this.applyPressedKeys;
            this.bindEvents();
            this.colliderType = generateBitMask('ship');
            this.colliderAccept = generateBitMask(['bot', 'projectile']);
//            this.prepareRandomMeshShip();
            this.prepareRandomToroidalShip();
            window.ship = this;
            break;
        case 'ws':
            this.speedFactor =70;
			this.applyBehavior = this.applyWebSockets;
			this.colliderType = generateBitMask('ship');
			this.colliderAccept = generateBitMask(['bot', 'projectile']);
			this.prepareRandomToroidalShip();
//            this.bindEvents();
            break;
        case 'follow':
            this.rotationAngle = Math.random()*6.28;
            // TODO implement pre-orientation function

            this.attackTimer = 0;
            this.attackRate = (Math.random()*150>>0) + 10;

//            this.applyBehavior = this.followSimple;
//            this.applyBehavior = this.followSimpleConstantSpeed;
            this.applyBehavior = this.followAggressive;
//            this.applyBehavior = this.followAggressiveConstantSpeed;

            // TODO add behaviours like : patrol, hold distance, free seek
            this.speedFactor = 1; // followAggressive, followAggressiveConstantSpeed & followSimple
//            this.speedFactor = 10; // followSimpleConstantSpeed

            this.target = behaviorOptions || this;
            // TODO implement LOCATOR and target capture/loose

            this.colliderType = generateBitMask('bot');
            this.colliderAccept = generateBitMask(['ship', 'projectile']);
            this.distance = 0;
            this.targetAngle = 0;
//            this.prepareSimpleRandomShip();
            this.prepareRandomMeshShip();
            break;
        default :
            this.applyBehavior = this.bullet;
    }

};

Ship.prototype.applyWebSockets = function(data){
//    var codes = JSON.parse(data);
//    for (var i in codes) {
//        if (codes[i]!= 77 && this.keydownEvents[codes[i]]) {
//            this.keydownEvents[codes[i]].apply(this, [15]);
//            console.log(codes[i]);
//        }
//    }
    for (var i in this.pressedKeys) {
        if (this.pressedKeys[i] != 77 && this.keydownEvents[this.pressedKeys[i]]) {
            this.keydownEvents[this.pressedKeys[i]].apply(this, [data]);
        }
    }
}

Ship.prototype.applyPressedKeys = function(delta){
    //console.log(this.pressedKeys);
    var codes = '[',
        flag = false;
    for (var i in this.pressedKeys) {
        if (this.pressedKeys[i] && this.keydownEvents[i]) {
            this.keydownEvents[i].apply(this, [delta]);
            codes += i + ',';
            flag = true;
        }
    }
};

Ship.prototype.start = function(){
    "use strict";

//    console.log('start', this.img);

    var self = this,
        callback = function(time){
//            spawnRandomParticle(self.x, self.y,0, 0, 10);
//            self.currenFrame = new Date();
//            csl(scene.children.length);
            if (self.running && !self.collide) {
                self.applyBehavior(time);
                self.action(time);
            } else {
                self.stop();
            }

        };
    self.running = true;
    self.update = callback;
};

Ship.prototype.stop = function(){
    this.collide = false;
    engy.destroy(this);
    Explosion.detonate(this);
};

Ship.prototype.applyBehavior = function(delta){

};

Ship.prototype.bullet = function(delta){
    this.currentSpeedX = this.speedX*delta/this.speedFactor;
    this.currentSpeedY = this.speedY*delta/this.speedFactor;
};

Ship.prototype.prepareSimpleRandomShip = function(){
    "use strict";
    var self = this;

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    geometry.vertices.push(new THREE.Vector3( -5,  5, 0 ) );
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push(new THREE.Vector3( -5, -5, 0 ) );
    geometry.vertices.push(new THREE.Vector3( 10, 0, 0 ) );

//    THREE.GeometryUtils.merge(geometry, new THREE.SphereGeometry(5));

    var material = new THREE.LineBasicMaterial({
//            vertexColors: true,
            color : new THREE.Color(self.shipColor)
        });
    this.geometry = new THREE.Line( geometry, material, 0);
//    console.log('ship', this.geometry);
};

Ship.prototype.prepareRandomMeshShip = function(){
    "use strict";
    var self = this;

    var offsets = {
        frontX : 7 + Math.random()*3,
        frontY : 7 + Math.random()*3,
        backX : 2 + Math.random()*8,
        backY : - 7 + Math.random()*4,
        tailX : 2 + Math.random()*8,
        tailZ : Math.random()*2,
        cabineX : -Math.random(),
        cabineZ : Math.random(),
        cabineScale : 1.2 + Math.random()

    };

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(offsets.frontX, 0, 0));    // front corner
    geometry.vertices.push(new THREE.Vector3( -offsets.backX,  offsets.backY, 0 ) ); // back top
    geometry.vertices.push(new THREE.Vector3( 0, 0, 3) ); // back center
    geometry.vertices.push(new THREE.Vector3( -offsets.backX, -offsets.backY, 0 ) ); // back bottom

    geometry.vertices.push(new THREE.Vector3( -offsets.tailX, 0, offsets.tailZ ) ); // tail spike

    geometry.vertices.push(new THREE.Vector3( -3, 3, 1 ) ); // tail spike
    geometry.vertices.push(new THREE.Vector3( -3, -3, 1 ) ); // tail spike

    geometry.vertices.push(new THREE.Vector3( -1, 0, -1 ) ); // tail spike

    // bottom of ship
    geometry.faces.push(new THREE.Face3(0,1,2));
    geometry.faces.push(new THREE.Face3(2,3,0));

    // top without spike
    geometry.faces.push(new THREE.Face3(0,1,7));
    geometry.faces.push(new THREE.Face3(0,3,7));

    // spike
    geometry.faces.push(new THREE.Face3(4,1,2));
    geometry.faces.push(new THREE.Face3(4,3,2));
//    geometry.faces.push(new THREE.Face3(5,4,7));
//    geometry.faces.push(new THREE.Face3(6,4,7));

    geometry.computeFaceNormals();

    var scaler = new THREE.Matrix4();
    scaler.scale({x : offsets.cabineScale, y : 1, z : 1});
    scaler.setPosition({x : -offsets.cabineX, y : 0, z : offsets.cabineZ});
    var cabine = new THREE.SphereGeometry(2.5);
    cabine.applyMatrix(scaler);

    THREE.GeometryUtils.merge(geometry, cabine,0);

    var hsl = this.shipColor.getHSL();
    // TODO adjust colors in material
    var material = new THREE.MeshPhongMaterial({
        specular: this.shipColor.clone().offsetHSL(0,0,(1-hsl.l)),
        color: this.shipColor,
//        emissive: this.shipColor.clone().offsetHSL(0,2-hsl.s,-0.5),
        ambient: this.shipColor.clone().offsetHSL(0,0.3,1),
        shininess: 30,
        metal : true,
        side: THREE.DoubleSide,
        shading : THREE.SmoothShading
//        bumpMap: mapHeight // TODO use bumpMap for ships
//        map: mapHeight     // TODO use textures for ships
    } );


    this.geometry = new THREE.Mesh( geometry, material);
    this.geometry.rotation.order = 'ZYX';
//    this.geometry = new THREE.Mesh(geometry);
//    console.log('ship', this.geometry);
};

Ship.prototype.prepareRandomToroidalShip = function(){
    "use strict";

    var geometry = new THREE.TorusGeometry(5, 2);

    var scaler = new THREE.Matrix4();
    scaler.scale({x : 1.8, y : 1, z : 1});
    var cabine = new THREE.SphereGeometry(2.5);
    cabine.applyMatrix(scaler);
    var sub = new THREE.SphereGeometry(5);
    sub.applyMatrix(scaler);

    var torus = THREE.CSG.toCSG(new THREE.TorusGeometry(5, 2, 5, 50),new THREE.Vector3(0,0,0));
    var sphere   = THREE.CSG.toCSG(sub, new THREE.Vector3(3.5,0,0));
    var cab   = THREE.CSG.toCSG(cabine, new THREE.Vector3(-3.5,0,0));

    var geometry = torus.subtract(sphere).union(cab);
//    var mesh     = new THREE.Mesh(THREE.CSG.fromCSG( geometry ),new THREE.MeshNormalMaterial());

//    geometry.computeFaceNormals();

    var hsl = this.shipColor.getHSL();
    // TODO adjust colors in material
    var material = new THREE.MeshPhongMaterial({
        specular: this.shipColor.clone().offsetHSL(0,0,(0.9-hsl.l)),
        color: this.shipColor,
        ambient: this.shipColor.clone().offsetHSL(0,0.3,1),
        shininess: 30,
        metal : true,
        side: THREE.DoubleSide
//        shading : THREE.SmoothShading
    } );

//    this.geometry = new THREE.Mesh( geometry, material);
    this.geometry = new THREE.Mesh(THREE.CSG.fromCSG( geometry ),material);
    this.geometry.rotation.order = 'ZYX';
//    this.geometry = new THREE.Mesh(geometry);
//    console.log('ship', this.geometry);
};

Ship.prototype.followAggressive = function(delta) {
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2((this.x - this.target.x)*Math.sin(this.rotationAngle) - Math.cos(this.rotationAngle)*(this.y - this.target.y), (this.x - this.target.x)* Math.cos(this.rotationAngle) + Math.sin(this.rotationAngle)*(this.y - this.target.y));
    var deltaX =  Math.cos(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/1000,
        deltaY = Math.sin(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/1000;
        // TODO implement follow distance
    if (Math.pow(this.currentSpeedX + deltaX, 2) + Math.pow(this.currentSpeedY + deltaY, 2) < 36){
        // TODO implement speed limit
        this.currentSpeedX += deltaX;
        this.currentSpeedY += deltaY;
    }

    if (Math.abs(this.targetAngle) > 0.05){
        this.rotationSpeed = this.targetAngle / (Math.abs(this.targetAngle)*20) * delta; // TODO use rotationSpeedFactor to adjust rotation speed
    } else {
        this.rotationSpeed = 0;
        this.rotationAngle -= this.targetAngle;
    }

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate /*&& this.distance < 500*/ /*&& this.targetAngle < 0.2*/){
        // TODO implement conditions for attack - right angle, fire rate, right distance
        // TODO implement PREDICTION for attack while moving (try this.currentSpeed* in target angle computation)
        Bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }
};

Ship.prototype.followAggressiveConstantSpeed = function(delta) {
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2((this.x - this.target.x)*Math.sin(this.rotationAngle) - Math.cos(this.rotationAngle)*(this.y - this.target.y), (this.x - this.target.x)* Math.cos(this.rotationAngle) + Math.sin(this.rotationAngle)*(this.y - this.target.y));
    this.currentSpeedX = Math.cos(this.rotationAngle)*delta/this.speedFactor;
    this.currentSpeedY = Math.sin(this.rotationAngle)*delta/this.speedFactor;

    if (Math.abs(this.targetAngle) > 0.05){
        this.rotationSpeed = this.targetAngle / (Math.abs(this.targetAngle)*20); // TODO use rotationSpeedFactor to adjust rotation speed
    } else {
        this.rotationSpeed = 0;
        this.rotationAngle -= this.targetAngle;
    }

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate){
        Bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }

    //console.log('FOLLOW', distance, angle, delta);
};

Ship.prototype.followSimple = function(delta) {
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
    var deltaX = Math.cos(this.rotationAngle)*delta/this.speedFactor*(this.distance - 300)/1000,
        deltaY = Math.sin(this.rotationAngle)*delta/this.speedFactor*(this.distance - 300)/1000;
    if (Math.pow(this.currentSpeedX + deltaX, 2) + Math.pow(this.currentSpeedY + deltaY, 2) < 36){
        this.currentSpeedX += deltaX;
        this.currentSpeedY += deltaY;
    }
    this.rotationAngle = this.targetAngle + Math.PI;

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate){
        Bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }

    //console.log('FOLLOW', distance, angle, delta);
};

Ship.prototype.followSimpleConstantSpeed = function(delta) {
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2(this.y - this.target.y, this.x - this.target.x);

    this.currentSpeedX += Math.cos(this.rotationAngle)*delta/this.speedFactor;
    this.currentSpeedY += Math.sin(this.rotationAngle)*delta/this.speedFactor;
//    this.currentSpeedX += Math.cos(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/200;
//    this.currentSpeedY += Math.sin(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/200;
//    this.currentSpeedX += Math.cos(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/200;
//    this.currentSpeedY += Math.sin(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/200;

    this.rotationAngle = this.targetAngle + Math.PI;

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate){
        Bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }

    //console.log('FOLLOW', distance, angle, delta);
};


Ship.prototype.bindEvents = function(){
    "use strict";
    console.log('bind events');
    var self = this;
    document.addEventListener('keydown', function(e){
//        console.log(e.keyCode);
        self.pressedKeys[e.keyCode] = true;
        //self.keydownEvents[e.keyCode].call(self);
    });
    document.addEventListener('keyup', function(e){
        self.pressedKeys[e.keyCode] = false;
        //self.keydownEvents[e.keyCode].call(self);
    });
    document.body.addEventListener('mousemove', function(e){
//        console.log(e);
        self.mouseX = e.x;
        self.mouseY = e.y;
//        self.pressedKeys['77'] = true;
        self.pressedKeys['101'] = true;
    })
};

Ship.prototype.keydownEvents = {
    '87' : function(time){
        var deltaX = Math.cos(this.rotationAngle)*time/this.speedFactor,
            deltaY = Math.sin(this.rotationAngle)*time/this.speedFactor;
        if (Math.pow(this.currentSpeedX + deltaX, 2) + Math.pow(this.currentSpeedY + deltaY, 2) < 36){
            this.currentSpeedX = this.currentSpeedX + Math.cos(this.rotationAngle)*time/this.speedFactor;
            this.currentSpeedY = this.currentSpeedY + Math.sin(this.rotationAngle)*time/this.speedFactor;
        }
    },
    '83' : function(time){
//        this.currentSpeedX = this.currentSpeedX - Math.cos(this.rotationAngle)*time/this.speedFactor;
//        this.currentSpeedY = this.currentSpeedY - Math.sin(this.rotationAngle)*time/this.speedFactor;
    },
    '65' : function(time){
        this.rotationSpeed += time/this.rotationSpeedFactor;
    },
    '68' : function(time){
        this.rotationSpeed -= time/this.rotationSpeedFactor;
    },
    '80' : function(){
        this.currentSpeedX = this.currentSpeedY = this.rotationSpeed = 0;
    },
    '32' : function(){
//        Explosion.detonate(this);
        Bullet.fire(this, this.rotationAngle);
        //var b = new Bullet(this.collider, this.ctx, this.x + 20*Math.cos(this.rotationAngle), this.y + 20*Math.sin(this.rotationAngle), this.rotationAngle);
//        b.rotationAngle = this.rotationAngle;
        this.pressedKeys['80'] = false;
    },
    '77' : function(){
        return false;
        var width = bounds.width, height = bounds.height;
        var widthHalf = width / 2, heightHalf = height / 2;

        var vector = new THREE.Vector3();
        var projector = new THREE.Projector();
        projector.projectVector( vector.setFromMatrixPosition( this.geometry.matrixWorld ), camera );

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;
        this.rotationAngle = Math.atan2(window.x - vector.x, window.y - vector.y) - 1.57;

//        this.geometry.rotation.x = movingAngle - this.rotationAngle;
    },
    '101': function(time){
        var halfWidth = bounds.width >> 1,
            halfHeight = bounds.height >> 1;
        var targetAngle = Math.atan2((this.mouseX - halfWidth)*Math.sin(this.rotationAngle) - Math.cos(this.rotationAngle)*(halfHeight - this.mouseY), (this.mouseX - halfWidth)* Math.cos(this.rotationAngle) + Math.sin(this.rotationAngle)*(halfHeight - this.mouseY));
        if (Math.abs(targetAngle) > 0.05){
            this.rotationSpeed = - targetAngle / (Math.abs(targetAngle)*10)*time; // TODO use rotationSpeedFactor to adjust rotation speed
        } else {
            this.rotationSpeed = 0;
            this.rotationAngle -= targetAngle;
        }

    }
};

Ship.prototype.action = function(time){

    this.rotationAngle += this.rotationSpeed;
    if (this.rotationAngle < 0){
        this.rotationAngle += 6.28;
    } else if (this.rotationAngle > 6.28){
        this.rotationAngle -= 6.28;
    }
//    this.x = ( this.x + this.currentSpeedX + bounds.width ) % bounds.width - bounds.width/2;
//    this.y = ( this.y + this.currentSpeedY + bounds.height ) % bounds.height - bounds.height/2;

    this.x += this.currentSpeedX * time;
    this.y += this.currentSpeedY * time;

    this.geometry.position.x = this.x;
    this.geometry.position.y = this.y;
    this.geometry.rotation.z = this.rotationAngle;
//    this.geometry.rotation.x = -this.rotationSpeed*5; // TODO rotation around the own axis while rotating on Z
//    document.body.style.backgroundPosition = -(this.x>>0) + 'px ' + (this.y>>0) + 'px';
};