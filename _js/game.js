/* jshint newcap: false */

require("./modules/util/Polyfill");

var Util = require("./modules/util/Util");
var Comet = require("./modules/gameElements/Comet");
var Laser = require("./modules/gameElements/Laser");
var Headtracker = require("./modules/video/Headtracker");
var DetectClapping = require("./modules/audio/DetectClapping");

//var spaceship = document.getElementById("rocket");
var btnInfo = document.getElementById("btninfo");
var lblScore = document.getElementById("lblscore");
var lblTime = document.getElementById("lbltime");
var lblCountdown = document.getElementById("countdown");
var lblTips = document.getElementById("tips");
var svg = document.querySelector("svg");

var bounds,comets,lasers;
var countdownTime = 5;
var countdownInterval,timerInterval,cometsInterval;
var score,time;
var headtracker;

/* GAME LOGIC  */

function _updateLabels(){
	var minutes = Math.floor(time/60);
	var seconds = time - minutes * 60;
	if(minutes.toString().length === 1){minutes = "0"+minutes;}
	if(seconds.toString().length === 1){seconds = "0"+seconds;}

	lblScore.innerHTML = score;
	lblTime.innerHTML = minutes+":"+seconds;
}

function _createComet(){
  var comet = new Comet(Util.randomStartPointTop(bounds));
  comet.target = {x:comet.position.x,y:window.innerHeight+comet.radius*2};
	comet.move = true;
	bean.on(comet,"done",function(){
		svg.removeChild(comet.element);
		comets.splice(comets.indexOf(comet),1);
	});
	svg.appendChild(comet.element);
	comets.push(comet);

	for(var i=0;i<lasers.length;i++){
		lasers[i].comets = comets;
	}
}

function _createLaser(){
	var laser = new Laser({x:Headtracker.getSpaceshipPosition(),y:window.innerHeight-210},comets);
	laser.target = {x:laser.position.x,y:50};
	laser.move = true;
	bean.on(laser,"top",function(){
		svg.removeChild(laser.element);
		lasers.splice(lasers.indexOf(laser),1);
	});
	bean.on(laser,"hit",function(){
		svg.removeChild(laser.hit.element);
		comets.splice(comets.indexOf(laser.hit),1);
		svg.removeChild(laser.element);
		lasers.splice(lasers.indexOf(laser),1);
		score = score + 5;
		_updateLabels();
	});
	svg.appendChild(laser.element);
	lasers.push(laser);
}

function _resetGameSettings(){
	comets = [];
	lasers = [];
	score = 0;
	time = 0;
	lblScore.innerHTML = "0";
	lblTime.innerHTML = "00:00";
}

function _timer(){
	time = time + 1;
	score = score + 2;
	_updateLabels();
}

function _startGame(){
	console.log("[App] init game settings");
	cometsInterval = setInterval(_createComet, 2000);
	timerInterval = setInterval(_timer, 1000);
}

function _countdown(){
	countdownTime = countdownTime - 1;
	lblCountdown.innerHTML = countdownTime;
	if(countdownTime < 0){
		clearInterval(countdownInterval);
		document.getElementById("game").removeChild(lblCountdown);
		document.getElementById("game").removeChild(lblTips);
		_startGame();
	}
}

function _startCountDown(){
	_resetGameSettings();
	lblCountdown.innerHTML = countdownTime;
	countdownInterval = setInterval(_countdown, 1000);
}

/* CLICKHANDLERS */

function _btnInfoClickHandler(event){
	event.preventDefault();
}

/* AUDIO VIDEO STREAM  */

function _getUserMedia(){
	navigator.getUserMedia = (
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
}

function _userErrorHandler(error){
	console.log("[Game] webcam error");
}

function _initStream(stream){

	var detectClapping = new DetectClapping(stream);
	bean.on(detectClapping,"shoot", _createLaser);

	headtracker = new Headtracker(stream,"game");
	_startCountDown();
}

/* INIT */

function _init(){

	bounds = {
		width: window.innerWidth,
		height: window.innerHeight,
		border: 10
	};

	_getUserMedia();
	if (navigator.getUserMedia) {
		navigator.getUserMedia({audio: true, video: true}, _initStream, _userErrorHandler);
	}else{
		console.log("[Game] fallback");
	}

	btnInfo.addEventListener("click", _btnInfoClickHandler);
}

_init();
