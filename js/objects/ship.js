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

Ship.prototype.init = function(collider, startX, startY, behavior, behaviorOptions) {
    "use strict";

    if (collider && collider.track) {
        this.collider = collider;
        collider.track(this, this.stop, this);
    }
    this.geometry = null;
    this.x = startX ? startX : 0;
    this.y = startY ? startY : 0;

    this.lastFrame = new Date();
    this.currenFrame = null;
    this.speedFactor = 1;
    this.movingAngle = this.rotationAngle = this.currentSpeedY = this.currentSpeedX = this.rotationSpeed = 0;
    this.burst = false;
//    this.shipColor = (16777215 * Math.random() >> 0).toString(16)
    this.shipColor = (16777215 * Math.random() >> 0);

    this.keys = {};

    var self = this;

    switch (behavior) {
        case 'ship':
            this.speedFactor =70;

            this.applyBehavior = this.applyPressedKeys;
            this.bindEvents();
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
            this.applyBehavior = this.follow;
            this.speedFactor = Math.random()*50+20;
            this.target = behaviorOptions || null;
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
    for (var i in this.keys) {
        if (this.keys[i] != 77 && this.keydownEvents[this.keys[i]]) {
            this.keydownEvents[this.keys[i]].apply(this, [data]);
        }
    }
}

Ship.prototype.applyPressedKeys = function(delta){
    //console.log(this.keys);
    var codes = '[',
        flag = false;
    for (var i in this.keys) {
        if (this.keys[i] && this.keydownEvents[i]) {
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
        callback = function(){
//            spawnRandomParticle(self.x, self.y,0, 0, 10);
            self.currenFrame = new Date();

            if (self.running) {
                self.applyBehavior(self.currenFrame - self.lastFrame);
                self.action();
                //var tm = new Date();
                //console.log((new Date())-tm);
                self.lastFrame = self.currenFrame;
                self.animation = requestAnimationFrame(callback);
            } else {
                cancelAnimationFrame(this.animation);
//                self.destroy();
            }
            //ParticleFactory(self.ctx, self.x, self.y);
        };
    self.animation = requestAnimationFrame(callback);
    self.running = true;
    //setInterval(callback, 100);
};

Ship.prototype.stop = function(){
    this.running = false;
    this.draw(this.x, this.y, this.rotationAngle, true);
    collider.untrack(this);
    this.x = - 1000;
    this.y = - 1000;
    delete this;
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

    console.log();

    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(10, 0, 0));
    geometry.vertices.push(new THREE.Vector3( -5,  5, 0 ) );
    geometry.vertices.push(new THREE.Vector3( 0, 0, 0 ) );
    geometry.vertices.push(new THREE.Vector3( -5, -5, 0 ) );
    geometry.vertices.push(new THREE.Vector3( 10, 0, 0 ) );
    var material = new THREE.LineBasicMaterial({
//            vertexColors: true,
            color : new THREE.Color(self.shipColor)
        });
    this.geometry = new THREE.Line( geometry, material, 0);
    console.log(this.geometry);
};

Ship.prototype.follow = function(delta) {
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2(this.y - this.target.y, this.x - this.target.x);
    this.rotationAngle = this.targetAngle + pi;
    //this.movingAngle = angle;
    //this.keydownEvents['87'].apply(this, [delta/100]);
    this.currentSpeedX = Math.cos(this.rotationAngle)*delta/this.speedFactor;
    this.currentSpeedY = Math.sin(this.rotationAngle)*delta/this.speedFactor;
    //console.log('FOLLOW', distance, angle, delta);
};

Ship.prototype.bindEvents = function(){
    "use strict";
    console.log('bind events');
    var self = this;
    document.addEventListener('keydown', function(e){
//        console.log(e.keyCode);
        self.keys[e.keyCode] = true;
        //self.keydownEvents[e.keyCode].call(self);
    });
    document.addEventListener('keyup', function(e){
        self.keys[e.keyCode] = false;
        //self.keydownEvents[e.keyCode].call(self);
    });
    document.body.requestPointerLock = document.body.requestPointerLock    ||
        document.body.mozRequestPointerLock ||
        document.body.webkitRequestPointerLock;
    document.body.requestPointerLock();
    document.body.addEventListener('mousemove', function(e){
//        console.log(e);
        window.x = e.x;
        window.y = e.y;
        self.keys['77'] = true;
    })
};

Ship.prototype.keydownEvents = {
    '87' : function(time){
//        if (Math.pow(this.currentSpeedX, 2) + Math.pow(this.currentSpeedY, 2) < 10){
            this.currentSpeedX = this.currentSpeedX + Math.cos(this.rotationAngle)*time/this.speedFactor;
            this.currentSpeedY = this.currentSpeedY + Math.sin(this.rotationAngle)*time/this.speedFactor;
//        }

//        console.log(this.currentSpeedX);

        //this.movingAngle = Math.sqrt(Math.pow(this.currentSpeed,2) + 1 + 2*this.currentSpeed*Math.cos(this.movingAngle - this.rotationAngle));
    },
    '83' : function(time){
        this.currentSpeedX = this.currentSpeedX - Math.cos(this.rotationAngle)*time/this.speedFactor;
        this.currentSpeedY = this.currentSpeedY - Math.sin(this.rotationAngle)*time/this.speedFactor;
    },
    '65' : function(time){
        this.rotationSpeed += time/10000;
    },
    '68' : function(time){
        this.rotationSpeed -= time/10000;
    },
    '80' : function(){
        this.currentSpeedX = this.currentSpeedY = this.rotationSpeed = 0;
    },
    '32' : function(){
//        Explosion.detonate(this);
        Bullet.fire(this, this.rotationAngle);
        //var b = new Bullet(this.collider, this.ctx, this.x + 20*Math.cos(this.rotationAngle), this.y + 20*Math.sin(this.rotationAngle), this.rotationAngle);
//        b.rotationAngle = this.rotationAngle;
        this.keys['80'] = false;
    },
    '77' : function(){
        var width = bounds.width, height = bounds.height;
        var widthHalf = width / 2, heightHalf = height / 2;

        var vector = new THREE.Vector3();
        var projector = new THREE.Projector();
        projector.projectVector( vector.setFromMatrixPosition( this.geometry.matrixWorld ), camera );

        vector.x = ( vector.x * widthHalf ) + widthHalf;
        vector.y = - ( vector.y * heightHalf ) + heightHalf;
        this.rotationAngle = Math.atan2(window.x - vector.x, window.y - vector.y) - 1.57;

//        this.geometry.rotation.x = movingAngle - this.rotationAngle;
    }
};

Ship.prototype.action = function(){

    this.rotationAngle += this.rotationSpeed;

//    this.x = ( this.x + this.currentSpeedX + bounds.width ) % bounds.width - bounds.width/2;
//    this.y = ( this.y + this.currentSpeedY + bounds.height ) % bounds.height - bounds.height/2;

    this.x += this.currentSpeedX;
    this.y += this.currentSpeedY;

    this.geometry.position.x = this.x;
    this.geometry.position.y = this.y;
    this.geometry.rotation.z = this.rotationAngle;

    camera.position.x = this.x;
    camera.position.y = this.y;
};