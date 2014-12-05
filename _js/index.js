/* jshint newcap: false */
/* globals Notification:true*/

require("./modules/util/Polyfill");

var Headtracker = require("./modules/video/Headtracker");

var headtracker;
var btnStart = document.getElementById("btnstart");
var server = "http://localhost:3000";
var socket;

/* CLICKHANDLERS */

function _btnStartClickHandler(event){
	event.preventDefault();
	window.location = "./game";
}

/* HEAD TRACKING */

function _getUserMedia(){
	navigator.getUserMedia = (
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
}

function _userErrorHandler(error){
	console.log("[Index] webcam error");
}

function _initStream(stream){
	headtracker = new Headtracker(stream,"index");
	Headtracker.startHeadtracking();
	btnStart.addEventListener("click", _btnStartClickHandler);
}

/* SOCKET IO & NOTIFICATIONS*/

function _initNotification(){
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

function _registrated(tekst){
	console.log("notification: ", tekst);

	_initNotification();
	//vanaf hier moet je eigenlijk luisteren of er een notificatie komt
	var ms = 4000;

	var n = new Notification(tekst, {
		body: 'From: MUFFDIVER',
		icon: 'images/1.png'
	});
	n.onshow = function (){
		setTimeout(n.close.bind(n), ms);
	};
}

function _initSocket(){
	socket = io(server);
	socket.on('registrated', _registrated);
}

/* INIT */

function init(){
	_getUserMedia();
	if (navigator.getUserMedia){
		navigator.getUserMedia({audio: true, video: true}, _initStream, _userErrorHandler);
	}else{
		console.log("[Index] fallback");
	}
	_initSocket();
}

init();
