/**
 * Created with JetBrains WebStorm.
 * User: ssa7
 * Date: 18.01.14
 * Time: 23:01
 * To change this template use File | Settings | File Templates.
 */
module.exports = function (name, creatorId) {
	this.roomName = name;
	this.members = [];

	this.join = function (memberId) {
		this.members.push(memberId);
	};

	this.left = function (memberId) {

	};
	if (creatorId) {
		console.log('creator ' + creatorId + ' joined room');
		this.join(creatorId);
	}
	return this;
};