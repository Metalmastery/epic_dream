var bounds = {
    width : window.innerWidth,
    height : window.innerHeight
};

var shipTypes = {
    ship : {
        attackRate : 10,
        geometryType : 'torusShip',
        desiredBehavior : 'applyPressedKeys',
//        desiredBehavior : 'idle',
        colliderType : bitMapper.generateMask(['ship', 'bot'])

    },
    test : {
        colliderType : bitMapper.generateMask(['ship', 'bot'])
    }
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
    this.sin = this.cos = 0;
    this.velocityAngle = 0;
    this.velocity = 0;

    this.idleTimer = 0;
    this.idleLimit = 200;

    //TODO channel registration for every member

    this.flame = shaderFlame;

    this.active = Math.random() > 0.5;

    this.fleet = null;
    this.attackMode = true;
    this.avoidMode = true;

    this.uniq = engy.collider.getId();

    this.alive = true;

    this.speedFactor = 5 + Math.random()*60;
//    this.rotationSpeedFactor = 1 + Math.random()*20;
    this.speedLimit = 2 - this.speedFactor / 60;
    this.speedLimitSquared = Math.pow(this.speedLimit, 2);
    this.rotationSpeedFactor = 30;
    this.rotationAcceleration = 0.0001 + Math.random()*0.005;

    this.rotationAngle = this.currentSpeedY = this.currentSpeedX = this.rotationSpeed = 0;


    // TODO GLOBAL CONTROLS FOR SHIP
    this.engineEnabled = false;
    this.enginePower = 1;
    this.rotationEnabled = true;

    this.score = 0;
    this.rank = 0;

    // TODO implement damage, durability indication
    // TODO can compute the size of the indication box with boundingSphere
//    this.totalDurability = (Math.random()*50>>0) + 20;
    this.totalDurability = 20;
    this.durability = this.totalDurability;
    this.indicatorSize = 25;

    this.radius = 7;

    this.target = null;
    this.targetAngle = 0;
    this.distance = 0;

    this.weapon = bullet;

    this.pressedKeys = {};
    this.attackTimer = 0;
    this.attackRate = (Math.random()*100>>0) + 50;

    this.colliderAccept = bitMapper.generateMask(['ship', 'projectile']);

    // TODO fsm params
    this.avoidanceDistance = 200 + Math.random()* 200;
    this.avoidanceAngle = 1 + Math.random() * 2;
    this.closeUpDistance = this.avoidanceDistance + Math.random()*300;
//    console.log('avoidanceDistance', this.avoidanceDistance);
//    console.log('closeUpDistance', this.closeUpDistance);

    this.geometryType = 'basicShip';
//    this.geometryType = 'simple2DShip';
    this.desiredBehavior = 'idle';

    this.colliderType = bitMapper.generateMask(['ship']);

    var self = this;

//    switch (behavior) {
//        // TODO implement filler-functions for every behaviour
//        case 'ship':
//
//            this.attackRate = 10;
//            this.desiredBehavior = 'applyPressedKeys';
//            this.bindEvents();
//            this.colliderType = bitMapper.generateMask(['ship', 'player']);
//            this.geometryType = 'torusShip';

//            break;
//        case 'test':
//
//            break;
//        default:
//            this.applyBehavior = this.bullet;
//    }

    this.patchWithType(behavior);

    this.geometry = Designer.giveMe(this.geometryType);
    this.geometry.ship = this;
    this.geometry.scale.multiplyScalar(2);

    this.applyBehavior = this[this.desiredBehavior];
    this.lastBehavior = this.applyBehavior;
};

Ship.prototype.patchWithType = function(type){
    if (type && shipTypes[type]){
        for (var i in shipTypes[type]) {
            this[i] = shipTypes[type][i];
        }
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
};

Ship.prototype.applyPressedKeys = function(delta){
    //console.log(this.pressedKeys);
    this.engineEnabled = false;
    for (var i in this.keydownEvents) {
        if (engy.controls.keyboardMap[i]) {
            this.keydownEvents[i].apply(this, [delta]);
        }
    }
    if (engy.controls.mouseMap.moving){
        this.keydownEvents['101'].apply(this, [delta]);
    }
};

Ship.prototype.start = function(){
    "use strict";

//    console.log('start', this.img);

    var self = this;
    self.running = true;

};

Ship.prototype.update = function(time){
    if (this.running) {
        if (this.collide && this.collide.source != this){
            // TODO implements collision checking and reactions

            if (bitMapper.is('ship', this.collide)/* && this.collide.fleet.uniq != this.fleet.uniq*/) {
//                        this.stop();
            }

            if (bitMapper.is('projectile', this.collide)/* && this.collide.source.fleet.uniq != this.fleet.uniq*/) {
                this.durability--;

                this.setIdle();

                // TODO mutual targeting
                this.target = this.collide.source;
                this.collide.source.target = this;

                if (this.fleet){
                    if (!this.collide.source.target){
                        this.collide.source.fleet.reportTarget(this.collide.source, this);
                    }
                    console.info('UNDER ATTACK', this.collide.source);
                    if (!this.target) {
                        this.fleet.reportTarget(this, this.collide.source);
                    }
                }
            }

            this.collide = false;
        }
        if (this.durability < 0 ) {
            this.stop();
        }
        this.prepareData(time);
        this.applyBehavior(time);
        this.action(time);
    } else {
        this.stop();
    }
};

Ship.prototype.stop = function(){
    console.info(this.faction + ' FACTION SHIP DESTROYED');
    if (this.fleet) {
        this.fleet.remove(this);
    }
    this.alive = false;
    this.collide = false;
    engy.destroy(this);
    Explosion.detonate(this);
};

Ship.prototype.applyBehavior = function(delta){

};

Ship.prototype.stopBehavior = function(delta){
    this.rotationSpeed = 0;
    this.targetAngle = this.rotationAngle;
    this.currentSpeedX = this.currentSpeedY = 0;
    this.engineEnabled = false;

};

Ship.prototype.prepareData = function(delta){
    this.sin = Math.sin(this.rotationAngle);
    this.cos = Math.cos(this.rotationAngle);
//    this.velocityAngle = Math.atan2(this.currentSpeedX*this.sin + this.cos*this.currentSpeedY, this.currentSpeedX* this.cos - this.sin*this.currentSpeedY);
    this.velocity = Math.sqrt(Math.pow(this.currentSpeedX, 2) + Math.pow(this.currentSpeedY, 2));
};

Ship.prototype.idle = function(delta){
//    console.log('switch to IDLE');
    this.rotationEnabled = false;
    this.engineEnabled = false;
    this.idleTimer += delta;
    if (this.idleTimer > this.idleLimit) {
        this.idleTimer = 0;
        this.applyBehavior = this.lastBehavior;
        this.rotationEnabled = true;
    }
};

Ship.prototype.setIdle = function(){
    this.idleTimer = 0;
    if (this.applyBehavior == this.idle){
        return false;
    }
    this.idleLimit = 30 + Math.random()*100;
    this.lastBehavior = this.applyBehavior;
    this.applyBehavior = this.idle;
};

Ship.prototype.brake = function(delta){
    console.log('switch to STOP');
    this.targetAngle = Math.atan2(this.currentSpeedX*this.sin - this.cos*this.currentSpeedY, -this.currentSpeedX*this.cos - this.sin*this.currentSpeedY);
//    console.log(this.targetAngle);

    if (this.velocity < 0.01){
        console.log('switch to DECISION');
        this.engineEnabled = false;
//        this.applyBehavior = this.reachPoint;
        this.applyBehavior = this.makeDecision;
    } else if (Math.abs(this.targetAngle) < 0.01) {
        this.engineEnabled = true;
    }
};

Ship.prototype.flee = function(delta){
    console.log('switch to FLEE');
    var distX = this.target.x - this.x,
        distY = this.target.y - this.y,
        sin = this.sin,
        cos = this.cos;
//    this.targetAngle = Math.atan2( distX * sin - cos * distY, -distX * cos - sin * distY);
//    this.targetAngle = this.targetAngle - this.avoidanceAngle * (1 - (this.distance*this.distance)/(this.avoidanceDistance*this.avoidanceDistance)) * (Math.abs(this.targetAngle)/(this.targetAngle));
    this.targetAngle = this.targetAngle - this.avoidanceAngle;
    this.engineEnabled = true;
    this.distance = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
    if (this.distance > this.avoidanceDistance){
        this.applyBehavior = this.reachPoint;
    }
};

Ship.prototype.avoid = function(delta){
    console.log('switch to AVOID');
    var distX = this.target.x - this.x,
        distY = this.target.y - this.y,
        sin = this.sin,
        cos = this.cos,
        calcTime;
//    this.targetAngle = this.targetAngle - this.avoidanceAngle;
    this.engineEnabled = true;
    this.distance = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));

    calcTime = this.distance / (this.velocity + 0.00001);

    distX -= (0 + this.target.currentSpeedX) * calcTime;
    distY -= (0 + this.target.currentSpeedY) * calcTime;

    if (this.distance > this.avoidanceDistance){
        this.applyBehavior = this.reachPoint;
    }

    this.targetAngle = Math.atan2( -distX * sin + cos * distY, distX * cos + sin * distY);
    this.targetAngle -= this.avoidanceAngle * (this.targetAngle / Math.abs(this.targetAngle));
};

Ship.prototype.makeDecision = function(){

    ship.x = 200 - Math.random()*400;
    ship.y = 200 - Math.random()*400;

    this.target = ship;

    this.applyBehavior = this.reachPoint;
//    this.applyBehavior = this.trackPoint;
};

Ship.prototype.rotate = function(delta){
    var fullStopTime,
        reachTargetAngleTime;
    if (Math.abs(this.targetAngle) > 0.05){
        this.rotationSpeed = this.targetAngle / (Math.abs(this.targetAngle + 0.0000001)*this.rotationSpeedFactor) * delta;
    } else {
        this.rotationSpeed = 0;
//        this.rotationSpeed -= this.targetAngle / Math.abs(this.targetAngle + 0.0000001) * 0.01 * delta;
    }
//    this.rotationAngle += this.targetAngle;
};

Ship.prototype.move = function(delta){

    if (!this.engineEnabled) {
        return false;
    }
    var sin = this.sin,
        cos = this.cos,
        thrust = this.enginePower*delta/this.speedFactor,
        diffX = thrust * cos,
        diffY = thrust * sin,
        condition = (Math.pow(this.currentSpeedX + diffX,2) + Math.pow(this.currentSpeedY + diffY,2) < this.speedLimitSquared);
//            condition = 1;
    if (condition){
        this.currentSpeedX += diffX * condition;
        this.currentSpeedY += diffY * condition;
    } else {
        this.currentSpeedX = (this.currentSpeedX + diffX) / (this.speedLimit + thrust) * this.speedLimit;
        this.currentSpeedY = (this.currentSpeedY + diffY) / (this.speedLimit + thrust) * this.speedLimit;
    }
    this.flame.fireByParams('jet2',this.x, this.y, this.radius, 0, this.currentSpeedX, this.currentSpeedY, this.cos, this.sin);
};

Ship.prototype.attack = function(delta){
    this.attackTimer += delta;
    if (this.attackTimer > this.attackRate && Math.abs(this.targetAngle) < this.weapon.precisionAngle && this.distance < 500 && this.attackMode){
        this.weapon.fire(this);
        this.attackTimer = 0;
    }
};

Ship.prototype.reachPoint = function(delta){
//    console.log(this.target);
//    console.log('switch to REACH POINT');
    this.engineEnabled = false;
    var sin = this.sin,
        cos = this.cos,
        k = 0,
//        k = this.velocity > this.speedLimit / 2 ? (1 - this.distance / 500) : 0,
        calcTime;
    var distX = this.target.x - this.x,
        distY = this.target.y - this.y;
    this.distance = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
    if (this.distance < 500){
        k = (1 - this.distance / 500);
        calcTime = this.distance / (this.velocity + 0.00001);
        distX -= this.currentSpeedX * calcTime * k;
        distY -= this.currentSpeedY * calcTime * k;
    }
//    if (this.distance < this.avoidanceDistance ){
//        this.applyBehavior = this.avoid;
//    }

//    if (this.velocity > this.speedLimit * 0.8 && Math.abs(this.velocityAngle - this.targetAngle) > 1.57){
//        this.applyBehavior = this.brake;
//        console.log('switch to BRAKE');
//    } else
    if (this.distance < 30){
        this.applyBehavior = this.makeDecision;
//        this.applyBehavior = this.brake;
    } else {
        this.targetAngle = Math.atan2( -distX * sin + cos * distY, distX * cos + sin * distY);
        if (Math.abs(this.targetAngle) < 1){
            this.engineEnabled = true;
        }
    }
};

Ship.prototype.attackTarget = function(delta){
//    console.log(this.target);
    this.engineEnabled = false;
    var sin = this.sin,
        cos = this.cos;
    var distX = this.target.x - this.x,
        distY = this.target.y - this.y;
    this.distance = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
        distX += this.distance / this.weapon.speed * (this.target.currentSpeedX - this.currentSpeedX);
        distY += this.distance / this.weapon.speed * (this.target.currentSpeedY - this.currentSpeedY);

    this.targetAngle = Math.atan2( -distX * sin + cos * distY, distX * cos + sin * distY);

//    if (Math.abs(this.targetAngle) < 0.1){
        this.engineEnabled = true;
//    }

    this.attack(delta);
};

Ship.prototype.track = function(delta){
    if (!this.rotationEnabled){
        return false;
    }
    var fullStopTime,
        reachTargetAngleTime,
        a = this.rotationAcceleration,
        limitFlag,
        diff;
//    fullStopTime = Math.abs((this.rotationSpeed + a) / a);
    fullStopTime = Math.abs((this.rotationSpeed) / a);
    reachTargetAngleTime = (this.targetAngle / (this.rotationSpeed + 0.0000001));
    if (reachTargetAngleTime >= 0 && fullStopTime >= reachTargetAngleTime) {
        a = -a;
    }
    diff = this.targetAngle / Math.abs(this.targetAngle + 0.0000001) * a * delta;
    limitFlag = Math.abs(this.rotationSpeed + diff) < 0.1;
    this.rotationSpeed += diff * (+limitFlag);

//    if (Math.abs(this.targetAngle) < a * 2 && Math.abs(this.rotationSpeed) < a * 2) {
    if (Math.abs(this.targetAngle) < 0.01 && Math.abs(this.rotationSpeed) < a * 2) {
        this.rotationSpeed = 0;
    }
};

Ship.prototype.trackPoint = function(delta){
    var fullStopTime,
        reachTargetAngleTime,
        a = 0.01,
        limitFlag,
        diff;
    var sin = this.sin,
        cos = this.cos;
    var distX = this.target.x - this.x,
        distY = this.target.y - this.y;
    this.targetAngle = Math.atan2( -distX * sin + cos * distY, distX * cos + sin * distY);
    fullStopTime = Math.abs(this.rotationSpeed / a);
    reachTargetAngleTime = Math.abs(this.targetAngle / this.rotationSpeed);
    if (fullStopTime > reachTargetAngleTime) {
        a *= -1;
    }
    diff = this.targetAngle / Math.abs(this.targetAngle + 0.0000001) * a * delta;
    limitFlag = Math.abs(this.rotationSpeed + diff) < 0.1;
    this.rotationSpeed += diff * (+limitFlag);

    if (Math.abs(this.rotationSpeed) < 0.05 && Math.abs(this.targetAngle) < 0.05) {
        this.applyBehavior = this.makeDecision;
    }
};

Ship.prototype.simpleAction = function(delta){
    this.rotate(delta);
    this.move(delta);
};



Ship.prototype.followTest = function(delta) {
    if (!this.active) {
        this.active = !this.active;
        return false;
    }

    if (!this.target) {
        return false;
    }

    if (!this.target.alive) {
//        console.error('TARGET DESTROYED');
        if (this.fleet) {
            this.fleet.reportTargetDestroyed(this, this.target);
        }
        this.target = null;
        return false;
    }

    var lastDistance = this.distance,
        force = false,
        realTargetAngle,
        vAngle,
        factor = this.speedFactor,
        sin = Math.sin(this.rotationAngle),
        cos = Math.cos(this.rotationAngle),
        distX = this.target.x - this.x,
        distY = this.target.y - this.y,
        vDiffX = this.target.currentSpeedX - this.currentSpeedX,
        vDiffY = this.target.currentSpeedY - this.currentSpeedY,
        projectileTime = this.distance / this.weapon.speed,
        vDeltaX, vDeltaY;

    this.engineEnabled = false;

    this.cos = cos;
    this.sin = sin;

    this.distance = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
//    var shootAngle = Math.atan2((projectileTime * vDiffX + distX) * sin - cos * (distY + projectileTime * vDiffY), (distX + projectileTime * vDiffX) * cos + sin * (distY + projectileTime * vDiffY));
    this.targetAngle = Math.atan2(distX * sin - cos * distY, distX * cos + sin * distY);
//    this.targetAngle = shootAngle;
//    vAngle = Math.atan2(this.currentSpeedX*sin - cos*this.currentSpeedY, this.currentSpeedY*sin + cos*this.currentSpeedX);
        vAngle = Math.atan2(this.currentSpeedX*sin + cos*this.currentSpeedY, this.currentSpeedX* cos - sin*this.currentSpeedY);
    realTargetAngle = this.targetAngle;


    if (this.distance < this.avoidanceDistance && lastDistance > this.distance && this.avoidMode) {
        this.avoid(delta);
        factor /= 2;
        force = this.avoidMode;
    } else
//    if (this.distance < 100 && !this.avoidMode || this.distance > 700 && lastDistance < this.distance && Math.abs(this.targetAngle) > 1 && (Math.abs(this.currentSpeedX) > 1 || Math.abs(this.currentSpeedY) > 1)) {
    if (this.distance < this.avoidanceDistance && !this.avoidMode || this.distance > this.closeUpDistance && Math.abs(vAngle - this.targetAngle) > 1.57 && (Math.abs(this.currentSpeedX) > 0.01 || Math.abs(this.currentSpeedY) > 0.01)) {
        this.brake(delta);
        factor /= 2;
        force = this.engineEnabled;
    }

    if (this.distance > this.avoidanceDistance /*&& Math.abs(this.targetAngle) < 0.2*/ || force) {
       this.move(delta);
//        this.currentSpeedX += vDeltaX*(Math.abs(this.currentSpeedX+2*vDeltaX) < this.speedLimit);
//        this.currentSpeedY += vDeltaY*(Math.abs(this.currentSpeedX+2*vDeltaY) < this.speedLimit);
    }

    this.rotate(delta);

    this.attackTimer += delta;
    if (this.attackTimer > this.attackRate && Math.abs(this.targetAngle) < this.weapon.precisionAngle && this.distance < 500 && this.attackMode){
        this.weapon.fire(this);
        this.attackTimer = 0;
    }

//    window.log = ['FOLLOW', this.distance, this.targetAngle, vAngle].join(' ');
};

Ship.prototype.seek = function(delta){
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));

    var totalSpeed = Math.sqrt(Math.pow(this.currentSpeedX,2) + Math.pow(this.currentSpeedY,2));

    var normalizedSpeedX = this.currentSpeedX / totalSpeed;
    var normalizedSpeedY = this.currentSpeedY / totalSpeed;

    var maxV = 6;
    var speedUp = 1;

    var targetX = (this.target.x - this.x) / this.distance * maxV;
    var targetY = (this.target.y - this.y) / this.distance * maxV;

//    if (this.distance < 200) {
//        var tmp = targetX;
//        targetX += targetY * 200/this.distance;
//        targetY -= tmp * 200/this.distance;
//    }

    var steeringX = speedUp*(targetX - this.currentSpeedX);
    var steeringY = speedUp*(targetY - this.currentSpeedY);

    this.currentSpeedX = this.currentSpeedX + steeringX/50;
    this.currentSpeedY = this.currentSpeedY + steeringY/50;

    var angleV = Math.atan2(this.currentSpeedY, this.currentSpeedX);
    this.rotationAngle = angleV;

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate){
        bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }
};

Ship.prototype.followAggressive = function(delta) {
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2((this.x - this.target.x)*Math.sin(this.rotationAngle) - Math.cos(this.rotationAngle)*(this.y - this.target.y), (this.x - this.target.x)* Math.cos(this.rotationAngle) + Math.sin(this.rotationAngle)*(this.y - this.target.y));
//    var deltaX =  Math.cos(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/1000,
//        deltaY = Math.sin(this.rotationAngle)*delta/this.speedFactor*(this.distance - 200)/1000;

    if (this.distance < 150){
//        this.targetAngle = (this.targetAngle/Math.abs(this.targetAngle))*(3 - Math.abs(this.targetAngle));
        this.targetAngle = -this.targetAngle/Math.abs(this.targetAngle)*2.1 ;
    }

    var deltaX =  Math.cos(this.rotationAngle)*delta/this.speedFactor,
        deltaY = Math.sin(this.rotationAngle)*delta/this.speedFactor,
        invertAngle = 1;
    // TODO implement follow distance

    if (Math.pow(this.currentSpeedX + deltaX, 2) + Math.pow(this.currentSpeedY + deltaY, 2) < 16){
        // TODO implement speed limit
        this.currentSpeedX += deltaX;
        this.currentSpeedY += deltaY;
//        this.flame.fireByParams(this.x, this.y, this.radius, this.rotationAngle,this.currentSpeedX,this.currentSpeedY);
        invertAngle = -1;
    }

    if (Math.abs(this.targetAngle) > 0.05){
        this.rotationSpeed = invertAngle * this.targetAngle / (Math.abs(this.targetAngle)*20) * delta; // TODO use rotationSpeedFactor to adjust rotation speed
    } else {
        this.rotationSpeed = 0;
        this.rotationAngle -= this.targetAngle;
    }

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate /*&& this.distance < 500*/ /*&& this.targetAngle < 0.2*/){
        // TODO implement conditions for attack - right angle, fire rate, right distance
        // TODO implement PREDICTION for attack while moving (try this.currentSpeed* in target angle computation)
        bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }
};

Ship.prototype.followAggressiveConstantSpeed = function(delta) {
    this.flame.fireByParams('jet2',this.x, this.y, this.radius, this.rotationAngle,0,0);
    this.distance = Math.sqrt(Math.pow(this.x - this.target.x,2) + Math.pow(this.y - this.target.y,2));
    this.targetAngle = Math.atan2((this.x - this.target.x)*Math.sin(this.rotationAngle) - Math.cos(this.rotationAngle)*(this.y - this.target.y), (this.x - this.target.x)* Math.cos(this.rotationAngle) + Math.sin(this.rotationAngle)*(this.y - this.target.y));
    this.currentSpeedX = Math.cos(this.rotationAngle)*delta/this.speedFactor;
    this.currentSpeedY = Math.sin(this.rotationAngle)*delta/this.speedFactor;

    if (Math.abs(this.targetAngle) > 0.01){
        this.rotationSpeed = this.targetAngle / (Math.abs(this.targetAngle + 0.0000001)*this.rotationSpeedFactor); // TODO use rotationSpeedFactor to adjust rotation speed
    } else {
        this.rotationSpeed = 0;
        this.rotationAngle -= this.targetAngle;
    }

//    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate && this.attackMode){
        bullet.fire(this, this.rotationAngle);
        this.audio.play();
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
        this.flame.fireByParams('jet',this.x, this.y, this.radius, this.rotationAngle,this.currentSpeedX,this.currentSpeedY);
    }
    this.rotationAngle = this.targetAngle + Math.PI;

    this.attackTimer += delta;

    if (this.attackTimer > this.attackRate){
        bullet.fire(this, this.rotationAngle);
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
        bullet.fire(this, this.rotationAngle);
        this.attackTimer = 0;
    }

    //console.log('FOLLOW', distance, angle, delta);
};

Ship.prototype.keydownEvents = {
    '87' : function(time){
        this.engineEnabled = true;
    },
    '83' : function(time){
//        this.currentSpeedX = this.currentSpeedX - Math.cos(this.rotationAngle)*time/this.speedFactor;
//        this.currentSpeedY = this.currentSpeedY - Math.sin(this.rotationAngle)*time/this.speedFactor;
    },
    '65' : function(time){
        var diff = this.rotationSpeed + this.rotationAcceleration * time;
        if (Math.abs(diff) < 0.1){
            this.rotationSpeed = diff;
        }
    },
    '68' : function(time){
        var diff = this.rotationSpeed - this.rotationAcceleration * time;
        if (Math.abs(diff) < 0.1){
            this.rotationSpeed = diff;
        }
    },
    '80' : function(){
        this.currentSpeedX = this.currentSpeedY = this.rotationSpeed = 0;
    },
    '32' : function(){
        if (this.attackTimer > this.attackRate){
            this.weapon.fire(this);
            this.attackTimer = 0;
        }
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

    },
    '101': function(time){
        var halfWidth = bounds.width >> 1,
            halfHeight = bounds.height >> 1,
            distX = engy.controls.mouseMap.mouseX - halfWidth,
            distY = - engy.controls.mouseMap.mouseY + halfHeight,
            sin = this.sin,
            cos = this.cos;
        this.targetAngle = Math.atan2( -distX * sin + cos * distY, distX * cos + sin * distY);
    },
    '49' : function(){
        this.weapon = bullet;
    },
    '50' : function(){
        this.weapon = beam;
    },
    '51' : function(){
        this.weapon = rocket;
    }
};

Ship.prototype.action = function(time){

    this.track(time);
    this.move(time);

    this.rotationAngle += this.rotationSpeed * time;

    if (this.rotationAngle < -3.14){
        this.rotationAngle += 6.28;
    } else if (this.rotationAngle > 3.14){
        this.rotationAngle -= 6.28;
    }

    this.x += this.currentSpeedX * time;
    this.y += this.currentSpeedY * time;

    this.attackTimer += time;

    this.geometry.position.x = this.x;
    this.geometry.position.y = this.y;
    this.geometry.rotation.z = this.rotationAngle;
//    this.geometry.rotation.x = this.rotationSpeed;
    this.geometry.rotation.x = -this.rotationSpeed*15; // TODO rotation around the own axis while rotating on Z
};