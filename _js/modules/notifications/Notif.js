var socket;
var server = "http://localhost:3000";

function _initNotification(){
	console.log("[Notification] init notification");
	Notification.requestPermission(function (status) {
		if (Notification.permission !== status) {
			Notification.permission = status;
		}
		if (Notification.permission === 'granted') {
			console.log("granted");

		} else {
			console.log("not granted");
		}
	});
}

function _message(tekst){
	console.log("[Notification] notification: ", tekst);

	_initNotification();
	var ms = 4000;

	var n = new Notification("Nieuwe top 5!", {
		body: tekst + ' staat nu in de top 5!',
		icon: 'images/2.png'
	});
	n.onshow = function (){
		setTimeout(n.close.bind(n), ms);
	};
}

function _initSocket(){
	socket = io(server);
	socket.on('message', _message);
}

module.exports = (function(){
	console.log("[Notification]");
	socket = socket;
	_initSocket();
	_initNotification();
})();

