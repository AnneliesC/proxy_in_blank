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

		// lijst maken met strangers (clients zonder zichzelf)
		var strangers = _.filter(clients, function(stranger){
			return stranger.socketId !== client.socketId;
		});

		console.log("CLIENTS 2", strangers);

		if(client.status !== Status.searching){
			return;
		}

		var list = _.filter(strangers, function(stranger){
			return stranger.status === Status.searching && stranger.urlid === client.urlid;
		});

		console.log("LIST ", list);

		if(list.length === 0){
			setTimeout(search_stranger, 2000, socket);
		}else{
			var stranger = list[0];
			client.status = Status.paired;
			stranger.status = Status.paired;
			console.log('[Server] PAIR (peer id)', client.peerId, stranger.peerId);
			socket.emit('connected_stranger', stranger);
		}
	}

	io.on('connection', function(socket) {

		var client = {
			status: Status.not_ready,
			socketId: socket.id
		};

		clients.push(client);

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

		socket.on('urlid',function(urlid){
			console.log('[Server] urlid', urlid);
			client.urlid = urlid;
		});

		socket.emit("socket_id",client.socketId);

	});
};
