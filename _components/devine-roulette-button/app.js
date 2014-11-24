/* jshint newcap: false */

var Status = {
	"not_ready": 0,
	"ready": 1,
	"searching": 2,
	"paired": 3,
	"streaming": 4
};

function onPeerOpen(peerId) {
	this.peerId = peerId;
	this.socket.emit('peer_id', peerId);
	this.status = Status.ready;
	this.fire("connected");
}

function clickHandler(e){
	e.preventDefault();
	if(this.status !== Status.not_ready){
		this.status = Status.searching;
	}
}

function callStreamHandler(stream) {
	this.status = Status.streaming;
	this.fire("strangerfound", {stream: stream});
}

function callCloseHandler() {
	this.fire("strangerleft");
	this.status = Status.searching;
}

function onConnectedStranger(stranger) {
	this.status = Status.paired;
	var call = this.peer.call(stranger.peerId, this.stream);
	call.on('stream', callStreamHandler.bind(this));
	call.on('close', callCloseHandler.bind(this));
}

function onPeerCall(call) {
	call.answer(this.stream);
	call.on('stream', callStreamHandler.bind(this));
	call.on('close', callCloseHandler.bind(this));
}

function initPeer() {
	this.peer = new Peer({key: this.peerapikey});
	this.peer.on('open', onPeerOpen.bind(this));
	this.peer.on('call', onPeerCall.bind(this));
}

function onSocketId(socketId) {
	this.socketId = socketId;
	initPeer.call(this);
}

Polymer({

	label: "connect",
	peerapikey: undefined,

	peer: undefined,
	stream: undefined,

	socketId: undefined,
	peerId: undefined,

	status: Status.not_ready,

	statusChanged: function() {
		this.socket.emit("update_status", this.status);
		if(this.status !== Status.not_ready){
			this.$.connect.classList.remove("disabled");
		}else{
			this.$.connect.classList.add("disabled");
		}
	},

	ready: function(){
		this.$.connect.classList.add("disabled");
		this.$.connect.addEventListener("click", clickHandler.bind(this));
	},

	connect: function(stream) {
		this.stream = stream;
		this.socket = io('/');
		this.socket.on('socket_id', onSocketId.bind(this));
		this.socket.on("connected_stranger", onConnectedStranger.bind(this));
	}

});
