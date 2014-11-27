/* jshint newcap: false */

var Status = {
	"not_ready": 0,
	"ready": 1,
	"searching": 2,
	"paired": 3,
	"streaming": 4
};

function callStreamHandler(stream) {
	this.status = Status.streaming;
	this.fire("strangerfound", {stream: stream});
	// event versturen dat een connectie gemaakt is
}

function callCloseHandler() {
	this.fire("strangerleft");
	this.status = Status.searching;
}

function onPeerOpen(peerId) {
	console.log("peer open");
	this.peerId = peerId;
	this.socket.emit('peer_id', peerId);
	this.status = Status.searching;
	this.fire("connected");
}

function onPeerCall(call) {
	console.log("peer call");
	call.answer(this.stream);
	call.on('stream', callStreamHandler.bind(this));
	call.on('close', callCloseHandler.bind(this));
}

function initPeer() {
	console.log("init peer");
	this.peer = new Peer({key: this.peerapikey});
	this.peer.on('open', onPeerOpen.bind(this));
	this.peer.on('call', onPeerCall.bind(this));
}

function onConnectedStranger(stranger) {
	console.log("connected stranger");
	this.status = Status.paired;
	var call = this.peer.call(stranger.peerId, this.stream);
	call.on('stream', callStreamHandler.bind(this));
	call.on('close', callCloseHandler.bind(this));
}

function onSocketId(socketId) {
	console.log("init socket");
	this.socketId = socketId;
	initPeer.call(this);
}

/* GENERATING & READING URL */

function generateUrl(){
    console.log("generate ip");

    // vervangen door ip adres
    var random = Math.floor(Math.random() * (999 - 0 + 1)) + 0;

		//var rng = seedrandom('hello.');
		//console.log(rng());

		var randomCode = random; // met seed (als ip adres gebruikt wordt)
		this.socket.emit('urlid', randomCode);
		console.log("random url: http://localhost:3000/"+randomCode);
}

Polymer({

	//label: "connect",
	peerapikey: undefined,

	peer: undefined,
	urlid: undefined,
	//stream: undefined,

	socketId: undefined,
	peerId: undefined,

	status: Status.ready,

	statusChanged: function() {
		console.log("update status to " + this.status);
		this.socket.emit("update_status", this.status);
		if(this.Status === Status.paired)
		{
			this.fire("");
		}
	},

	urlidChanged: function() {
		console.log("urlid changed");
		if(!this.urlid){
			generateUrl.bind(this)();
			//generateUrl();
		}else{
			this.socket.emit('urlid', parseInt(this.urlid));
		}
	},

	ready: function(){
		this.socket = io('/');
		this.socket.on('socket_id', onSocketId.bind(this));
		this.socket.on("connected_stranger", onConnectedStranger.bind(this));
		//this.socket.emit('urlid', 33333);
	}

});
