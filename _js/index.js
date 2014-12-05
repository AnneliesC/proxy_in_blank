/* jshint newcap: false */

require("./modules/util/Polyfill");

var Headtracker = require("./modules/video/Headtracker");
var Notif = require("./modules/notifications/Notif");

var headtracker;
var btnStart = document.getElementById("btnstart");

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

/* INIT */

function init(){
	_getUserMedia();
	if (navigator.getUserMedia){
		navigator.getUserMedia({audio: true, video: true}, _initStream, _userErrorHandler);
	}else{
		console.log("[Index] fallback");
	}
	//_initSocket();
}

init();
