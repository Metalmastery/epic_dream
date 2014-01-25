var bounds = {
    width : window.innerWidth,
    height : window.innerHeight
};

console.log(bounds);
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

    this.lastFrame = new Date();
    this.currenFrame = null;
    this.speedFactor = 0.01;
    this.rotationSpeedFactor = 1000;
    this.rotationAngle = this.currentSpeedY = this.currentSpeedX = this.rotationSpeed = 0;
//    this.shipColor = (16777215 * Math.random() >> 0).toString(16)
    this.shipColor = (16777215 * Math.random() >> 0);

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
            break;
        case 'ws':
            this.speedFactor =70;
            this.applyBehavior = this.applyWebSockets;
//            this.bindEvents();
            break;
        case 'follow':
//            setInterval(function(){
//                self.keydownEvents['80']();
//            }, Math.random()*1000 + 500);
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
            break;
        default :
            this.applyBehavior = this.bullet;
    }

    this.prepareRandomShip();
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

Ship.prototype.prepareRandomShip = function(){
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
        this.rotationSpeed = this.targetAngle / (Math.abs(this.targetAngle)*20); // TODO use rotationSpeedFactor to adjust rotation speed
    } else {
        this.rotationSpeed = 0;
        this.rotationAngle -= this.targetAngle;
    }

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate /*&& this.distance < 500*/ /*&& this.targetAngle < 0.2*/){
        // TODO implement conditions for attack - right angle, fire rate, right distance
        // TODO implement PREDICTION for attack while moving
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
    document.body.requestPointerLock = document.body.requestPointerLock    ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
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

//        console.log(this.currentSpeedX);

        //this.movingAngle = Math.sqrt(Math.pow(this.currentSpeed,2) + 1 + 2*this.currentSpeed*Math.cos(this.movingAngle - this.rotationAngle));
    },
    '83' : function(time){
        this.currentSpeedX = this.currentSpeedX - Math.cos(this.rotationAngle)*time/this.speedFactor;
        this.currentSpeedY = this.currentSpeedY - Math.sin(this.rotationAngle)*time/this.speedFactor;
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
//            factor = time / this.rotationSpeedFactor;
//        atan2(ax*by - bx*ay, ax*bx + ay*by);
        var targetAngle = Math.atan2((this.mouseX - halfWidth)*Math.sin(this.rotationAngle) - Math.cos(this.rotationAngle)*(halfHeight - this.mouseY), (this.mouseX - halfWidth)* Math.cos(this.rotationAngle) + Math.sin(this.rotationAngle)*(halfHeight - this.mouseY));
        if (Math.abs(targetAngle) > 0.05){
            this.rotationSpeed = - targetAngle / (Math.abs(targetAngle)*10); // TODO use rotationSpeedFactor to adjust rotation speed
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
//    document.body.style.backgroundPosition = -(this.x>>0) + 'px ' + (this.y>>0) + 'px';
};