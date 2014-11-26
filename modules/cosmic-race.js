module.exports = function(server){

	var io = require('socket.io')(server);
	var _ = require("lodash");

	var Status = require('../classes/Status.json');

	var clients = [];

	function search_stranger(socket){

		console.log('[Server] search_stranger (socket id)', socket.id);

		var client = _.findWhere(clients,{socketId: socket.id});
		if(client === undefined){
			return;
		}

		if(client.status !== Status.searching){
			return;
		}

		var list = _.filter(clients, function(client){
			return client.socketId !== socket.id && client.status === Status.searching;
		});

		if(list.length === 0){
			setTimeout(search_stranger, 2000, socket);
		}else{
			var stranger = list[_.random(0,list.length-1)];
			client.status = Status.paired;
			stranger.status = Status.paired;
			console.log('[Server] pair (peer id)', client.peerId, stranger.peerId);
			socket.emit('connected_stranger', stranger);
		}

	}

	io.on('connection', function(socket) {

		var client = {
			status: Status.not_ready,
			socketId: socket.id
		};

		clients.push(client);

		socket.emit("socket_id",client.socketId);

		socket.on('disconnect', function() {
			clients = _.filter(clients, function(client) {
				return client.socketId !== socket.id;
			});
		});

		socket.on('peer_id',function(peerId){
			console.log('[Server] peer_id', peerId);
			client.peerId = peerId;
		});

		socket.on('update_status',function(status){
			console.log('[Server] update_status', status);
			client.status = status;
			if(client.status === Status.searching){
				search_stranger(socket);
			}
		});

	});
};
