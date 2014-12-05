/* jshint newcap: false */
/* globals Notification:true*/

require("./modules/util/Polyfill");

var Util = require("./modules/util/Util");
var Comet = require("./modules/gameElements/Comet");
var Laser = require("./modules/gameElements/Laser");
var Headtracker = require("./modules/video/Headtracker");
var DetectClapping = require("./modules/audio/DetectClapping");

var btnBack = document.getElementById("btnback");
var btnInfo = document.getElementById("btninfo");
var btnAgain = document.getElementById("btnagain");
var btnSend = document.getElementById("btnSend");
var chkNotifiable = document.getElementById("chkNotifiable");

var lblScore = document.getElementById("lblscore");
var lblTime = document.getElementById("lbltime");
var lblCountdown = document.getElementById("countdown");
var lblTips = document.getElementById("tips");
var svg = document.querySelector("svg");
var spaceship = document.getElementById("rocket");
var highscores = document.getElementById("highscores");

var bounds,comets,lasers;
var countdownTime = 5;
var gamePaused = false;
var countdownInterval,timerInterval,cometsInterval;
var score,time;
var headtracker;
var server = "http://localhost:3000";
var socket;

/* API */

function _httpGet(url)
{
    var xmlHttp = null;

    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

function _updateLabels(){
	var minutes = Math.floor(time/60);
	var seconds = time - minutes * 60;
	if(minutes.toString().length === 1){minutes = "0"+minutes;}
	if(seconds.toString().length === 1){seconds = "0"+seconds;}

	lblScore.innerHTML = score;
	lblTime.innerHTML = minutes+":"+seconds;
}

function _timer(){
	time = time + 1;
	score = score + 2;
	_updateLabels();
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
	if(gamePaused){ return; }
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

/* TIMERS */

function _setTimers(){
	cometsInterval = setInterval(_createComet, 2000);
	timerInterval = setInterval(_timer, 1000);
}

/* PAUSE - PLAY */

function _showHighscores(){
	highscores.setAttribute("class","show");
}

function _pauseGame(){
	gamePaused = true;
	Headtracker.stopHeadtracking();
	clearInterval(timerInterval);
	clearInterval(cometsInterval);

	for(var i=0;i<comets.length;i++){
		comets[i].move = false;
	}
}

function _resumeGame(){
	gamePaused = false;
	Headtracker.startHeadtracking();
	_setTimers();

	for(var i=0;i<comets.length;i++){
		comets[i].move = true;
	}
}

/* GAME LOGIC  */

function _resetGameSettings(){
	comets = [];
	lasers = [];
	score = 0;
	time = 0;
	lblScore.innerHTML = "0";
	lblTime.innerHTML = "00:00";
}

function _gameOver(){
	var users = $.parseJSON(_httpGet("./api/users"));

score = 60;
	var usersWithHigherScores = _.filter(users, function(user){
		return user.points >= score;
	});

	if(usersWithHigherScores.length <= 4){
		console.log("top5");
		document.getElementById("noTop5").setAttribute("class","display-none");
	}else{
		console.log("geen top5,loser");
		document.getElementById("top5").setAttribute("class","display-none");
		document.getElementById("noTop5").setAttribute("class","");
	}

	_pauseGame();
	document.getElementById("points").setAttribute("value",score);
	$(".gainedPoints").text(""+score);
	_showHighscores();
}

function _checkCollision(){
	var xPos = Headtracker.getSpaceshipPosition();

	for(var i=0; i<comets.length;i++){
		var comet = comets[i];
		if( ((comet.position.x + comet.radius > xPos - spaceship.offsetWidth/2) && (comet.position.x - comet.radius < xPos + spaceship.offsetWidth/2)) && comet.position.y - comet.radius > spaceship.offsetTop){
			_gameOver();
		}
	}
}

/* COUNTDOWN - START GAME */

function _btnInfoClickHandler(event){
	event.preventDefault();
	if(gamePaused){
		_resumeGame();
	}else{
		_pauseGame();
	}
}

function _startGame(){
	console.log("[App] init game settings");
	_setTimers();
	gamePaused = false;
	btnInfo.addEventListener("click", _btnInfoClickHandler);
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

function _btnSendClickHandler(event){
	//this.socket.emit("top5");
}

function _btnBackClickHandler(event){
	event.preventDefault();
	window.location = "./";
}

function _btnAgainClickHandler(event){
	event.preventDefault();
	window.location = "./game";
}

function _chkNotifiableClickHandler(event){
	if (!event.srcElement.checked){
		return;
	}
	Notification.requestPermission(function (status) {
			if (Notification.permission !== status) {
				Notification.permission = status;
			}
			if (Notification.permission === 'granted') {
				console.log("granted");
			} else {
				console.log("not granted");
				event.srcElement.checked = false;
			}
		});
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
		body: 'From: Annelies',
		icon: 'images/1.png'
	});
	n.onshow = function (){
		setTimeout(n.close.bind(n), ms);
	};
}

function _message(tekst){
	console.log("notification: ", tekst);

	_initNotification();
	//vanaf hier moet je eigenlijk luisteren of er een notificatie komt
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
	socket.on('registrated', _registrated);
	socket.on('message', _message);
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
	console.log("[Game] audio error");
}

function _initStream(stream){

	var detectClapping = new DetectClapping(stream);
	bean.on(detectClapping,"shoot", _createLaser);

	headtracker = new Headtracker(stream,"game");
	Headtracker.startHeadtracking();
	bean.on(headtracker,"moved",_checkCollision);
	if(highscores.getAttribute("class") !== "show"){ _startCountDown(); }
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
	btnAgain.addEventListener("click", _btnAgainClickHandler);
	btnBack.addEventListener("click", _btnBackClickHandler);
	btnSend.addEventListener("click", _btnSendClickHandler);
	chkNotifiable.addEventListener("click", _chkNotifiableClickHandler);
	_initSocket();
}

_init();
