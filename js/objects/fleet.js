function Fleet(){
    this.init.apply(this, arguments);
    return this;
}

Fleet.prototype.init = function(x, y, target){
    this.uniq = engy.collider.getId();

    this.members = [];
    this.membersWithTarget = [];
    this.membersWithoutTarget = [];

    // flags
    this.targetAdded = false;
    this.targetDestroyed = false;
    this.memberAdded = false;
    this.memberDestroyed = false;

    this.targetFleet = null;
    this.targets = [];
    if (target) {
        this.setTargetFleet(target);
    }

//    this.newTargets = [];

//    this.commander = null;

    this.centerX = 0;
    this.centerY = 0;

    this.x = x || 0;
    this.y = y || 0;

    this.const = {
        attackDistance : 400
    };

    console.log(this.uniq, 'FLEET CREATED');

};

Fleet.prototype.setTargetFleet = function(fleet){
    this.targetFleet = fleet;
    this.targets = fleet.members;
};

Fleet.prototype.updatePosition = function(ship){
    //TODO ship can add own target to fleet targets list
};

Fleet.prototype.reportTarget = function(reporter, target){
    //TODO ship can add own target to fleet targets list
    reporter.target = target;
    if (this.targets.indexOf(target) < 0 && !this.targetFleet) {
        this.changeTargetExistanceState(reporter, true);
        this.setTargetFleet(target.fleet);
        console.log(this.uniq, 'TARGET REPORTED');
    }
};

Fleet.prototype.reportTargetDestroyed = function(reporter, target){
    this.changeTargetExistanceState(reporter, false);
    var index = this.targets.indexOf(target);
    console.log('REPORT DESTROYED', this.targets.length);
    if (index >= 0){
        this.targets.splice(index, 1);
        console.log(this.targets.length);
        this.targetDestroyed = true;
    }
    if (this.targets.length == 0 && this.targetFleet){
        console.info('FLEET DESTROYED');
        alert(this.uniq + ' destroyed ' + this.targetFleet.uniq);
        this.targetFleet = null;
        this.targets.push(window.ship);
    }
};

Fleet.prototype.requestTarget = function(ship){
    //TODO ship can request target if own target destroyed or not exists
    this.changeTargetExistanceState(ship, false);
};

Fleet.prototype.requestAssistance = function(ship){
    //TODO ship can ask for assistance if his own enemy too strong
    if (this.members.length > 2) {
        this.members[this.members.length * Math.random() >> 0].target = ship;
    }
};

Fleet.prototype.changeTargetExistanceState = function(ship, state){
    var groupFrom = state ? this.membersWithoutTarget : this.membersWithTarget;
    var groupTo = state ? this.membersWithTarget : this.membersWithoutTarget;
    //remove ship
    var position = groupFrom.indexOf(ship),
        member;
    if (position >= 0){
        if (position == groupFrom.length-1){
            member = groupFrom.pop();
        } else {
            member = groupFrom[position] = groupFrom.pop();
        }
        groupTo.push(member);
    }
};

Fleet.prototype.add = function(ship){
    //add ship to fleet
    this.members.push(ship);
    ship.fleet = this;
    if (ship.target) {
        this.membersWithTarget.push(ship);
        this.reportTarget(ship.target);
    } else {
        this.membersWithoutTarget.push(ship);
    }
    console.log(this.uniq, 'FLEET MEMBER ADDED, TOTAL - ', this.members.length);
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
    var freeMember,
        targetIndex = 0;

    for (var i = 0; i < this.membersWithoutTarget.length; i++) {
        freeMember = this.membersWithoutTarget[i];
        freeMember.target = this.targets[targetIndex];
        targetIndex ++;
        if (targetIndex >= this.targets.length){
            targetIndex = 0;
        }


    }

};