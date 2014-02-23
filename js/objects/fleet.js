function Fleet(){
    this.init.apply(this, arguments);
    return this;
}

Fleet.prototype.init = function(x, y, target){
    this.members = [];

    this.target = target || null;
    this.targetDistance = 0;
    this.targetAngle = 0;

    this.x = x || 0;
    this.y = y || 0;

    this.const = {
        attackDistance : 400
    };

};

Fleet.prototype.add = function(ship){
    //add ship to fleet
    this.members.push(ship);
    ship.fleet = this;
};

Fleet.prototype.reportTarget = function(ship){
    //TODO ship can add own target to fleet targets list
};

Fleet.prototype.requestTarget = function(ship){
    //TODO ship can request target if own target destroyed or not exists
};

Fleet.prototype.requestAssistance = function(ship){
    //TODO ship can ask for assistance if his own enemy too strong
};

Fleet.prototype.remove = function(ship){
    //remove ship
    var position = this.members.indexOf(ship);
    if (position >= 0){
        if (position == this.members.length-1){
            this.members.pop();
        } else {
            this.members[position] = this.members.pop();
        }
    }
};

Fleet.prototype.update = function(){
    //cycle through all members
    if (!this.target) {
        return false;
    }

    var distX = this.target.x - this.x,
        distY = this.target.y - this.y,
        member;


    this.targetDistance = Math.sqrt(Math.pow(distX,2) + Math.pow(distY,2));
    this.targetAngle = Math.atan2(distY, distX);

    window.fl = [this.x, this.y, this.targetAngle].join(' ') ;

    this.x = 100 * Math.cos(this.targetAngle) + this.members[0].x;
    this.y = 100 * Math.sin(this.targetAngle) + this.members[0].y;

    if (this.targetDistance < this.const.attackDistance) {
        for (var i = 0; i < this.members.length; i++) {
            member = this.members[i];
            member.target = this.target;
            member.attackMode = true;
            member.avoidMode = true;
        }
    } else {
        for (var i = 1; i < this.members.length; i++) {
            member = this.members[i];
            member.attackMode = false;
            member.avoidMode = false;
            member.target = {
                x : this.x + Math.cos(i) * ( i / 3 >> 0 ) * 50,
                y : this.y + Math.sin(i) * ( i / 3 >> 0) * 50,
                currentSpeedX : 0,
                currentSpeedY : 0
            }

        }
    }
    shaderFlame.fireByParams('bullet',this.x, this.y, 0, 0, 0, 0);
};