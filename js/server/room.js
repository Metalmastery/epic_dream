/**
 * Created with JetBrains WebStorm.
 * User: ssa7
 * Date: 18.01.14
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */
function Room(name, creatorId) {
	this.members = [];
	this.name = name;
	this.creator = creatorId;

	return this;
}
function RoomController() {
	this.rooms = [];

	return this;
}
RoomController.prototype.create = function (name, creatorId) {
	var roomInstance = new Room(name, creatorId);
	roomInstance.members.push(creatorId);
	this.rooms.push(roomInstance)
};
RoomController.prototype.join = function (name, clientId) {
	var r,
		i = 0,
		l = this.rooms.length;
	for (i; i < l; i++) {
		r = this.rooms[i];
		if (r.name === name && r.members.indexOf(clientId) < 0) {
			r.members.push(clientId);
		}
	}
};
RoomController.prototype.leave = function (clientId) {
	var r, cIndex,
		i = 0,
		l = this.rooms.length;
	for (i; i < l; i++) {
		r = this.rooms[i];
		cIndex = r.members.indexOf(clientId);
		if (cIndex > 0) {
			r.members.splice(cIndex, 1);
		}
	}
};
RoomController.prototype.destroy = function (name) {
	var rs = this.rooms,
		i = 0,
		l = rs.length;
	for (i; i < l; i++) {
		if (rs[i].name === name) {
			return rs.splice(i, 1);
		}
	}
};
module.exports = RoomController;